import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChatMsg } from "./RightRail";

type ChatPanelProps = {
  chat: ChatMsg[]; // latest-first or oldest-first: we’ll handle both
  onSend: (text: string) => void;
};

export default function ChatPanel({ chat, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const areaRef = useRef<HTMLDivElement | null>(null);

  // If your upstream `chat` is latest-first, flip it so we render oldest->newest.
  const ordered = useMemo(() => {
    if (!chat?.length) return [];
    const oldestFirst = chat[0]?.at <= chat[chat.length - 1]?.at;
    return oldestFirst ? chat : [...chat].reverse();
  }, [chat]);

  function sendMsg() {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
    // Let the new message arrive via the WebSocket echo; no local append here.
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    // Allow layout to settle first
    const id = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
    return () => cancelAnimationFrame(id);
  }, [ordered.length]);

  return (
    <div className="flex flex-col gap-3">
      <Card className="p-3">
        <div className="text-xs mb-2 opacity-70">Room chat</div>
        <ScrollArea className="h-[44vh]">
          <div ref={areaRef} className="space-y-2 pr-2 overflow-auto">
            {ordered.length === 0 ? (
              <div className="text-xs text-muted-foreground">
                No messages yet. Say hi! 👋
              </div>
            ) : (
              ordered.map((m) => (
                <div key={m.id} className="text-sm leading-relaxed break-words">
                  <span className="font-medium">{m.name}:</span>{" "}
                  <span>{m.text}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMsg()}
          />
          <Button onClick={sendMsg} disabled={!draft.trim()}>
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
}
