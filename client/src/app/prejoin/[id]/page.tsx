"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectItem } from "@radix-ui/react-select";
import cubi from "@/core/cubi";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/authSelectors";

export default function PrejoinPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);

  const user = useSelector(selectUser); // <- source of truth for identity
  const username = user?.username ?? ""; // <- always use this for session

  const [room, setRoom] = useState<{
    roomName: string;
    occupants: number;
  } | null>(null);
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [camId, setCamId] = useState<string>();
  const [micId, setMicId] = useState<string>();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const meta = await cubi.api.getRoomMeta(id);
        setRoom({ roomName: meta.roomName, occupants: meta.occupants });

        const s = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play().catch(() => {});
        }

        const devs = await navigator.mediaDevices.enumerateDevices();
        const cams = devs.filter((d) => d.kind === "videoinput");
        const mics = devs.filter((d) => d.kind === "audioinput");
        setCams(cams);
        setMics(mics);
        setCamId((prev) => prev ?? cams[0]?.deviceId);
        setMicId((prev) => prev ?? mics[0]?.deviceId);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to init devices");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [id]); // stream intentionally omitted; cleanup captures latest via closure

  async function handleJoin() {
    if (!username) {
      setErr("Please sign in first.");
      return;
    }
    try {
      // 💡 Always use the account username; ignore any custom input
      await cubi.api.createRoomSession(id, username);
      router.push(`/rooms/${id}`);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to join room");
    }
  }

  return (
    <div className="h-screen w-full flex items-center justify-center p-6">
      <Card className="w-full max-w-3xl p-4">
        <div className="mb-3">
          <div className="text-sm text-muted-foreground">
            Getting things ready for
          </div>
          <div className="text-xl font-semibold">{room?.roomName ?? "…"}</div>
          <div className="text-xs opacity-60">
            {room ? `${room.occupants} online` : ""}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <Select value={camId} onValueChange={setCamId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Camera" />
                </SelectTrigger>
                <SelectContent>
                  {cams.map((c) => (
                    <SelectItem key={c.deviceId} value={c.deviceId}>
                      {c.label || "Camera"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={micId} onValueChange={setMicId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Microphone" />
                </SelectTrigger>
                <SelectContent>
                  {mics.map((m) => (
                    <SelectItem key={m.deviceId} value={m.deviceId}>
                      {m.label || "Microphone"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Read-only identity: always username */}
            <div className="text-sm text-muted-foreground">
              You will join as
            </div>
            <Input value={username} disabled />
            <div className="text-xs text-muted-foreground">
              Display name is your account username. To change it, update your
              profile.
            </div>

            <Button onClick={handleJoin} disabled={loading || !username}>
              {loading ? "Preparing…" : "Join room"}
            </Button>

            {err && <div className="text-sm text-red-600">{err}</div>}
            <div className="text-xs text-muted-foreground">
              You’ll join after device check. We’ll keep your session just for
              this room.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
