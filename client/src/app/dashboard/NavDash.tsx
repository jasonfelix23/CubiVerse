"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  AlignJustify,
  CircleQuestionMark,
  MessageSquareWarning,
  Settings,
  User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import { User } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearAuth } from "@/store/authSlice";

interface NavDashProps {
  onToggleSidebar: () => void;
  user: User | null;
}

const NavDash = ({ onToggleSidebar, user }: NavDashProps) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [timeStr, setTimeStr] = useState("");
  const [openSettings, setOpenSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setOpenSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const weekDay = now.toLocaleDateString(undefined, { weekday: "short" });
      const day = now.getDate();
      const month = now.toLocaleString(undefined, { month: "short" });

      setTimeStr(`${hours}:${minutes} | ${weekDay} ${day} ${month}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(clearAuth());
    document.cookie = "token=; Max-Age=0; path=/";
    router.replace("/login");
  };

  const initial = user?.username.charAt(0).toUpperCase();

  return (
    <nav className="fixed flex justify-between w-full z-50 px-4 md:px-8 py-4 md:py-8">
      <div className="flex gap-2">
        <AlignJustify
          className="rounded-full p-1 hover:bg-gray-100"
          width={30}
          height={30}
          onClick={onToggleSidebar}
        />
        <Image src="/cubiVerse.png" alt="cubiverse" width={200} height={100} />
      </div>
      <div className="text-sm text-gray-600 font-mono tracking-wide">
        {timeStr}
      </div>
      <div className="flex gap-2">
        <MessageSquareWarning
          className="rounded-full p-1 hover:bg-gray-100"
          width={30}
          height={30}
        />
        <CircleQuestionMark
          className="rounded-full p-1 hover:bg-gray-100"
          width={30}
          height={30}
        />
        <Settings
          className="rounded-full p-1 hover:bg-gray-100"
          width={30}
          height={30}
        />
        <div className="relative" ref={settingsRef}>
          <div
            onClick={() => setOpenSettings((o) => !o)}
            className="rounded-full px-1 hover:bg-gray-100"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-gray-600 text-white rounded-full">
              <span className="text-sm">{initial}</span>
            </div>
            {openSettings && (
              <div className="absolute right-0 mt-2 w-50 bg-white border rounded shadow-lg z-10 text-sm">
                <ul className="divide-y">
                  <li className="py-4">
                    <p className="text-center">
                      Welcome{" "}
                      <span className="font-bold text-cubi">
                        {user?.username}!
                      </span>
                    </p>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        router.push("/profile");
                        setOpenSettings(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Profile
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavDash;
