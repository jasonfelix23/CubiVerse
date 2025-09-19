"use client";

import ReduxProvider from "@/core/ReduxProvider";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReduxProvider>
      <div
        className="min-h-screen flex items-center justify-center bg-white"
        style={{
          backgroundImage: "url(/work-regarding-items.png)",
        }}
      >
        {children}
      </div>
    </ReduxProvider>
  );
};

export default AuthLayout;
