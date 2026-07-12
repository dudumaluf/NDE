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
    force: bool = typer.Option(False, "--force", help="Re-transcreve mesmo se já existir."),
    workers: int = typer.Option(3, help="Transcrições em paralelo."),
) -> None:
    """Transcreve os vídeos baixados (config: modelo, word-level, diarização)."""
    from . import transcribe as tr

    cfg = load_config()
    conn = dbm.connect(cfg.db_path())

    if ids:
        queue = ids
    else:
        status_filter = (
            "status IN ('fetched','transcribed','extracted')" if force else "status = 'fetched'"
        )
        rows = conn.execute(
            f"SELECT id FROM videos WHERE {status_filter} ORDER BY first_seen_at"
        ).fetchall()
        queue = [r["id"] for r in rows]
        if not all_ and limit == 0:
            limit = 1  # default conservador: um por vez até confiarmos no custo

    if limit:
        queue = queue[:limit]
    if not queue:
        console.print("Nada a transcrever — rode fetch antes ou fila já processada.")
        return

    from concurrent.futures import ThreadPoolExecutor, as_completed

    conn.close()  # cada worker abre a própria conexão (sqlite × threads)

    def worker(video_id: str) -> tuple[str, str, str]:
        wconn = dbm.connect(cfg.db_path())
        try:
            if tr.has_transcript(cfg, video_id) and not force:
                dbm.advance_status(wconn, video_id, "transcribed")
                wconn.commit()
                return video_id, "skip", "já transcrito"
            summary = tr.transcribe_video(cfg, video_id)
            dbm.advance_status(wconn, video_id, "transcribed")
            wconn.commit()
            msg = (
                f"{summary['segments']} segmentos · {summary['words']} palavras · "
                f"{summary['speakers']} falantes · {summary['elapsed_s']}s"
            )
            return video_id, "ok", msg
        except Exception as exc:  # noqa: BLE001 — registrar e seguir (resumível)
            dbm.set_error(wconn, video_id, str(exc))
            wconn.commit()
            return video_id, "fail", str(exc)[:200]
        finally:
            wconn.close()

    ok, failed = 0, 0
    console.print(f"Transcrevendo {len(queue)} vídeos ({workers} em paralelo, {cfg.transcribe.model}) …")
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(worker, vid): vid for vid in queue}
        for fut in as_completed(futures):
            vid, st, msg = fut.result()
            if st == "fail":
                failed += 1
                console.print(f"[red]falhou[/red] {vid}: {msg}")
            else:
                ok += 1
                style = "dim" if st == "skip" else "green"
                console.print(f"[{style}]{st}[/{style}] {vid} · {msg}")

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
    workers: int = typer.Option(3, help="Pessoas em paralelo."),
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

    from concurrent.futures import ThreadPoolExecutor, as_completed

    def worker(p) -> tuple[str, str, str]:
        try:
            extractions = []
            for s in sorted(p.sources, key=lambda s: s.part):
                meta = {
                    "video_id": s.video_id,
                    "person_name": p.person.display_name,
                    "part": s.part,
                    "parts_total": s.parts_total,
                    "title": s.title,
                }
                extractions.append(ex.extract_video(cfg, tax, meta, force=force))
            merged = ppl.merge_extractions(p, extractions)
            ppl.save_person(cfg, merged)
            rejected = sum(e.quotes_rejected for e in extractions)
            return p.id, "ok", (
                f"{len(merged.elements)} elementos · "
                f"{sum(len(e.beats) for e in extractions)} beats · "
                f"tom {merged.tone.valence} · {rejected} quotes rejeitadas"
            )
        except Exception as exc:  # noqa: BLE001 — resumível
            return p.id, "fail", str(exc)[:220]

    ok, failed = 0, 0
    console.print(f"Extraindo {len(persons)} pessoas ({workers} em paralelo, {cfg.extract.model}) …")
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(worker, p): p.id for p in persons}
        for fut in as_completed(futures):
            pid, st, msg = fut.result()
            if st == "fail":
                failed += 1
                console.print(f"[red]falhou[/red] {pid}: {msg}")
            else:
                ok += 1
                console.print(f"[green]pessoa ok[/green] {pid} · {msg}")

    console.print(f"[bold]{ok} pessoas ok · {failed} falhas[/bold]")
    if failed:
        raise typer.Exit(2)


