"use client";
import RightRail from "@/app/_components/right-rail/RightRail";
import MapCanvas from "./MapCanvas";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { setAuth } from "@/store/authSlice";
import cubi from "@/core/cubi";
import { useRoomSocket } from "@/core/useRoomSocket";
import { useDispatch, useSelector } from "react-redux";
import { Face } from "@/game/core/Game";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import { AuthResponse } from "@/core/APIInterface";
import LoadingOverlay from "./_components/LoadingOverlay";

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [roomName, setRoomName] = useState<string>("Room");
  const [authBootstrapped, setAuthBootstrapped] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // If we already have a user (e.g., redux-persist), skip the network call
      if (user) {
        setAuthBootstrapped(true);
        return;
      }

      try {
        const data: AuthResponse = await cubi.api.whoAmI();
        if (cancelled) return;

        dispatch(
          setAuth({
            token: data.token,
            user: {
              email: data.email,
              username: data.username,
              userId: data.userId,
            },
          })
        );
      } catch {
        if (!cancelled) router.replace("/login");
      } finally {
        if (!cancelled) setAuthBootstrapped(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, dispatch, router]);

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

  // 3) Derive local identity for the canvas
  const localPlayer = useMemo(() => {
    if (!user) return null;
    return { id: user.userId, name: user.username };
  }, [user]);

  const { connected, bootstrapped, players, chat, sendChat, sendMove } =
    useRoomSocket(id);

  // 5) Gate rendering so MapCanvas never sees a null localPlayer on first mount
  if (!authBootstrapped) {
    return <LoadingOverlay visible />;
  }

  if (!user) {
    // Redirect already triggered; render nothing to avoid flicker
    return null;
  }

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
            bootstrapped={bootstrapped}
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
