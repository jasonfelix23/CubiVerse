export type Presence = "available" | "busy" | "in-call" | "away";

export type PlayerSummary = {
  id: string;
  name: string;
  color: string;
  presence: Presence;
  distanceTiles?: number;
};

export type PingItem = {
  id: string;
  from: PlayerSummary;
  at: number;
  note?: string;
};

export type callState = {
  id: string;
  participants: PlayerSummary[];
  startedAt: number;
};

export type NotificationItem = {
  id: string;
  kind: "system" | "warning" | "info";
  text: string;
  at: number;
};

export type RailHandlers = {
  onPing?: (playerId: string) => void;
  onFollow?: (playerId: string) => void;
  onAcceptPing?: (pingId: string) => void;
  onDeclinePing?: (pingId: string) => void;
  onToggleMic?: (on: boolean) => void;
  onToggleCamera?: (on: boolean) => void;
  onDnd?: (on: boolean) => void;
};
