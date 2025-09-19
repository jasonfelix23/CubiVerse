import { PlayerImages } from "../types";

export abstract class Entity {
  id: string;
  name: string;
  x: number;
  y: number;
  images: Required<PlayerImages>;
  protected scale = 1;

  constructor(
    id: string,
    x: number,
    y: number,
    images: Required<PlayerImages>,
    name: string
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.images = images;
    this.name = name;
  }

  updateDimensions(scale: number) {
    this.scale = scale;
  }

  move(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
  }

  getHitbox() {
    const w = 16 * this.scale * 2;
    const h = 18 * this.scale * 2;
    return {
      left: this.x - w / 2,
      right: this.x + w / 2,
      top: this.y - h / 2,
      bottom: this.y + h / 2,
    };
  }

  abstract draw(ctx: CanvasRenderingContext2D, isMain: boolean): void;
}
