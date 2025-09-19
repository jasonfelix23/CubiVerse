"use client";
import { Card } from "@/components/ui/card";
import React from "react";

const AuthCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <Card className="align-center max-w-[400px] max-h-[400px]">{children}</Card>
  );
};

export default AuthCard;
