"use client";

import { Card } from "@/components/ui/card";

type MiniPipProps = {
  inCall: boolean;
  participants: { id: string; name: string }[];
};

export default function MiniPip({ inCall, participants }: MiniPipProps) {
  if (!inCall) return null;

  return (
    <Card className="mb-3 p-2 sticky top-0 z-10">
      <div className="text-xs mb-2 opacity-70">In call</div>
      <div className="grid grid-cols-3 gap-2">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="aspect-video rounded-md bg-muted/50 flex items-center justify-center text-[10px]"
            title={participant.name}
          >
            {participant.name}
          </div>
        ))}
      </div>
    </Card>
  );
}
