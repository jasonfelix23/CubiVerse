export class Boundary {
  position: { x: number; y: number };
  width: number;
  height: number;

  constructor(x: number, y: number, size: number) {
    this.position = { x, y };
    this.width = size;
    this.height = size;
  }
}
