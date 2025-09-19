export class TileMap {
  readonly cols: number;
  readonly rows: number;
  image: HTMLImageElement | null = null;

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
  }

  setImage(img: HTMLImageElement) {
    this.image = img;
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    if (!this.image) return;
    ctx.drawImage(this.image, 0, 0, w, h);
  }
}
