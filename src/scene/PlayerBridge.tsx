import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { vatPlayer } from "../vat/VatClipPlayer";
import { playStoryArc } from "../vat/storyArc";
import { qpBool, qpHas, qpNum } from "../lib/urlParams";

/**
 * Único lugar que avança o relógio do player (evita update duplo) e aplica
 * o estado inicial vindo da URL — inclusive estados congelados para
 * screenshots determinísticos (?clipA=1&frameA=30&clipB=3&frameB=40&blend=0.5).
 */
export function PlayerBridge() {
  useEffect(() => {
    if (qpHas("clipA") || qpHas("blend")) {
      vatPlayer.setStatic({
        clipA: qpNum("clipA", 1),
        frameA: qpNum("frameA", 0),
        clipB: qpNum("clipB", qpNum("clipA", 1)),
        frameB: qpNum("frameB", qpNum("frameA", 0)),
        blend: qpNum("blend", 0),
      });
    } else if (qpBool("pause", false)) {
      vatPlayer.setStatic({
        clipA: qpNum("clip", 1),
        frameA: qpNum("frame", 0),
      });
    } else {
      vatPlayer.snapTo(qpNum("clip", 1));
      if (qpBool("arc", false)) playStoryArc(vatPlayer);
    }
  }, []);

  useFrame((_, delta) => {
    vatPlayer.update(delta);
  });

  return null;
}
