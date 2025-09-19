"use client";
import { Calendar, Phone } from "lucide-react";
import React, { useState } from "react";
interface SideBarProps {
  isCollapsed: boolean;
  selectedMode: string;
  setSelectedMode: (mode: "meet" | "call") => void;
}

const SideBar = ({
  isCollapsed,
  selectedMode,
  setSelectedMode,
}: SideBarProps) => {
  const sideBarWidth = isCollapsed ? "w-0 hidden" : "w-64";
  return (
    <div
      className={`transition-all duration-400 ${sideBarWidth} flex flex-col mt-20 `}
    >
      <div
        className={`flex gap-4 p-6 mt-8 tracking-wide text-sm ${
          selectedMode === "meet" && "bg-black text-white rounded-r-full"
        }`}
        onClick={() => setSelectedMode("meet")}
      >
        <Calendar height={20} width={20} />
        Meetings
      </div>
      <div
        className={`flex gap-4 p-6 tracking-wide text-sm ${
          selectedMode === "call" && "bg-black text-white rounded-r-full"
        }`}
        onClick={() => setSelectedMode("call")}
      >
        <Phone height={20} width={20} />
        Calls
      </div>
    </div>
  );
};

export default SideBar;
