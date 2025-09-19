import { Player } from "../entities/Player";
import { ColorName } from "../types";
import { World } from "../world/World";
import { Assets } from "./Assets";
import { Input } from "./Input";
import { Renderer } from "./Renderer";

export type GameConfig = {
  player: { id: string; name: string; color: ColorName; speed: number };
  viewScaleTarget: number;
  map: {
    width: number;
    height: number;
    pngSrc: string;
    collisionCode: number;
  };
  debug?: {
    drawCollisions?: boolean;
  };
};

export type Face = "up" | "down" | "left" | "right";

type MoveCb = (x: number, y: number, facing: Face) => void;

export class Game {
  private canvas: HTMLCanvasElement;
  private cfg: GameConfig;
  private raf: number | null = null;
  private running = false;

  public renderer: Renderer;
  public input: Input;
  public assets: Assets;
  public world: World;

  private mainPlayer: Player | null = null;
  private prevTs: number | null = null;
  private readonly speedPxPerSec = 140;
  private onLocalMovedCb: MoveCb | null = null;
  private lastNotifyMs = 0;
  private readonly notifyIntervalMs = 100;
  private remotes = new Map<string, Player>();

  constructor(canvas: HTMLCanvasElement, cfg: GameConfig) {
    console.log("[Game] constructor");
    this.canvas = canvas;
    this.cfg = cfg;

    this.renderer = new Renderer(
      canvas,
      cfg.map.width,
      cfg.map.height,
      cfg.viewScaleTarget
    );

    this.input = new Input();
    this.assets = new Assets();
    this.world = new World({
      width: cfg.map.width,
      height: cfg.map.height,
      collisionCode: cfg.map.collisionCode,
    });

    window.addEventListener("resize", this.onResize);
    canvas.addEventListener("click", (e) => {
      const { x, y } = this.renderer.clientToWorld(e.clientX, e.clientY);
      const { tx, ty } = this.renderer.worldPxToTile(x, y);
      void tx;
      void ty;
      void y;
    });
  }

