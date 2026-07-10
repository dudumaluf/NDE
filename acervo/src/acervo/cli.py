"""CLI do acervo (doc 02 §5). Marcos A0: scan, fetch, status."""

from __future__ import annotations

import json

import typer
from rich.console import Console
from rich.table import Table

from . import db as dbm
from .config import load_config
from . import ytdl

app = typer.Typer(help="acervo — pipeline de dados do LIMIAR", no_args_is_help=True)
console = Console()


@app.command()
def scan(
    resolve_from: str = typer.Option(
        "", help="ID de um vídeo do canal para resolver a URL do canal (primeira vez)."
    ),
) -> None:
    """Lista todos os vídeos do canal e registra os novos na fila (status raw)."""
    cfg = load_config()
    conn = dbm.connect(cfg.db_path())

    channel_url = cfg.channel.url or dbm.kv_get(conn, "channel_url")
    if not channel_url:
        if not resolve_from:
            console.print(
                "[red]Canal não configurado.[/red] Preencha channel.url no "
                "acervo.config.yaml ou rode: acervo scan --resolve-from <video_id>"
            )
            raise typer.Exit(1)
        channel_url, channel_name = ytdl.resolve_channel_url(resolve_from)
        dbm.kv_set(conn, "channel_url", channel_url)
        dbm.kv_set(conn, "channel_name", channel_name)
        console.print(
            f"Canal resolvido: [bold]{channel_name}[/bold] → {channel_url}\n"
            f"(gravado no acervo.db; opcionalmente cole em channel.url no YAML)"
        )

    console.print(f"Escaneando {channel_url}/videos …")
    videos = ytdl.list_channel_videos(channel_url)
    new = 0
    for v in videos:
        if dbm.upsert_video(conn, v["id"], v["title"], v["duration_s"]):
            new += 1
    conn.commit()

    total = conn.execute("SELECT COUNT(*) AS n FROM videos").fetchone()["n"]
    console.print(
        f"[green]{len(videos)} vídeos no canal[/green] · {new} novos registrados · "
        f"{total} no total na fila"
    )


@app.command()
def fetch(
    ids: list[str] = typer.Argument(None, help="IDs específicos (default: pendentes)."),
    all_: bool = typer.Option(False, "--all", help="Baixa todos os pendentes."),
    limit: int = typer.Option(0, help="Máximo de vídeos a baixar nesta execução."),
) -> None:
    """Baixa áudio + meta.json dos vídeos pendentes (status raw)."""
    cfg = load_config()
    conn = dbm.connect(cfg.db_path())

    if ids:
        rows = [
            conn.execute("SELECT id, status FROM videos WHERE id = ?", (i,)).fetchone()
            for i in ids
        ]
        missing = [i for i, r in zip(ids, rows) if r is None]
        if missing:
            console.print(f"[red]IDs fora da fila (rode scan antes): {missing}[/red]")
            raise typer.Exit(1)
        queue = [r["id"] for r in rows]
    else:
        rows = conn.execute(
            "SELECT id FROM videos WHERE status = 'raw' ORDER BY first_seen_at"
        ).fetchall()
        queue = [r["id"] for r in rows]
        if not all_ and limit == 0:
            limit = 3  # default conservador do A0

    if limit:
        queue = queue[:limit]
    if not queue:
        console.print("Nada a baixar — fila vazia ou tudo já fetched.")
        return

    ok, failed = 0, 0
    for video_id in queue:
        dest = cfg.data_dir() / video_id
        audio = ytdl.audio_file_of(dest)
        meta_file = dest / "meta.json"
        if audio and meta_file.exists():
            dbm.advance_status(conn, video_id, "fetched")
            conn.commit()
            console.print(f"[dim]{video_id} já baixado — pulando (idempotente)[/dim]")
            ok += 1
            continue
        try:
            console.print(f"Baixando {video_id} …")
            meta = ytdl.fetch_audio_and_meta(video_id, dest, cfg.fetch.audio_format)
            dbm.advance_status(conn, video_id, "fetched")
            conn.commit()
            console.print(
                f"[green]ok[/green] {video_id} · {meta.get('title', '?')[:60]} · "
                f"{(meta.get('duration_s') or 0) / 60:.0f} min"
            )
            ok += 1
        except Exception as exc:  # noqa: BLE001 — registrar e seguir (resumível)
            dbm.set_error(conn, video_id, str(exc))
            conn.commit()
            console.print(f"[red]falhou[/red] {video_id}: {exc}")
            failed += 1

    console.print(f"\n[bold]{ok} ok · {failed} falhas[/bold]")
    if failed:
        raise typer.Exit(2)


