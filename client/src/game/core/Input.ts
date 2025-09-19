export class Input {
  private pressed = new Set<string>();
  private last: string | null = null;

  constructor() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.key.startsWith("Arrow")) {
      e.preventDefault();
      this.pressed.add(e.key);
      this.last = e.key;
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    if (e.key.startsWith("Arrow")) {
      this.pressed.delete(e.key);
      if (this.last === e.key) {
        const arr = Array.from(this.pressed);
        this.last = arr.length ? arr[arr.length - 1] : null;
      }
    }
  }

  lastArrow() {
    return this.last;
  }
}
