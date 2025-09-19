import { ColorName, PlayerImages } from "../types";

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// Keep this list in sync with your ColorName union.
const COLORS: ColorName[] = [
  "blue",
  "red",
  "yellow",
  "green",
  "purple",
  "pink",
] as unknown as ColorName[];

function spritePaths(color: ColorName) {
  // IMPORTANT: These are served from Next.js /public.
  // If your files live in /public/Characters/Purple/... then prefix that here.
  // Also: path *and* directory names are case-sensitive in prod (Linux).
  const cap = (color.charAt(0).toUpperCase() + color.slice(1)) as
    | "Blue"
    | "Red"
    | "Yellow"
    | "Green"
    | "Purple"
    | "Pink";
  return {
    down: `/${cap}/neo_${color}_down.png`,
    up: `/${cap}/neo_${color}_up.png`,
    left: `/${cap}/neo_${color}_left.png`,
    right: `/${cap}/neo_${color}_right.png`,
  };
}

export class Assets {
  public mapImage: HTMLImageElement | null = null;
  public playerSets: Record<ColorName, Required<PlayerImages>> | null = null;

  async loadMap(src: string) {
    console.log("[Assets] loading map:", src);
    this.mapImage = await loadImage(src);
    console.log("[Assets] map loaded", {
      w: this.mapImage.naturalWidth,
      h: this.mapImage.naturalHeight,
    });
  }

  async loadPlayerSets() {
    console.log("[Assets] loading player sets");

    const results = await Promise.allSettled(
      COLORS.map(async (c) => {
        const p = spritePaths(c);
        const [down, up, left, right] = await Promise.all([
          loadImage(p.down),
          loadImage(p.up),
          loadImage(p.left),
          loadImage(p.right),
        ]);
        return [c, { down, up, left, right }] as const;
      })
    );

    const sets: Record<string, Required<PlayerImages>> = {};
    let okCount = 0;

    for (const r of results) {
      if (r.status === "fulfilled") {
        const [color, imgs] = r.value;
        sets[color] = imgs;
        okCount++;
      } else {
        console.warn(r.reason?.message ?? r.reason);
      }
    }

    if (okCount === 0) {
      // All failed → keep the original error behavior so we notice quickly.
      throw new Error(
        "[Assets] no player sets loaded — check /public paths & casing"
      );
    }

    // Assign only after at least one color loaded successfully.
    this.playerSets = sets as Record<ColorName, Required<PlayerImages>>;
    console.log(`[Assets] player sets loaded: ${Object.keys(sets).join(", ")}`);

    // const blue = await Promise.all([
    //   loadImage("/Blue/neo_blue_down.png"),
    //   loadImage("/Blue/neo_blue_up.png"),
    //   loadImage("/Blue/neo_blue_left.png"),
    //   loadImage("/Blue/neo_blue_right.png"),
    // ]);
    // const red = await Promise.all([
    //   loadImage("/Red/neo_red_down.png"),
    //   loadImage("/Red/neo_red_up.png"),
    //   loadImage("/Red/neo_red_left.png"),
    //   loadImage("/Red/neo_red_right.png"),
    // ]);
    // const yellow = await Promise.all([
    //   loadImage("/Yellow/neo_yellow_down.png"),
    //   loadImage("/Yellow/neo_yellow_up.png"),
    //   loadImage("/Yellow/neo_yellow_left.png"),
    //   loadImage("/Yellow/neo_yellow_right.png"),
    // ]);
    // const green = await Promise.all([
    //   loadImage("/Green/neo_green_down.png"),
    //   loadImage("/Green/neo_green_up.png"),
    //   loadImage("/Green/neo_green_left.png"),
    //   loadImage("/Green/neo_green_right.png"),
    // ]);
    // const purple = await Promise.all([
    //   loadImage("/Purple/neo_purple_down.png"),
    //   loadImage("/Purple/neo_purple_up.png"),
    //   loadImage("/Purple/neo_purple_left.png"),
    //   loadImage("/Purple/neo_purple_right.png"),
    // ]);
    // const pink = await Promise.all([
    //   loadImage("/Pink/neo_pink_down.png"),
    //   loadImage("/Pink/neo_pink_up.png"),
    //   loadImage("/Pink/neo_pink_left.png"),
    //   loadImage("/Pink/neo_pink_right.png"),
    // ]);

    // this.playerSets = {
    //   blue: { down: blue[0], up: blue[1], left: blue[2], right: blue[3] },
    //   red: { down: red[0], up: red[1], left: red[2], right: red[3] },
    //   yellow: {
    //     down: yellow[0],
    //     up: yellow[1],
    //     left: yellow[2],
    //     right: yellow[3],
    //   },
    //   green: { down: green[0], up: green[1], left: green[2], right: green[3] },
    //   purple: {
    //     down: purple[0],
    //     up: purple[1],
    //     left: purple[2],
    //     right: purple[3],
    //   },
    //   pink: { down: pink[0], up: pink[1], left: pink[2], right: pink[3] },
    // };
  }

  getSet(color: ColorName) {
    if (!this.playerSets) throw new Error("playerSets not loaded");
    // Fallback if a specific color failed to load but others succeeded
    return (
      this.playerSets[color] ||
      this.playerSets["purple" as ColorName] ||
      Object.values(this.playerSets)[0]
    );
  }

  hasSets() {
    return !!this.playerSets && Object.keys(this.playerSets).length > 0;
  }
}
