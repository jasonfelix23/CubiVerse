"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { InfoIcon } from "lucide-react";

import { useEffect, useState } from "react";

interface NewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    chatEnabled: boolean;
    audioEnabled: boolean;
    videoEnabled: boolean;
    npcEnabled: boolean;
    character: string;
  }) => void;
}

const NewMeetingModal = ({
  isOpen,
  onClose,
  onCreate,
}: NewMeetingModalProps) => {
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"ROAM" | "AUDIO" | "VIDEO">("ROAM");
  const [chatEnabled, setChatEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [npcEnabled, setNpcEnabled] = useState(false);
  const [character, setCharacter] = useState("red");

  const handleSubmit = () => {
    onCreate({
      name: name.trim() || "untitled Room",
      chatEnabled: chatEnabled,
      audioEnabled: audioEnabled,
      videoEnabled: videoEnabled,
      npcEnabled: npcEnabled,
      character: character,
    });
    onClose();
  };

  useEffect(() => {
    if (videoEnabled && !audioEnabled) {
      setAudioEnabled(true); // force audio on if video is enabled
    }
  }, [videoEnabled]);

  useEffect(() => {
    if (!audioEnabled && videoEnabled) {
      setVideoEnabled(false); // turn off video if audio is turned off
    }
  }, [audioEnabled]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a New Meeting</DialogTitle>
        </DialogHeader>
        <div className="grid gap-8 py-4">
          <div className="flex flex-col gap-2">
            <Label>Meeting Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Enable Chat</Label>
              <Switch checked={chatEnabled} onCheckedChange={setChatEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Enable Audio</Label>
              <Switch
                checked={audioEnabled}
                onCheckedChange={setAudioEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Enable Video</Label>
              <Switch
                checked={videoEnabled}
                onCheckedChange={setVideoEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Enable NPC</Label>
              <Switch checked={npcEnabled} onCheckedChange={setNpcEnabled} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Select Character</Label>
            <Select
              value={character}
              onValueChange={(val) => setCharacter(val)}
            >
              <SelectTrigger className={`text-${character}-600`}>
                <SelectValue placeholder="Select character" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="red" className="text-red-600">
                  Red
                </SelectItem>
                <SelectItem value="blue" className="text-blue-600">
                  Blue
                </SelectItem>
                <SelectItem value="yellow" className="text-yellow-600">
                  Yellow
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full flex gap-2 p-2 border-1 border-amber-200 rounded-lg text-amber-400">
            <InfoIcon width={40} height={40} />
            <h6>
              Soon you'll be able to schedule meetings, send invites, and add
              custom settings before you start. Stay tuned!
            </h6>
          </div>
          <Button className="mt-4" onClick={handleSubmit}>
            Create Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewMeetingModal;
