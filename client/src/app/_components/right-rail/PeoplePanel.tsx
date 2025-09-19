import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PlayerSummary, RailHandlers } from "./types";
import { Button } from "@/components/ui/button";
import { Hand } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  players: PlayerSummary[];
  handlers?: RailHandlers;
};

function PresenceDot({
  presence,
  color,
}: {
  presence: PlayerSummary["presence"];
  color: string;
}) {
  const map: Record<PlayerSummary["presence"], string> = {
    available: "bg-emerald-500",
    busy: "bg-amber-500",
    "in-call": "bg-sky-500",
    away: "bg-zinc-400",
  };
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ring-2 ring-background ${map[presence]}`}
      style={{ boxShadow: `0 0 0 1.5px white` }}
    />
  );
}

function PlayerRow({
  p,
  onPing,
  onFollow,
}: {
  p: PlayerSummary;
  onPing?: (id: string) => void;
  onFollow?: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 py-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback style={{ background: p.color }} className="text-white">
          {p.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm truncate">{p.name}</span>
          <PresenceDot presence={p.presence} color={p.color} />
          {typeof p.distanceTiles === "number" && (
            <span className="text-[10px] opacity-60">
              · {p.distanceTiles.toFixed(1)} tiles
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="secondary" onClick={() => onFollow?.(p.id)}>
          Follow
        </Button>
        <Button size="sm" onClick={() => onPing?.(p.id)}>
          <Hand className="h-4 w-4 mr-1" /> Ping
        </Button>
      </div>
    </div>
  );
}

export default function PeoplePanel({ players, handlers }: Props) {
  const nearby = players
    .filter((p) => (p.distanceTiles ?? 99) <= 6)
    .sort((a, b) => (a.distanceTiles ?? 0) - (b.distanceTiles ?? 0));
  const everyone = players.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-3">
      <Card className="p-3">
        <div className="text-xs mb-2 opacity-70">Nearby</div>
        {nearby.length ? (
          nearby
            .slice(0, 8)
            .map((p) => (
              <PlayerRow
                key={p.id}
                p={p}
                onPing={handlers?.onPing}
                onFollow={handlers?.onFollow}
              />
            ))
        ) : (
          <div className="text-sm opacity-60">No one nearby.</div>
        )}
      </Card>

      <Separator />

      <div className="text-xs mb-1 opacity-70">Everyone</div>
      <ScrollArea className="h-[42vh]">
        <div className="pr-2">
          {everyone.map((p) => (
            <PlayerRow
              key={p.id}
              p={p}
              onPing={handlers?.onPing}
              onFollow={handlers?.onFollow}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