@app.command()
def transcribe(
    ids: list[str] = typer.Argument(None, help="IDs específicos (default: pendentes)."),
    all_: bool = typer.Option(False, "--all", help="Transcreve todos os fetched."),
    limit: int = typer.Option(0, help="Máximo de vídeos nesta execução."),
) -> None:
    """Transcreve os vídeos baixados (fal wizper, pt, timestamps por palavra)."""
    from . import transcribe as tr

    cfg = load_config()
    conn = dbm.connect(cfg.db_path())

    if ids:
        queue = ids
    else:
        rows = conn.execute(
            "SELECT id FROM videos WHERE status = 'fetched' ORDER BY first_seen_at"
        ).fetchall()
        queue = [r["id"] for r in rows]
        if not all_ and limit == 0:
            limit = 1  # default conservador: um por vez até confiarmos no custo

    if limit:
        queue = queue[:limit]
    if not queue:
        console.print("Nada a transcrever — rode fetch antes ou fila já processada.")
        return

    ok, failed = 0, 0
    for video_id in queue:
        if tr.has_transcript(cfg, video_id):
            dbm.advance_status(conn, video_id, "transcribed")
            conn.commit()
            console.print(f"[dim]{video_id} já transcrito — pulando (idempotente)[/dim]")
            ok += 1
            continue
        try:
            console.print(f"Transcrevendo {video_id} … (upload + wizper)")
            summary = tr.transcribe_video(cfg, video_id)
            dbm.advance_status(conn, video_id, "transcribed")
            conn.commit()
            console.print(
                f"[green]ok[/green] {video_id} · {summary['chars']} chars · "
                f"{summary['chunks']} chunks · áudio até {summary['last_end']}s · "
                f"{summary['elapsed_s']}s de processamento"
            )
            ok += 1
        except Exception as exc:  # noqa: BLE001 — registrar e seguir (resumível)
            dbm.set_error(conn, video_id, str(exc))
            conn.commit()
            console.print(f"[red]falhou[/red] {video_id}: {exc}")
            failed += 1

    console.print(f"\n[bold]{ok} ok · {failed} falhas[/bold]")
    if failed:
        raise typer.Exit(2)


@app.command()
def group() -> None:
    """Agrupa vídeos transcritos em PESSOAS (padrão 'N/M – ... EQM de Nome')."""
    from . import people as ppl
    from .group import group_videos

    cfg = load_config()
    conn = dbm.connect(cfg.db_path())
    channel = dbm.kv_get(conn, "channel_name") or ""

    rows = conn.execute(
        "SELECT id, title, duration_s FROM videos "
        "WHERE status IN ('transcribed','extracted','reviewed','exported')"
    ).fetchall()
    groups = group_videos([dict(r) for r in rows])

    table = Table(title="pessoas agrupadas")
    table.add_column("slug")
    table.add_column("nome")
    table.add_column("partes", justify="right")
    table.add_column("min", justify="right")
    for slug, g in sorted(groups.items()):
        person = ppl.upsert_grouped(cfg, slug, g, channel)
        total_min = sum((v.get("duration_s") or 0) for v in g["videos"]) / 60
        parts = f"{len(g['videos'])}/{g['videos'][0]['total']}"
        table.add_row(person.id, person.person.display_name, parts, f"{total_min:.0f}")
    console.print(table)
    console.print(f"[green]{len(groups)} pessoas[/green] em data/people/")