@app.command()
def demographics(
    slugs: list[str] = typer.Argument(None, help="Pessoas específicas (default: pendentes)."),
    all_: bool = typer.Option(False, "--all", help="Roda em todas as pessoas."),
    limit: int = typer.Option(0, help="Máximo de pessoas nesta execução."),
    dry_run: bool = typer.Option(False, "--dry-run", help="Só estima tokens/custo (req. 4)."),
    force: bool = typer.Option(False, "--force", help="Re-extrai mesmo com cache válido."),
    workers: int = typer.Option(3, help="Pessoas em paralelo."),
) -> None:
    """Passada complementar barata: metadados demográficos declarados (1 chamada/pessoa)."""
    from . import demographics as dg
    from . import people as ppl

    cfg = load_config()

    persons = [p for p in ppl.list_people(cfg) if p.sources]
    if slugs:
        persons = [p for p in persons if p.id in set(slugs)]
    else:
        if not force:
            persons = [p for p in persons if p.demographics_version != dg.cache_key()]
        if not all_ and limit == 0:
            limit = 1  # default conservador: uma pessoa por vez
    if limit:
        persons = persons[:limit]
    if not persons:
        console.print("Nada a fazer — todas as pessoas já têm demographics desta versão.")
        return

    if dry_run:
        est = dg.dry_run_estimate(cfg, persons)
        console.print_json(json.dumps(est, ensure_ascii=False))
        return

    from concurrent.futures import ThreadPoolExecutor, as_completed

    usages: list[dict] = []

    def worker(p) -> tuple[str, str, str, dict]:
        try:
            updated, usage = dg.extract_demographics(cfg, p)
            ppl.save_person(cfg, updated)
            d = updated.demographics
            filled = sum(
                1 for v in d.model_dump(exclude={"sexo_fonte"}).values() if v is not None
            )
            resumo = ", ".join(
                s for s in (
                    d.sexo,
                    str(d.ano_evento) if d.ano_evento else None,
                    d.local_evento,
                    d.profissao,
                ) if s
            )
            return p.id, "ok", f"{filled}/8 campos · {resumo or 'nada declarado'}", usage
        except Exception as exc:  # noqa: BLE001 — resumível
            return p.id, "fail", str(exc)[:220], {}

    ok, failed = 0, 0
    console.print(f"Demographics de {len(persons)} pessoas ({workers} em paralelo, {dg.MODEL}) …")
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(worker, p): p.id for p in persons}
        for fut in as_completed(futures):
            pid, st, msg, usage = fut.result()
            usages.append(usage)
            if st == "fail":
                failed += 1
                console.print(f"[red]falhou[/red] {pid}: {msg}")
            else:
                ok += 1
                console.print(f"[green]ok[/green] {pid} · {msg}")

    console.print(
        f"[bold]{ok} pessoas ok · {failed} falhas · "
        f"custo real ≈ US$ {dg.real_cost_usd(usages):.2f}[/bold]"
    )
    if failed:
        raise typer.Exit(2)


