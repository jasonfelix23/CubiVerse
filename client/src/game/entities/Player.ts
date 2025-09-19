import { PlayerImages } from "../types";
import { Entity } from "./Entity";

type Facing = "up" | "down" | "left" | "right";

export class Player extends Entity {
  private facing: Facing = "down";
  private frameElapsedMs = 0;
  private frameIndex = 1;
  private readonly FRAME_COUNT = 3;
  private readonly FRAME_MS = 120;
  private tx = 0;
  private ty = 0;

  private moving = false;
  constructor(
    id: string,
    x: number,
    y: number,
    images: Required<PlayerImages>,
    name: string
  ) {
    super(id, x, y, images, name);
  }

  cloneMoved(dx: number, dy: number, tileSize?: number) {
    const p = new Player(
      this.id,
      this.x + dx,
      this.y + dy,
      this.images,
      this.name
    );
    p.updateDimensions(this.scale);
    p.facing = this.facing;
    p.frameIndex = this.frameIndex;
    p.tx = this.tx + dx;
    p.ty = this.ty + dy;
    if (tileSize !== undefined) p.syncPixelsFromTiles(tileSize);

    return p;
  }

  setTilePosition(tx: number, ty: number, tileSize?: number) {
    this.tx = tx;
    this.ty = ty;
    if (tileSize !== undefined) this.syncPixelsFromTiles(tileSize);
  }
  moveTiles(dtx: number, dty: number, tileSize?: number) {
    this.tx += dtx;
    this.ty += dty;
    if (tileSize !== undefined) this.syncPixelsFromTiles(tileSize);
  }

  /** Keep x/y and tx/ty consistent when you know tileSize (CSS px per tile). */
  syncPixelsFromTiles(tileSize: number) {
    this.x = this.tx * tileSize;
    this.y = this.ty * tileSize;
  }
  syncTilesFromPixels(tileSize: number) {
    this.tx = this.x / tileSize;
    this.ty = this.y / tileSize;
  }

  getTilePosition() {
    return { tx: this.tx, ty: this.ty };
  }

  updateAnimation(dtMs: number, isMoving: boolean, newFacing?: Facing) {
    if (newFacing) this.facing = newFacing;

    this.moving = this.moving;
    if (!isMoving) {
      this.frameIndex = 1;
      this.frameElapsedMs = 0;
      return;
    }

    this.frameElapsedMs += dtMs;
    while (this.frameElapsedMs >= this.FRAME_MS) {
      this.frameElapsedMs -= this.FRAME_MS;
      this.frameIndex = (this.frameIndex + 1) % this.FRAME_COUNT;
    }
  }

  draw(ctx: CanvasRenderingContext2D, isMain: boolean, tileSize?: number) {
    const strip =
      this.facing === "down"
        ? this.images.down
        : this.facing === "up"
        ? this.images.up
        : this.facing === "left"
        ? this.images.left
        : this.images.right;
    if (!strip) return;

    // Frame source (spritesheet)
    const sw = Math.floor(strip.naturalWidth / this.FRAME_COUNT);
    const sh = strip.naturalHeight * 1.2; // preserve your current look
    const sx = this.frameIndex * sw;
    const sy = 0;

    // Destination size (CSS px)
    const W = Math.round(sw * this.scale);
    const H = Math.round(sh * this.scale);

    // Anchor at center (consistent with your existing code)
    const centerX = tileSize !== undefined ? this.tx * tileSize : this.x;
    const centerY = tileSize !== undefined ? this.ty * tileSize : this.y;
    const dx = Math.round(centerX - W / 2);
    const dy = Math.round(centerY - H / 2);

    const prevSmoothing = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(strip, sx, sy, sw, sh, dx, dy, W, H);
    ctx.imageSmoothingEnabled = prevSmoothing;

    // Nameplate
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(this.name, Math.round(centerX), dy - 6);
  }

  // Feet-only hitbox (prevents “stuck on walls”)
  override getHitbox() {
    const strip =
      this.facing === "down"
        ? this.images.down
        : this.facing === "up"
        ? this.images.up
        : this.facing === "left"
        ? this.images.left
        : this.images.right;

    const sw = Math.floor(strip.naturalWidth / 3); // frame width
    const sh = strip.naturalHeight; // frame height

    const W = Math.round(sw * this.scale);
    const H = Math.round(sh * this.scale);

    // feet box: narrower & short at bottom
    const feetW = Math.max(6, Math.floor(W * 0.35));
    const feetH = Math.max(4, Math.floor(H * 0.22));
    const left = this.x - feetW / 2;
    const right = this.x + feetW / 2;
    const bottom = this.y + H / 2;
    const top = bottom - feetH;

    return { left, right, top, bottom };
  }

  setFacingFromKey(key: string | null) {
    if (!key) return;
    if (key === "ArrowUp") this.facing = "up";
    else if (key === "ArrowDown") this.facing = "down";
    else if (key === "ArrowLeft") this.facing = "left";
    else if (key === "ArrowRight") this.facing = "right";
  }
}
