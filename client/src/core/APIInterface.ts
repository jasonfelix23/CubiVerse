import { User } from "@/store/authSlice";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  userId: string;
}

export interface RoomCreatePayload {
  name: string;
  chatEnabled: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  npcEnabled: boolean;
  character?: string;
}

export interface RoomDto {
  id: number;
  name: string;
  roomCode: string;
  hostUsername: string;
  hostEmail: string;
  createdAt: string;
  state: "OPEN" | "CLOSED" | "ENDED";
  chatEnabled: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  npcEnabled: boolean;
  participantCount: number;
}

export interface RoomMeta {
  roomCode: string;
  roomName: string;
  occupants: number;
}

export class APIInterface {
  baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private _setTokenCookie(token: string) {
    if (typeof window !== "undefined") {
      document.cookie = `token=${token}; path=/; max-age=86400`;
    }
  }

  private _getTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|; )token=([^;]+)/);
    return match ? match[1] : null;
  }

  private _buildHeaders(
    extra?: Record<string, string>
  ): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(extra ?? {}),
    };
    const token = this._getTokenFromCookie();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  async signup(
    email: string,
    username: string,
    password: string
  ): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });
    if (!response.ok) throw new Error("Signup Failed");
    const data = await response.json();
    this._setTokenCookie(data.token);
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Login Failed");
    const data = await response.json();
    this._setTokenCookie(data.token);
    return data;
  }

  async whoAmI(): Promise<AuthResponse> {
    const token = this._getTokenFromCookie();
    if (!token) throw new Error("No token found");
    const response = await fetch(`${API_URL}/auth/whoami`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to get user");
    const data = await response.json();
    this._setTokenCookie(data.token);
    return data;
  }

  async createRoom(payload: RoomCreatePayload): Promise<RoomDto> {
    const res = await fetch(`${this.baseUrl}/api/rooms`, {
      method: "POST",
      headers: this._buildHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create room");
    return res.json();
  }

  async getRoomMeta(code: string): Promise<RoomMeta> {
    const res = await fetch(`${this.baseUrl}/api/rooms/${code}/meta`, {
      method: "GET",
      headers: this._buildHeaders({ cache: "no-store" }),
    });
    if (!res.ok) throw new Error("Failed to get Room meta");
    return res.json();
  }

  async getRoom(code: string): Promise<RoomDto> {
    const res = await fetch(`${this.baseUrl}/api/rooms/${code}`, {
      method: "POST",
      headers: this._buildHeaders(),
    });
    if (!res.ok) throw new Error("Failed to get room");
    return res.json();
  }

  async joinRoom(code: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/rooms/${code}/join`, {
      method: "POST",
      headers: this._buildHeaders(),
    });
    if (!res.ok) throw new Error("Failed to join room");
  }

  async createRoomSession(
    code: string,
    displayName?: string
  ): Promise<{
    sessionId: string;
    exp: string;
  }> {
    const res = await fetch(`${this.baseUrl}/api/rooms/${code}/session`, {
      method: "POST",
      headers: this._buildHeaders(),
      credentials: "include",
      body: JSON.stringify({ displayName: displayName || undefined }),
    });
    if (!res.ok) throw new Error("Failed to Join room");
    return res.json();
  }

  async deleteRoomSession(code: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/rooms/${code}/session`, {
      method: "DELETE",
      credentials: "include",
      headers: this._buildHeaders(),
    });
    if (!res.ok)
      throw new Error(await res.text().catch(() => "Failed to leave room"));
  }
}
