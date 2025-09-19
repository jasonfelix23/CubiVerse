"use client";
import { useMemo, useState } from "react";
import {
  NotificationItem,
  PingItem,
  PlayerSummary,
  RailHandlers,
} from "./types";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Link,
  MessageSquare,
  Mic,
  MicOff,
  Search,
  Users,
  Video,
  VideoIcon,
  VideoOff,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@radix-ui/react-tabs";
import PeoplePanel from "./PeoplePanel";
import ChatPanel from "./ChatPanel";
import MeetingsPanel from "./MeetingsPanel";
import NotificationsPanel from "./NotificationsPanel";
import { useParams, useRouter } from "next/navigation";
import cubi from "@/core/cubi";
import { buildPreJoinLink } from "@/app/utils/url";

type YouState = {
  name: string;
  color: string;
  micOn: boolean;
  camOn: boolean;
  dnd: boolean;
  presence: "available" | "busy" | "in-call" | "away";
};

export type ChatMsg = { id: string; name: string; text: string; at: number };

type RightRailProps = {
  roomName: string;
  players: Record<
    string,
    { id: string; name: string; x?: number; y?: number; f?: string | null }
  >;
  chat: ChatMsg[];
  onSendChat: (t: string) => void;
  presenceCount?: number;
};

export default function RightRail({
  roomName,
  players,
  chat,
  onSendChat,
  presenceCount: presenceCountProp,
}: RightRailProps) {
  const [localYou, setLocalYou] = useState<YouState>({
    name: "You",
    color: "#6d28d9",
    micOn: true,
    camOn: false,
    dnd: false,
    presence: "available",
  });

  const handlers: RailHandlers = useMemo(() => ({}), []);
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Convert players record → PlayerSummary[]
  const playerSummaries: PlayerSummary[] = useMemo(() => {
    const list = Object.values(players ?? {}).map((p) => ({
      id: p.id,
      name: p.name ?? "Guest",
      color: "#2563eb", // simple default tint; can be enhanced later
      presence: "available" as const,
      distanceTiles: 0, // you can compute this once you track local <-> remote distances
    }));
    // Fallback demo list if none present
    return list.length
      ? list
      : [
          {
            id: "p1",
            name: "Gracia",
            color: "#111827",
            presence: "available",
            distanceTiles: 2.0,
          },
          {
            id: "p2",
            name: "Noah",
            color: "#2563eb",
            presence: "busy",
            distanceTiles: 65.3,
          },
          {
            id: "p3",
            name: "Ava",
            color: "#ef4444",
            presence: "in-call",
            distanceTiles: 28.0,
          },
          {
            id: "p4",
            name: "Liam",
            color: "#16a34a",
            presence: "available",
            distanceTiles: 42.2,
          },
        ];
  }, [players]);

  // Optional mock panels (safe defaults)
  const mockPings: PingItem[] = [];
  const mockNotifs: NotificationItem[] = [
    {
      id: "n1",
      kind: "system",
      text: "Receptionist is online.",
      at: Date.now() - 7_200_000,
    },
    {
      id: "n2",
      kind: "info",
      text: "New desk area unlocked.",
      at: Date.now() - 3_600_000,
    },
  ];

  async function leave() {
    try {
      await cubi.api.deleteRoomSession(id);
    } catch {
      // ignore; we'll still navigate away
    } finally {
      router.push("/dashboard");
    }
  }

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(buildPreJoinLink(id));
    } catch {
      // fallback: no-op
    }
  }

  const presenceCount = presenceCountProp ?? playerSummaries.length;

  return (
    <aside className="h-screen w-[clamp(300px, 24vw,380px)] border-1 bg-gray-100 flex flex-col">
      {/** Header*/}
      <div className="p-3 border-b sticky top-0 z-20 bg-backdrop">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold truncate">{roomName}</div>
            <div
              className="text-xs text-gray-500 font-mono tabular-nums truncate flex gap-2"
              onClick={copyInvite}
            >
              <p>{id}</p>
              <Link width={12} height={12} />
            </div>
          </div>
          <div>
            <Badge variant="secondary">
              <Users className="h-3.5 w-3.5 mr-1" />
              {presenceCount}
            </Badge>
            <Button variant="destructive" onClick={leave}>
              Leave
            </Button>
          </div>
        </div>
        <div className="mt-3 relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
          <Input className="pl-8" placeholder="Search People..." />
        </div>
      </div>

      {/* You / controls */}
      <div className="p-3">
        <Card className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0 rounded-full overflow-hidden ring-1 ring-black/5">
              <AvatarFallback
                style={{ background: localYou.color }}
                className="h-full w-full rounded-full text-white flex items-center justify-center"
              >
                {localYou.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{localYou.name}</div>
              <div className="text-xs text-muted-foreground">
                {localYou.presence}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant={localYou.micOn ? "default" : "secondary"}
                onClick={() => {
                  const v = !localYou.micOn;
                  setLocalYou((prev) => ({ ...prev, micOn: v }));
                  handlers?.onToggleMic?.(v);
                }}
                title={localYou.micOn ? "Mute mic" : "Unmute mic"}
              >
                {localYou.micOn ? (
                  <Mic className="h-4 w-4" />
                ) : (
                  <MicOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant={localYou.camOn ? "default" : "secondary"}
                onClick={() => {
                  const v = !localYou.camOn;
                  setLocalYou((s) => ({ ...s, camOn: v }));
                  handlers?.onToggleCamera?.(v);
                }}
                title={localYou.camOn ? "Turn camera off" : "Turn camera on"}
              >
                {localYou.camOn ? (
                  <VideoIcon className="h-4 w-4" />
                ) : (
                  <VideoOff className="h-4 w-4" />
                )}
              </Button>
              <div className="flex items-center gap-1 text-xs">
                <span className="opacity-60">DND</span>
                <Switch
                  checked={localYou.dnd}
                  onCheckedChange={(v) => {
                    setLocalYou((s) => ({ ...s, dnd: v }));
                    handlers?.onDnd?.(v);
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="people" className="flex-1 flex flex-col">
        <TabsList className="mx-3 sticky top-0 z-10">
          <TabsTrigger value="people" className="gap-1">
            <Users className="h-4 w-4" /> People
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-1">
            <MessageSquare className="h-4 w-4" /> Chat
          </TabsTrigger>
          <TabsTrigger value="meetings" className="gap-1">
            <Video className="h-4 w-4" /> Meetings
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-4">
            <TabsContent value="people" className="m-0">
              <PeoplePanel players={playerSummaries} handlers={handlers} />
            </TabsContent>

            <TabsContent value="chat" className="m-0">
              <ChatPanel chat={chat} onSend={onSendChat} />
            </TabsContent>

            <TabsContent value="meetings" className="m-0">
              <MeetingsPanel
                incoming={mockPings}
                activeCall={{
                  participants: playerSummaries.filter(
                    (p) => p.presence === "in-call"
                  ),
                }}
                handlers={handlers}
              />
            </TabsContent>

            <TabsContent value="notifications" className="m-0">
              <NotificationsPanel items={mockNotifs} />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </aside>
  );
}
