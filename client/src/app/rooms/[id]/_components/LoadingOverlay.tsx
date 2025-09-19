"use client";

import { useEffect, useState, useMemo } from "react";

export default function LoadingOverlay({
  visible,
  tips,
}: {
  visible: boolean;
  tips?: string[];
}) {
  const msgs = tips ?? [
    "Booting the engine...",
    "Warming up sprites...",
    "Syncing room state...",
    "Placing your desk plant...",
    "Feeding the office goldfish...",
  ];

  const [i, setI] = useState(0);
  const [pct, setPct] = useState(3);

  useEffect(() => {
    if (!visible) return;
    const id1 = setInterval(() => setI((v) => (v + 1) % msgs.length), 1400);
    const id2 = setInterval(
      () => setPct((p) => Math.min(97, p + Math.ceil(Math.random() * 9))),
      600
    );
    return () => {
      clearInterval(id1);
      clearInterval(id2);
    };
  }, [visible, msgs.length]);

  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 text-white"
      role="status"
      aria-live="polite"
    >
      <div className="w-[min(480px,90vw)] rounded-2xl p-6 bg-zinc-900/70 shadow-xl">
        <div className="text-xl font-semibold mb-2">Getting things ready…</div>
        <div className="text-sm opacity-90 mb-4">{msgs[i]}</div>
        <div className="w-full h-2 rounded bg-white/10 overflow-hidden">
          <div
            className="h-full rounded bg-white/80 transition-all"
            style={{ width: pct + "%" }}
          />
        </div>
        <div className="mt-2 text-xs opacity-70">This may take a moment.</div>
      </div>
    </div>
  );
}
