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
  bootstrapped: boolean;
  localPlayer: { id: string; name: string };
};

const MAP_W = 75;
const MAP_H = 50;

export default function MapCanvas({
  players,
  onLocalMove,
  wsConnected,
  bootstrapped,
  localPlayer,
}: MapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const [started, setStarted] = useState(false);

  // keep these; they'll control overlay visibility only
  const loadingVisible = !wsConnected || !bootstrapped || !started;
  console.log({ started, wsConnected, bootstrapped });

  const onLocalMoveRef = useRef(onLocalMove);
  useEffect(() => {
    onLocalMoveRef.current = onLocalMove;
  }, [onLocalMove]);

  const lastLocalPxRef = useRef<{ x: number; y: number; f: Face } | null>(null);

  // Boot the Game once per identity (canvas is always mounted now)
  useEffect(() => {
    // retry until canvas exists (super safe against timing)
    let raf = 0;
    const boot = () => {
      if (!canvasRef.current) {
        raf = requestAnimationFrame(boot);
        return;
      }

      const game = new Game(canvasRef.current, {
        viewScaleTarget: 0.75,
        map: {
          width: MAP_W,
          height: MAP_H,
          pngSrc: "/Map/Office_map_v1_16x16.png",
          collisionCode: 849,
        },
        player: { id: localPlayer.id, name: localPlayer.name } as any,
        debug: { drawCollisions: true },
      });

      (async () => {
        try {
          await game.start();
          (canvasRef.current as any)?.focus?.();
          game.onLocalMoved((px: number, py: number, f: Face) => {
            lastLocalPxRef.current = { x: px, y: py, f };
            const r = game.renderer;
            if (r.worldPxToTile) {
              const { tx, ty } = r.worldPxToTile(px, py);
              onLocalMoveRef.current(tx, ty, f);
            } else {
              const ts = 16;
              onLocalMoveRef.current(
                Math.floor(px / ts),
                Math.floor(py / ts),
                f
              );
            }
          });
          setStarted(true);
        } catch (e) {
          console.error("Game start failed:", e);
        }
      })();

      gameRef.current = game;
    };

    boot();
    return () => {
      cancelAnimationFrame(raf);
      setStarted(false);
      gameRef.current?.stop();
      gameRef.current?.dispose();
      gameRef.current = null;
    };
  }, [localPlayer.id, localPlayer.name]);

  // Sync remotes (unchanged)
  useEffect(() => {
    const g = gameRef.current;
    if (!started || !g?.assets?.playerSets) return;
    try {
      const r = g.renderer;
      const ts = r.tileSize();
      const toPxCentered = (p: Player) => ({
        ...p,
        x: p.x * ts + ts / 2,
        y: p.y * ts + ts / 2,
      });

      const keys = Object.keys(players);
      let selfKey: string | null = players[localPlayer.id]
        ? localPlayer.id
        : null;
      if (!selfKey)
        for (const k of keys)
          if (players[k]?.name === localPlayer.name) {
            selfKey = k;
            break;
          }
      if (!selfKey && keys.length === 1) selfKey = keys[0];
      if (!selfKey && lastLocalPxRef.current) {
        const { x: lx, y: ly } = lastLocalPxRef.current;
        const threshold = 1;
        for (const k of keys) {
          const p = toPxCentered(players[k]);
          if (
            Math.abs(p.x - lx) < threshold &&
            Math.abs(p.y - ly) < threshold
          ) {
            selfKey = k;
            break;
          }
        }
      }

      const remotes: Record<string, Player> = {};
      for (const [id, raw] of Object.entries(players)) {
        if (id === selfKey) continue;
        if (id === localPlayer.id) continue;
        if (raw.name === localPlayer.name) continue;
        remotes[id] = toPxCentered(raw);
      }
      g.syncRemotePlayers?.(remotes);
    } catch (e) {
      console.warn("[MapCanvas] syncRemotePlayers skipped:", e);
    }
  }, [players, started, localPlayer.id, localPlayer.name]);

  // ⬇️ Always render canvas; overlay sits on top
  return (
    <div className="relative flex-1 min-h-0 h-full">
      <canvas
        ref={canvasRef}
        className="flex-1 block w-full h-full"
        tabIndex={0}
        style={{ outline: "none" }}
      />
      {loadingVisible && (
        <div className="absolute inset-0 z-10">
          <LoadingOverlay visible />
        </div>
      )}
    </div>
  );
}
