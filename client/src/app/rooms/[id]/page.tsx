"use client";
import RightRail from "@/app/_components/right-rail/RightRail";
import MapCanvas from "./MapCanvas";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AuthSlice } from "@/store/authSlice";
import cubi from "@/core/cubi";
import { useRoomSocket } from "@/core/useRoomSocket";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/authSelectors";
import { Face } from "@/game/core/Game";

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const [roomName, setRoomName] = useState<string>("Room");
  const { connected, players, chat, sendChat, sendMove } = useRoomSocket(id);
  const user = useSelector(selectUser);
  // <- Derive your identity here (auth, session, etc.)

  const localPlayer = useMemo(() => {
    if (!user) return null;
    const localId = user.userId; // prefer userId if you added it
    return { id: localId, name: user.username };
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meta = await cubi.api.getRoomMeta(id);
        if (!cancelled) setRoomName(meta.roomName);
      } catch (err) {
        console.log(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  console.log(localPlayer);

  return (
    <main className="flex h-screen w-full overflow-hidden">
      <div id="map-container" className="flex-1 relative bg-neutral-900/5">
        {localPlayer && (
          <MapCanvas
            players={players}
            onLocalMove={(tx: number, ty: number, f: Face) =>
              sendMove(tx, ty, f)
            }
            wsConnected={connected}
            localPlayer={localPlayer}
          />
        )}
      </div>
      <RightRail
        roomName={roomName}
        players={players}
        chat={chat}
        onSendChat={sendChat}
        presenceCount={Object.keys(players).length}
      />
    </main>
  );
}