@app.command()
def extract(
    slugs: list[str] = typer.Argument(None, help="Pessoas específicas (default: pendentes)."),
    all_: bool = typer.Option(False, "--all", help="Extrai todas as pessoas agrupadas."),
    limit: int = typer.Option(0, help="Máximo de pessoas nesta execução."),
    dry_run: bool = typer.Option(False, "--dry-run", help="Só estima tokens/custo (req. 4)."),
    force: bool = typer.Option(False, "--force", help="Ignora cache de extração por vídeo."),
) -> None:
    """Extrai beats/elementos/quotes por pessoa (fal openrouter/router, 2 passadas)."""
    from . import extract as ex
    from . import people as ppl

    cfg = load_config()
    tax = ex.load_taxonomy(cfg)

    persons = ppl.list_people(cfg)
    if slugs:
        persons = [p for p in persons if p.id in set(slugs)]
    else:
        persons = [p for p in persons if p.status == "grouped"]
        if not all_ and limit == 0:
            limit = 1  # default conservador: uma pessoa por vez
    if limit:
        persons = persons[:limit]
    if not persons:
        console.print("Nada a extrair — rode `acervo group` antes, ou tudo já processado.")
        return

    videos_meta = []
    for p in persons:
        for s in p.sources:
            videos_meta.append(
                {
                    "video_id": s.video_id,
                    "person_name": p.person.display_name,
                    "part": s.part,
                    "parts_total": s.parts_total,
                    "title": s.title,
                }
            )

    if dry_run:
        est = ex.dry_run_estimate(cfg, tax, videos_meta)
        console.print_json(json.dumps(est, ensure_ascii=False))
        return

    ok, failed = 0, 0
    for p in persons:
        try:
            console.print(f"[bold]{p.person.display_name}[/bold] ({len(p.sources)} partes)")
            extractions = []
            for s in sorted(p.sources, key=lambda s: s.part):
                console.print(f"  extraindo {s.video_id} (parte {s.part}/{s.parts_total}) …")
                meta = {
                    "video_id": s.video_id,
                    "person_name": p.person.display_name,
                    "part": s.part,
                    "parts_total": s.parts_total,
                    "title": s.title,
                }
                extv = ex.extract_video(cfg, tax, meta, force=force)
                console.print(
                    f"    [green]ok[/green] {len(extv.elements)} elementos · "
                    f"{len(extv.beats)} beats · {len(extv.emergent_motifs)} motivos · "
                    f"{extv.quotes_rejected} quotes rejeitadas"
                )
                extractions.append(extv)
            merged = ppl.merge_extractions(p, extractions)
            ppl.save_person(cfg, merged)
            console.print(
                f"  [green]pessoa ok[/green] → {len(merged.elements)} elementos únicos, "
                f"tom {merged.tone.valence}\n"
            )
            ok += 1
        except Exception as exc:  # noqa: BLE001 — resumível
            console.print(f"  [red]falhou[/red] {p.id}: {exc}\n")
            failed += 1

    console.print(f"[bold]{ok} pessoas ok · {failed} falhas[/bold]")
    if failed:
        raise typer.Exit(2)


@app.command()
def status() -> None:
    """Contagem por status + últimos erros (visão rápida da fila)."""
    cfg = load_config()
    conn = dbm.connect(cfg.db_path())

    counts = dbm.counts_by_status(conn)
    table = Table(title="acervo — fila")
    table.add_column("status")
    table.add_column("vídeos", justify="right")
    for st in dbm.STATUS_ORDER:
        if st in counts:
            table.add_row(st, str(counts[st]))
    console.print(table)

    from . import people as ppl

    persons = ppl.list_people(cfg)
    if persons:
        pcounts: dict[str, int] = {}
        for p in persons:
            pcounts[p.status] = pcounts.get(p.status, 0) + 1
        ptable = Table(title="acervo — pessoas")
        ptable.add_column("status")
        ptable.add_column("pessoas", justify="right")
        for st in ppl.STATUS_ORDER:
            if st in pcounts:
                ptable.add_row(st, str(pcounts[st]))
        console.print(ptable)

    name = dbm.kv_get(conn, "channel_name")
    url = dbm.kv_get(conn, "channel_url") or cfg.channel.url
    if url:
        console.print(f"canal: [bold]{name or '?'}[/bold] · {url}")

    errors = conn.execute(
        "SELECT id, error FROM videos WHERE error IS NOT NULL LIMIT 5"
    ).fetchall()
    if errors:
        console.print("[red]erros recentes:[/red]")
        for row in errors:
            console.print(f"  {row['id']}: {row['error'][:100]}")


@app.command()
def meta(video_id: str) -> None:
    """Mostra o meta.json de um vídeo baixado."""
    cfg = load_config()
    meta_file = cfg.data_dir() / video_id / "meta.json"
    if not meta_file.exists():
        console.print(f"[red]{meta_file} não existe — rode fetch antes.[/red]")
        raise typer.Exit(1)
    data = json.loads(meta_file.read_text(encoding="utf-8"))
    data["description"] = (data.get("description") or "")[:200] + "…"
    console.print_json(json.dumps(data, ensure_ascii=False))
