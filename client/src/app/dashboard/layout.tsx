"use client";
import React, { useEffect, useState } from "react";
import NavDash from "./NavDash";
import SideBar from "./SideBar";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import { setAuth } from "@/store/authSlice";
import { AuthResponse } from "@/core/APIInterface";
import cubi from "@/core/cubi";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"meet" | "call">("meet");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(false);
      return;
    }

    cubi.api
      .whoAmI()
      .then((data: AuthResponse) => {
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
      })
      .catch(() => {
        router.replace("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, dispatch, router]);

  if (loading) {
    return <div className="h-screen items-center">Loading dashboard...</div>;
  }
  return (
    <div className="h-screen flex flex-col">
      <NavDash
        onToggleSidebar={() => setIsCollapsed((prev) => !prev)}
        user={user}
      />
      <div className="flex flex-1 overflow-hidden">
        <SideBar
          isCollapsed={isCollapsed}
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
        />
        <div className="flex-1 p-4 transition-all duration-400 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