@app.command()
def arc(
    slugs: list[str] = typer.Argument(None, help="Pessoas específicas (default: pendentes)."),
    all_: bool = typer.Option(False, "--all", help="Roda em todas as pessoas."),
    limit: int = typer.Option(0, help="Máximo de pessoas nesta execução."),
    dry_run: bool = typer.Option(False, "--dry-run", help="Só estima tokens/custo (req. 4)."),
    force: bool = typer.Option(False, "--force", help="Re-extrai mesmo com cache válido."),
    workers: int = typer.Option(3, help="Pessoas em paralelo."),
) -> None:
    """Passada complementar barata: arco emocional por beat + timeline normalizada."""
    from . import arc as ar
    from . import people as ppl

    cfg = load_config()

    persons = [p for p in ppl.list_people(cfg) if p.sources and p.beats]
    if slugs:
        persons = [p for p in persons if p.id in set(slugs)]
    else:
        if not force:
            persons = [p for p in persons if p.arc_version != ar.cache_key(p)]
        if not all_ and limit == 0:
            limit = 1  # default conservador: uma pessoa por vez
    if limit:
        persons = persons[:limit]
    if not persons:
        console.print("Nada a fazer — todas as pessoas já têm arc desta versão.")
        return

    if dry_run:
        est = ar.dry_run_estimate(cfg, persons)
        console.print_json(json.dumps(est, ensure_ascii=False))
        return

    from concurrent.futures import ThreadPoolExecutor, as_completed

    usages: list[dict] = []

    def worker(p) -> tuple[str, str, str, dict]:
        try:
            updated, usage, n_missing = ar.extract_arc(cfg, p)
            ppl.save_person(cfg, updated)
            a = updated.arc
            resumo = (
                f"{len(a.beats_emotion)} beats · entrada {a.entrada.valence} → "
                f"saída {a.saida.valence} · virada no beat {a.virada}"
                + (f" · [yellow]{n_missing} preenchidos por vizinho[/yellow]" if n_missing else "")
            )
            return p.id, "ok", resumo, usage
        except Exception as exc:  # noqa: BLE001 — resumível
            return p.id, "fail", str(exc)[:220], {}

    ok, failed = 0, 0
    console.print(f"Arco emocional de {len(persons)} pessoas ({workers} em paralelo, {ar.MODEL}) …")
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(worker, p): p.id for p in persons}
        for fut in as_completed(futures):
            pid, st, msg, usage = fut.result()
            usages.append(usage)
            if st == "fail":
                failed += 1
                console.print(f"[red]falhou[/red] {pid}: {msg}")
            else:
                ok += 1
                console.print(f"[green]ok[/green] {pid} · {msg}")

    console.print(
        f"[bold]{ok} pessoas ok · {failed} falhas · "
        f"custo real ≈ US$ {ar.real_cost_usd(usages):.2f}[/bold]"
    )
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
def analyze(
    no_names: bool = typer.Option(False, "--no-names", help="Pula a nomeação de clusters via LLM."),
) -> None:
    """Embeddings, layout UMAP 3D/2D, clusters, grafo, co-ocorrências, temas de motivos."""
    from .analyze import run_analysis

    cfg = load_config()
    console.print(f"Analisando corpus… (modelo: {cfg.embeddings.model}, local)")
    result = run_analysis(cfg, with_names=not no_names)
    console.print(
        f"[green]ok[/green] {len(result['people'])} pessoas · "
        f"{len(result['clusters'])} núcleos · {len(result['edges'])} fios · "
        f"{len(result['motif_themes'])} temas emergentes transversais"
    )
    for c in result["clusters"]:
        console.print(f"  núcleo {c['id']}: [bold]{c['label']}[/bold] ({c['size']} pessoas)")


@app.command()
def export(
    allow_unreviewed: bool = typer.Option(
        False, "--allow-unreviewed", help="Exporta pessoas não revisadas (prototipagem)."
    ),
    no_audio: bool = typer.Option(False, "--no-audio", help="Pula os cortes de áudio."),
) -> None:
    """Gera o export/ completo (contrato com a experiência 3D, doc 02 §10)."""
    from .export import run_export

    cfg = load_config()
    console.print("Gerando export/ …")
    manifest = run_export(cfg, allow_unreviewed=allow_unreviewed, with_audio=not no_audio)
    c = manifest["counts"]
    console.print(
        f"[green]ok[/green] {c['people']} pessoas · {c['beats']} beats · "
        f"hash {manifest['content_hash']} → {cfg.root / cfg.paths.export}"
    )


@app.command()
def review(port: int = typer.Option(8777, help="Porta do servidor local.")) -> None:
    """Sobe a UI local de revisão (dashboard, pessoas, áudio, aprovar/editar)."""
    from . import review as rv

    console.print(f"[bold]acervo review[/bold] → http://localhost:{port}  (Ctrl+C para sair)")
    rv.run(port)


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
