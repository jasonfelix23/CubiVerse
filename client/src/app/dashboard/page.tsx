"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Feature } from "@/core/types";
import { Keyboard, Video } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import NewMeetingModal from "./_components/NewMeetingModal";
import { APIInterface, RoomDto } from "@/core/APIInterface";
import cubi from "@/core/cubi";
import { useRouter } from "next/navigation";
import { buildPreJoinLink } from "../utils/url";

const features: Feature[] = [
  {
    title: "Get a link that you can share",
    description:
      "Click New meeting to get a link that you can send to people that you want to meet with",
    imagePath: "/Manila/Other/Share--Streamline-Manila.png",
  },
  {
    title: "Eliminate background noise",
    description:
      "Intelligent noise cancellation removes background noise as you present to others",
    imagePath: "/Manila/Other/Listening-Music-1--Streamline-Manila.png",
  },
  {
    title: "Your meeting is safe",
    description:
      "No one can join a meeting unless invited or admitted by the host",
    imagePath: "/Manila/Feature/Team-Coding--Streamline-Manila.png",
  },
];
export default function DashboardPage() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [joinValue, setJoinValue] = useState("");

  const router = useRouter();

  const extractRoomCode = (raw: string): string | null => {
    const s = raw.trim();
    if (!s) return null;

    try {
      const u = new URL(s);
      const qp = u.searchParams.get("code");
      if (qp) return qp;
      const segs = u.pathname.split("/").filter(Boolean);
      if (segs.length) return segs[segs.length - 1];
    } catch {}

    const tail = s.includes("/") ? s.split("/").filter(Boolean).pop()! : s;
    const code = tail.trim();

    return /^[A-Za-z0-9-]+$/.test(code) ? code : null;
  };

  const handlejoin = () => {
    const code = extractRoomCode(joinValue);
    if (!code) return;
    router.push(`/prejoin/${code}`);
  };

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="max-w-2xl flex flex-col mt-20 mx-auto items-center">
      <h2 className="text-5xl font-thin font-sans text-center">
        Video calls and meetings for everyone
      </h2>
      <h4 className="m-4 text-md text-gray-600">
        Connect, collaborate and celebrate from anywhere with Cubiverse
      </h4>
      <div className="flex gap-2 m-10">
        <NewMeetingModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={async (data) => {
            try {
              const roomDto: RoomDto = await cubi.api.createRoom(data);
              const shareLink = buildPreJoinLink(roomDto.roomCode);
              console.log("🔗 Share this link:", shareLink);
              router.push(`/prejoin/${roomDto.roomCode}`);
            } catch (err) {
              console.log(err);
            }
            console.log("Creating room:", data);
          }}
        />
        <Button
          size="lg"
          className="shadow-sm"
          onClick={() => setModalOpen(true)}
        >
          <Video />
          New Meeting
        </Button>
        <div className="flex items-center gap-2 border rounded-md px-3 py-0 shadow-sm">
          <Keyboard className="h-5 w-5 text-gray-500" />
          <Input
            placeholder="Enter a code or link"
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={joinValue}
            onChange={(e) => setJoinValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlejoin();
            }}
            autoComplete="off"
          />
        </div>
        <Button
          variant="link"
          onClick={handlejoin}
          disabled={!joinValue.trim()}
        >
          Join
        </Button>
      </div>
      <Separator />
      <div className="m-16 ">
        <Carousel setApi={setApi} className="w-full max-w-lg">
          <CarouselContent>
            {features.map((feature, index) => (
              <CarouselItem key={index}>
                <Card className="h-72 border-0">
                  <CardContent className="flex flex-col items-center p-6">
                    <Image
                      src={feature.imagePath}
                      width={150}
                      height={150}
                      alt={feature.title}
                    />
                    <span className="text-lg">{feature.title}</span>
                    <span className="text-sm text-gray-600 text-center">
                      {feature.description}
                    </span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNext />
          <CarouselPrevious />
        </Carousel>
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`
                h-2 w-2 rounded-full transition-all duration-300
                ${current - 1 === index ? "bg-cubi scale-125" : "bg-gray-300"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