  async start() {
    console.log("[Game] start: begin");
    await Promise.all([
      this.assets.loadMap(this.cfg.map.pngSrc),
      this.assets.loadPlayerSets(),
    ]);

    if (!this.assets.hasSets()) throw new Error("No player sets loaded");

    const TILE = 16; // your tile pixels
    const img = this.assets.mapImage!;
    const detectedW = Math.round(img.naturalWidth / TILE);
    const detectedH = Math.round(img.naturalHeight / TILE);
    if (detectedW > 0 && detectedH > 0) {
      this.renderer.setMapSize(detectedW, detectedH);
      (this.world as any).cfg.width = detectedW;
      (this.world as any).cfg.height = detectedH;
    }

    this.renderer.sizeToWindow();
    const ts = this.renderer.tileSize();
    const centerTx = Math.floor((this.world as any).cfg.width / 2);
    const centerTy = Math.floor((this.world as any).cfg.height / 2);
    const cx = centerTx * ts;
    const cy = centerTy * ts;

    this.mainPlayer = new Player(
      this.cfg.player.id,
      cx,
      cy,
      this.assets.getSet(this.cfg.player.color || "green"),
      this.cfg.player.name
    );
    this.mainPlayer.updateDimensions(this.renderer.spriteScale());
    await this.world.ensureCollisions();
    this.world.rebuildBoundaries(this.renderer.tileSize());

    this.running = true;
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    if (this.raf != null) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  dispose() {
    this.stop();
    this.input.dispose();
    window.removeEventListener("resize", this.onResize);
  }

  private loop = (ts: number) => {
    const dtMs = this.prevTs == null ? 16 : Math.min(48, ts - this.prevTs);
    this.prevTs = ts;

    const moved = !!this.applyInput(dtMs);

    if (moved && this.mainPlayer) {
      const now = performance.now();
      if (now - this.lastNotifyMs >= this.notifyIntervalMs) {
        this.lastNotifyMs = now;
        const facing = this.inputFacing();
        this.onLocalMovedCb?.(this.mainPlayer.x, this.mainPlayer.y, facing);
      }
    }

    this.renderer.drawBegin(this.assets.mapImage!);
    if (this.cfg.debug?.drawCollisions) this.world.debugDraw(this.renderer.ctx);

    for (const ent of this.remotes.values()) {
      ent.draw(this.renderer.ctx, false);
    }

    this.mainPlayer?.draw(this.renderer.ctx, true);

    if (this.running) this.raf = requestAnimationFrame(this.loop);
  };

  private inputFacing(): Face {
    const key = this.input.lastArrow();
    if (!key) return "down";
    switch (key) {
      case "ArrowUp":
        return "up";
      case "ArrowDown":
        return "down";
      case "ArrowLeft":
        return "left";
      case "ArrowRight":
        return "right";
      default:
        return "down";
    }
  }

  private applyInput(dtMs: number) {
    const me = this.mainPlayer;
    if (!me) return;

    const key = this.input.lastArrow();
    let facing: Face = "down";
    if (!key) return;

    let dx = 0,
      dy = 0;
    switch (key) {
      case "ArrowUp":
        dy = -1;
        facing = "up";
        break;
      case "ArrowDown":
        dy = 1;
        facing = "down";
        break;
      case "ArrowLeft":
        dx = -1;
        facing = "left";
        break;
      case "ArrowRight":
        dx = 1;
        facing = "right";
        break;
    }

    let moved = false;
    const next = me.cloneMoved(dx, dy);
    next.updateDimensions(this.renderer.spriteScale());

    if (!this.world.collides(next)) {
      me.move(dx, dy);
      moved = true;
    }
    if (facing) me.setFacingFromKey(key);
    me.updateAnimation(dtMs, moved, facing);
    return moved;
  }

  onLocalMoved(cb: MoveCb) {
    this.onLocalMovedCb = cb;
  }

  /**
   * React pushes remote players' latest server state.
   * For each id, we create/update a sprite; we also remove any that disappeared.
   */
  syncRemotePlayers(
    players: Record<
      string,
      { id: string; name: string; x?: number; y?: number; f?: string | null }
    >
  ) {
    if (
      !this.assets ||
      !("playerSets" in this.assets) ||
      !this.assets.playerSets
    )
      return;
    const ts = this.renderer.tileSize();
    const scale = this.renderer.spriteScale();

    for (const p of Object.values(players)) {
      if (!p || p.id === this.cfg.player.id) {
        console.log("Not updating local player");
        continue;
      }
      let ent = this.remotes.get(p.id);
      if (!ent) {
        const sx =
          (typeof p.x === "number"
            ? p.x
            : (this.world as any).cfg.width * ts * 0.5) | 0;
        const sy =
          (typeof p.y === "number"
            ? p.y
            : (this.world as any).cfg.height * ts * 0.5) | 0;
        const set = this.assets.getSet(this.cfg.player.color || "blue");
        ent = new Player(p.id, sx, sy, set, p.name ?? p.id);
        ent.updateDimensions(scale);
        this.remotes.set(p.id, ent);
      }
      if (typeof p.x === "number") ent.x = p.x;
      if (typeof p.y === "number") ent.y = p.y;
      if (p.f) {
        const key =
          p.f === "left"
            ? "ArrowLeft"
            : p.f === "right"
            ? "ArrowRight"
            : p.f === "up"
            ? "ArrowUp"
            : "ArrowDown";
        ent.setFacingFromKey(key);
      }
    }

    for (const id of Array.from(this.remotes.keys())) {
      if (!players[id]) {
        this.remotes.delete(id);
      }
    }
  }

  private onResize = () => {
    const oldTs = this.renderer.tileSize();
    let tx: number | undefined, ty: number | undefined;
    if (this.mainPlayer) {
      tx = this.mainPlayer.x / oldTs;
      ty = this.mainPlayer.y / oldTs;
    }
    this.renderer.sizeToWindow();

    const newTs = this.renderer.tileSize();
    this.world.rebuildBoundaries(newTs);
    if (this.mainPlayer && tx !== undefined && ty !== undefined) {
      this.mainPlayer.x = tx * newTs;
      this.mainPlayer.y = ty * newTs;
      this.mainPlayer.updateDimensions(this.renderer.spriteScale());
    }
    for (const p of this.remotes.values())
      p.updateDimensions(this.renderer.spriteScale());
  };
}
