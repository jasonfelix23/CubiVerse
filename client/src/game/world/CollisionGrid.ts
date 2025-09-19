export class CollisionGrid {
  readonly cols: number;
  readonly rows: number;
  readonly tileSizeCss: number;
  private solid: Set<number>;

  constructor(cols: number, rows: number, solidIndices: number[]) {
    this.cols = cols;
    this.rows = rows;
    this.tileSizeCss = 16;
    this.solid = new Set(solidIndices);
  }

  setTileSizeCss(px: number) {
    (this as any).tileSizeCss = px;
  }

  collidesRect(left: number, top: number, right: number, bottom: number) {
    const ts = this.tileSizeCss;
    const minCol = Math.floor(left / ts);
    const maxCol = Math.floor((right - 0.001) / ts);
    const minRow = Math.floor(top / ts);
    const maxRow = Math.floor((bottom - 0.001) / ts);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const idx = r * this.cols + c;
        if (this.solid.has(idx)) return true;
      }
    }
    return false;
  }
}
