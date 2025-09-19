import { collisions } from "../data/Collisions";
import { Boundary } from "../entities/Boundary";
import { Entity } from "../entities/Entity";

export type WorldConfig = {
  width: number;
  height: number;
  collisionCode: number;
};

export class World {
  private cfg: WorldConfig;
  private boundaries: Boundary[] = [];
  private tileSizeCss = 16;

  constructor(cfg: WorldConfig) {
    this.cfg = cfg;
  }

  async ensureCollisions() {
    // collisions imported at top
    const expected = this.cfg.width * this.cfg.height;
    if (collisions.length !== expected) {
      console.warn(
        `[World] collisions length ${collisions.length} != ${expected} (W×H=${this.cfg.width}×${this.cfg.height}). ` +
          `Map will render; collisions may be off.`
      );
    }
    this.rebuildBoundaries(this.tileSizeCss);
  }

  rebuildBoundaries(tileSizeCss: number) {
    this.tileSizeCss = tileSizeCss;
    const b: Boundary[] = [];
    const { width: W, height: H, collisionCode } = this.cfg;

    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        if (collisions[r * W + c] === collisionCode) {
          b.push(new Boundary(c * tileSizeCss, r * tileSizeCss, tileSizeCss));
        }
      }
    }
    this.boundaries = b;
  }

  collides(entity: Entity) {
    const hit = entity.getHitbox();
    const m = 2;
    const L = hit.left + m,
      R = hit.right - m,
      T = hit.top + m,
      B = hit.bottom - m;

    for (const bd of this.boundaries) {
      const bl = bd.position.x,
        bt = bd.position.y,
        br = bl + bd.width,
        bb = bt + bd.height;
      if (L < br && R > bl && T < bb && B > bt) return true;
    }
    return false;
  }

  debugDraw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = "rgba(255,0,0,0.25)";
    for (const bd of this.boundaries)
      ctx.fillRect(bd.position.x, bd.position.y, bd.width, bd.height);
    ctx.restore();
  }
}
