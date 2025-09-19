"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "./types";

export default function NotificationsPanel({ items }: { items: NotificationItem[] }) {
  return (
    <Card className="p-3">
      <div className="text-xs mb-2 opacity-70">Notifications</div>
      <ScrollArea className="h-[52vh]">
        <div className="space-y-2 pr-2">
          {items.length ? (
            items.map((n) => (
              <div key={n.id} className="text-sm">
                <span
                  className={
                    n.kind === "warning"
                      ? "text-amber-600"
                      : n.kind === "system"
                      ? "text-zinc-500"
                      : "text-sky-600"
                  }
                >
                  [{n.kind}]
                </span>{" "}
                {n.text}
              </div>
            ))
          ) : (
            <div className="text-sm opacity-60">You're all caught up.</div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
