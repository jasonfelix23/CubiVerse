type Handlers = {
  onOpen: () => void;
  onMessage: (msg: any) => void;
  onClose: () => void;
};

export class Network {
  private url: string;
  private ws: WebSocket | null = null;
  private handlers: Handlers;

  constructor(url: string, handlers: Handlers) {
    this.url = url;
    this.handlers = handlers;
  }

  open() {
    this.ws = new WebSocket(this.url);
    this.ws.addEventListener("open", () => this.handlers.onOpen());
    this.ws.addEventListener("message", (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        this.handlers.onMessage(msg);
      } catch {}
    });
    this.ws.addEventListener("close", () => this.handlers.onClose());
  }

  isOpen() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  send(obj: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(obj));
  }

  dispose() {
    try {
      this.ws?.close(1000, "bye");
    } catch {}
    this.ws = null;
  }
}
