export const getAppBaseUrl = () => {
  const fromEnv = process.env.NEXT_PUBLIC_APP_BASE?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
};

export const buildPreJoinLink = (roomCode: string) => {
  return `${getAppBaseUrl()}/prejoin/${roomCode}`;
};
