"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import MiniPip from "./MiniPip";
import { RailHandlers, PingItem, PlayerSummary } from "./types";
import { Phone, PhoneOff } from "lucide-react";

type Props = {
  incoming: PingItem[];
  activeCall?: { participants: PlayerSummary[] } | null;
  handlers?: RailHandlers;
};

export default function MeetingsPanel({
  incoming,
  activeCall,
  handlers,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <MiniPip
        inCall={!!activeCall}
        participants={(activeCall?.participants ?? []).map((p) => ({
          id: p.id,
          name: p.name,
        }))}
      />

      <Card className="p-3">
        <div className="text-xs mb-2 opacity-70">Incoming pings</div>
        <ScrollArea className="h-[40vh]">
          <div className="space-y-2 pr-2">
            {incoming.length ? (
              incoming.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 py-1.5"
                >
                  <div className="min-w-0">
                    <div className="text-sm truncate">
                      <span className="font-medium">{p.from.name}</span> wants
                      to meet
                    </div>
                    <div className="text-[10px] opacity-60">
                      {new Date(p.at).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handlers?.onAcceptPing?.(p.id)}
                    >
                      <Phone className="h-4 w-4 mr-1" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handlers?.onDeclinePing?.(p.id)}
                    >
                      <PhoneOff className="h-4 w-4 mr-1" /> Decline
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm opacity-60">No pings right now.</div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
