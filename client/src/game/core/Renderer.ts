export class Renderer {
  public ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private container: HTMLElement | null;
  private mapW: number;
  private mapH: number;
  private viewScaleTarget: number;
  private _cssW = 0;
  private _cssH = 0;
  private dpr = 1;
  private _mql?: MediaQueryList;

  public readonly aspect: number;

  constructor(
    canvas: HTMLCanvasElement,
    mapW: number,
    mapH: number,
    viewScaleTarget: number
  ) {
    this.canvas = canvas;
    this.container = canvas.parentElement;
    this.mapW = mapW;
    this.mapH = mapH;
    this.viewScaleTarget = Math.max(0.2, Math.min(1, viewScaleTarget));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context unavailable");
    this.ctx = ctx;
    this.aspect = this.mapW / this.mapH;
    this.ctx.imageSmoothingEnabled = false;
    this.sizeToWindow();
  }

  attach() {
    window.addEventListener("resize", this._onResize, { passive: true });
    this._mql = matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    this._mql.addEventListener("change", this._onDPRChange, { passive: true });
  }

  detach() {
    window.removeEventListener("resize", this._onResize);
    this._mql?.removeEventListener("change", this._onDPRChange);
  }

  private _onResize = () => this.sizeToWindow();
  private _onDPRChange = () => this.sizeToWindow();

  sizeToWindow() {
    // Prefer container size if present
    const cw = this.container?.clientWidth ?? 0;
    const ch = this.container?.clientHeight ?? 0;

    // Otherwise, use viewport
    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;

    // Base sizes
    let baseW = cw > 0 ? cw : Math.floor(vw * this.viewScaleTarget);
    let baseH = ch > 0 ? ch : vh;

    // Fallback if everything is zero (rare but can happen during early mount)
    if (!baseW || !baseH) {
      baseW = 800;
      baseH = 600;
    }

    // Preserve aspect
    let cssW = baseW;
    let cssH = Math.floor(baseW / this.aspect);
    if (cssH > baseH) {
      cssH = baseH;
      cssW = Math.floor(baseH * this.aspect);
    }

    this._cssH = cssH;
    this._cssW = cssW;

    this.dpr = Math.max(1, window.devicePixelRatio || 1);
    this.canvas.style.width = `${cssW}px`;
    this.canvas.style.height = `${cssH}px`;
    this.canvas.width = Math.floor(cssW * this.dpr);
    this.canvas.height = Math.floor(cssH * this.dpr);

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    console.log("[Renderer] sized", {
      cssW,
      cssH,
      dpr: this.dpr,
      cw,
      ch,
      vw,
      vh,
    });
    return { cssW, cssH, dpr: this.dpr };
  }

  cssWidth() {
    return this._cssW;
  }
  cssHeight() {
    return this._cssH;
  }

  tileSize() {
    return this._cssW / this.mapW;
  }

  spriteScale() {
    return this._cssW / (this.mapW * 12); //change the size of the character here.
  }

  setMapSize(mapW: number, mapH: number) {
    (this as any).mapW = mapW;
    (this as any).mapH = mapH;
    (this as any).aspect = mapW / mapH;
    this.sizeToWindow();
  }

  clientToWorld(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return { x, y };
  }

  worldPxToTile(x: number, y: number) {
    const ts = this.tileSize();
    return { tx: Math.floor(x / ts), ty: Math.floor(y / ts) };
  }

  tileToWorldPx(tx: number, ty: number) {
    const ts = this.tileSize();
    return { x: tx * ts, y: ty * ts };
  }

  drawBegin(mapImage: HTMLImageElement) {
    this.ctx.clearRect(0, 0, this._cssW, this._cssH);
    this.ctx.drawImage(mapImage, 0, 0, this._cssW, this._cssH);
  }

  drawEnd() {}

  debugMarker() {
    this.ctx.save();
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(0, 0, 2, 2);
    this.ctx.fillStyle = "white";
    this.ctx.font = "12px Arial";
    this.ctx.fillText(
      `w:${Math.round(this._cssW)} h:${Math.round(this._cssH)}}`,
      40,
      24
    );
    this.ctx.restore();
  }
}
