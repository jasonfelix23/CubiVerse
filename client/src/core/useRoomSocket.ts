"use client";

import { Face } from "@/game/core/Game";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type WsInbound =
  | {
      t: "welcome";
      room: string;
      id: string;
      name: string;
      roster?: Array<{
        id: string;
        name: string;
        x?: number;
        y?: number;
        f?: Face;
      }>;
    }
  | { t: "joined"; id: string; name: string; x?: number; y?: number; f?: Face }
  | {
      t: "state:snapshot";
      players: Array<{
        id: string;
        name: string;
        x?: number;
        y?: number;
        tx?: number;
        ty?: number;
        f?: Face;
      }>;
    }
  | { t: "left"; id: string }
  | { t: "move"; id: string; tx: number; ty: number; f: Face }
  | { t: "chat"; id: string; name: string; text: string; at: number }
  | { t: "error"; msg: string };

export type WsOutbound =
  | { t: "join" }
  | { t: "state:request" } // <-- ask server to send a full snapshot
  | { t: "move"; tx: number; ty: number; f: Face }
  | { t: "chat"; text: string };

type Player = {
  id: string;
  name: string;
  x: number;
  y: number;
  f: Face;
};

export function useRoomSocket(roomId: string) {
  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [chat, setChat] = useState<
    Array<{ id: string; name: string; text: string; at: number }>
  >([]);
  const wsRef = useRef<WebSocket | null>(null);
  const queueRef = useRef<WsOutbound[]>([]);
  const retryRef = useRef(0);
  const closedRef = useRef(false);

  const url = useMemo(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
    return `${apiBase.replace(/^http/, "ws")}/ws?room=${roomId}`;
  }, [roomId]);

  // --- helper: normalize any inbound player-ish thing into our {id,name,x,y,f} (tiles) ---
  const normalize = (
    p: Partial<Player> & {
      id?: string;
      name?: string;
      x?: number;
      y?: number;
      tx?: number;
      ty?: number;
      f?: Face;
    }
  ): Player | null => {
    if (!p || !p.id) return null;
    const tx =
      typeof p.tx === "number"
        ? p.tx
        : typeof p.x === "number"
        ? p.x
        : undefined;
    const ty =
      typeof p.ty === "number"
        ? p.ty
        : typeof p.y === "number"
        ? p.y
        : undefined;
    return {
      id: p.id,
      name: p.name ?? p.id,
      x: typeof tx === "number" ? tx : 0,
      y: typeof ty === "number" ? ty : 0,
      f: (p.f as Face) ?? "down",
    };
  };

  useEffect(() => {
    closedRef.current = false;

    const connect = () => {
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return; // prevent a 2nd connection during dev double-mount
      }
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        retryRef.current = 0;
        // 1) identify & join
        ws.send(JSON.stringify({ t: "join" } as WsOutbound));
        // 2) immediately request a full state snapshot
        ws.send(JSON.stringify({ t: "state:request" } as WsOutbound));

        while (queueRef.current.length) {
          ws.send(JSON.stringify(queueRef.current.shift()));
        }
      };

      ws.onmessage = (e) => {
        let msg: WsInbound;
        try {
          msg = JSON.parse(e.data);
        } catch {
          return;
        }

        switch (msg.t) {
          case "welcome": {
            // If server includes a roster here, apply it right away
            if (msg.roster && msg.roster.length) {
              setPlayers(() => {
                const map: Record<string, Player> = {};
                for (const raw of msg.roster!) {
                  const np = normalize(raw);
                  if (np) map[np.id] = np;
                }
                return map;
              });
            }
            break;
          }
          case "state:snapshot": {
            // Preferred: server replies with a dedicated snapshot
            const list = Array.isArray(msg.players) ? msg.players : [];
            setPlayers(() => {
              const map: Record<string, Player> = {};
              for (const raw of list) {
                const np = normalize(raw);
                if (np) map[np.id] = np;
              }
              return map;
            });
            break;
          }
          case "joined": {
            const np = normalize(msg);
            if (!np) break;
            setPlayers((prev) => ({
              ...prev,
              [np.id]: { ...(prev[np.id] ?? np), ...np },
            }));
            break;
          }
          case "left":
            setPlayers((prev) => {
              const copy = { ...prev };
              delete copy[msg.id];
              return copy;
            });
            break;
          // case "move":
          //   setPlayers((prev) => ({
          //     ...prev,
          //     [msg.id]: {
          //       ...(prev[msg.id] ?? {
          //         id: msg.id,
          //         name: prev[msg.id]?.name,
          //       }),
          //       x: msg.tx,
          //       y: msg.ty,
          //       f: msg.f as Face,
          //     },
          //   }));
          //   break;
          case "move": {
            // move always has tx/ty; merge into existing or create if new
            const np = normalize({
              id: msg.id,
              tx: msg.tx,
              ty: msg.ty,
              f: msg.f,
            });
            if (!np) break;
            setPlayers((prev) => {
              const old = prev[np.id];
              // keep last known name if we have it
              const name = old?.name ?? np.name;
              return { ...prev, [np.id]: { ...(old ?? np), ...np, name } };
            });
            break;
          }
          case "chat":
            setChat((prev) =>
              [
                { id: msg.id, name: msg.name, text: msg.text, at: msg.at },
                ...prev,
              ].slice(0, 100)
            );
            break;
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (!closedRef.current) {
          const delay = Math.min(16000, 1000 * Math.pow(2, retryRef.current++));
          setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        try {
          ws.close();
        } catch {}
      };
    };

    connect();
    return () => {
      closedRef.current = true;
      try {
        wsRef.current?.close();
      } catch {}
      wsRef.current = null;
    };
  }, [url]);

  const send = (out: WsOutbound) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      queueRef.current.push(out);
      return;
    }
    ws.send(JSON.stringify(out));
  };

  return {
    connected,
    players,
    chat,
    sendMove: (tx: number, ty: number, f: Face) =>
      send({ t: "move", tx, ty, f }),
    sendChat: (text: string) => send({ t: "chat", text }),
  };
}
