"use client";
import { Face, Game } from "@/game/core/Game";
import { useEffect, useRef, useState } from "react";
import LoadingOverlay from "./_components/LoadingOverlay";

type Player = {
  id: string;
  name: string;
  x: number;
  y: number;
  f: Face;
};
type MapProps = {
  players: Record<string, Player>;
  onLocalMove: (tx: number, ty: number, f: Face) => void; // expects TILES
  wsConnected: boolean;
  localPlayer: { id: string; name: string };
};

const MAP_W = 75;
const MAP_H = 50;

export default function MapCanvas({
  players,
  onLocalMove,
  wsConnected,
  localPlayer,
}: MapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const [started, setStarted] = useState(false);

  const loadingVisible =
    !started || !wsConnected || Object.keys(players).length === 0;

  // keep onLocalMove stable so we don't recreate the Game
  const onLocalMoveRef = useRef(onLocalMove);
  useEffect(() => {
    onLocalMoveRef.current = onLocalMove;
  }, [onLocalMove]);

  // remember last local PIXEL position (used to recognize “remote me”)
  const lastLocalPxRef = useRef<{ x: number; y: number; f: Face } | null>(null);

  // --- boot the Game ONCE per identity ---
  useEffect(() => {
    if (!canvasRef.current) return;

    const game = new Game(canvasRef.current, {
      viewScaleTarget: 0.75,
      map: {
        width: MAP_W,
        height: MAP_H,
        pngSrc: "/Map/Office_map_v1_16x16.png",
        collisionCode: 849,
      },
      // local avatar uses your real id+name (no "You")
      player: { id: localPlayer.id, name: localPlayer.name } as any,
      debug: { drawCollisions: true },
    });

    (async () => {
      try {
        await game.start();
        (canvasRef.current as any)?.focus?.();

        // Game emits PIXELS; convert to TILES for outbound
        game.onLocalMoved((px: number, py: number, f: Face) => {
          lastLocalPxRef.current = { x: px, y: py, f };
          const r = game.renderer;
          if (r.worldPxToTile) {
            const { tx, ty } = r.worldPxToTile(px, py);
            onLocalMoveRef.current(tx, ty, f);
          } else {
            const ts = 16;
            onLocalMoveRef.current(Math.floor(px / ts), Math.floor(py / ts), f);
          }
        });

        setStarted(true);
      } catch (e) {
        console.error("Game start failed:", e);
      }
    })();

    gameRef.current = game;
    return () => {
      setStarted(false);
      game.stop();
      game.dispose();
    };
  }, [localPlayer.id, localPlayer.name]);

  // --- sync REMOTE players ONLY (smart self-filter) ---
  useEffect(() => {
    const g = gameRef.current;
    if (!started || !g?.assets?.playerSets) return;

    try {
      const r = g.renderer;
      const ts = r.tileSize();

      const toPxCentered = (p: Player) => {
        return {
          ...p,
          x: p.x * ts + ts / 2,
          y: p.y * ts + ts / 2,
        };
      };

      const keys = Object.keys(players);

      // candidate self by id or name
      let selfKey: string | null = null;
      if (players[localPlayer.id]) selfKey = localPlayer.id;
      if (!selfKey) {
        for (const k of keys) {
          if (players[k]?.name === localPlayer.name) {
            selfKey = k;
            break;
          }
        }
      }
      // single-entry fallback
      if (!selfKey && keys.length === 1) selfKey = keys[0];
      // proximity fallback
      if (!selfKey && lastLocalPxRef.current) {
        const { x: lx, y: ly } = lastLocalPxRef.current;
        const threshold = 1;
        for (const k of keys) {
          const p = toPxCentered(players[k]);
          if (typeof p.x === "number" && typeof p.y === "number") {
            if (
              Math.abs(p.x - lx) < threshold &&
              Math.abs(p.y - ly) < threshold
            ) {
              selfKey = k;
              break;
            }
          }
        }
      }

      const remotes: Record<string, Player> = {};
      for (const [id, raw] of Object.entries(players)) {
        if (id === selfKey) continue; // drop “remote me”
        if (id === localPlayer.id) continue; // drop direct id match
        if (raw.name === localPlayer.name) continue; // drop same display name
        remotes[id] = toPxCentered(raw);
      }

      g.syncRemotePlayers?.(remotes);
    } catch (e) {
      console.warn("[MapCanvas] syncRemotePlayers skipped:", e);
    }
  }, [players, started, localPlayer.id, localPlayer.name]);

  // if (loadingVisible) return <LoadingOverlay visible />;

  return (
    <canvas
      ref={canvasRef}
      className="flex-1 block"
      tabIndex={0}
      style={{ outline: "none" }}
    />
  );
}
