import * as THREE from "three";

/** Font family resolved from the page so canvas text uses Syne. */
const pageFont = () =>
  typeof document === "undefined"
    ? "system-ui, sans-serif"
    : getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";

function rounded(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

/** Front of the 3D card: the same "live call" design as the HTML card. */
export function callCardTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 640;
  const g = c.getContext("2d")!;
  const F = pageFont();

  const bg = g.createLinearGradient(0, 0, 1024, 640);
  bg.addColorStop(0, "#1a56c4");
  bg.addColorStop(0.55, "#012b75");
  bg.addColorStop(1, "#001a4d");
  g.fillStyle = bg;
  g.fillRect(0, 0, 1024, 640);
  g.globalAlpha = 0.08;
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(940, -40, 380, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;

  g.fillStyle = "#fff";
  g.font = `700 50px ${F}`;
  g.fillText("Inbound call", 56, 96);
  g.globalAlpha = 0.7;
  g.font = `500 30px ${F}`;
  g.fillText("Customer care, Hindi", 56, 140);
  g.globalAlpha = 1;

  g.fillStyle = "#139528";
  rounded(g, 830, 58, 138, 54, 27);
  g.fill();
  g.fillStyle = "#fff";
  g.font = `700 26px ${F}`;
  g.fillText("LIVE", 868, 94);

  for (let i = 0; i < 32; i++) {
    const h = 16 + Math.abs(Math.sin(i * 1.3)) * 60;
    const x = 56 + i * 28.5;
    const wg = g.createLinearGradient(0, 200 - h / 2, 0, 200 + h / 2);
    wg.addColorStop(0, "#2bd66b");
    wg.addColorStop(1, "#1a56c4");
    g.fillStyle = wg;
    rounded(g, x, 200 - h / 2, 14, h, 7);
    g.fill();
  }

  g.font = `500 28px ${F}`;
  g.fillStyle = "#ffffff";
  rounded(g, 56, 270, 640, 84, 26);
  g.fill();
  g.fillStyle = "#0b1526";
  g.fillText("Hi, I applied for a credit card last week.", 82, 322);

  g.fillStyle = "#139528";
  rounded(g, 300, 372, 668, 84, 26);
  g.fill();
  g.fillStyle = "#fff";
  g.fillText("Of course. Let me check that for you now.", 326, 424);

  g.strokeStyle = "#2bd66b";
  g.setLineDash([10, 8]);
  g.lineWidth = 3;
  rounded(g, 56, 500, 912, 88, 22);
  g.stroke();
  g.setLineDash([]);
  g.fillStyle = "#fff";
  g.font = `600 30px ${F}`;
  g.fillText("Call outcome", 86, 555);
  g.fillStyle = "#2bd66b";
  g.textAlign = "right";
  g.fillText("Resolved on first call", 938, 555);

  return finish(c);
}

/** Back of the card: white with the logo and tagline. */
export function logoCardTexture(logo: HTMLImageElement, tagline: string) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 640;
  const g = c.getContext("2d")!;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 1024, 640);
  const bar = g.createLinearGradient(0, 0, 1024, 0);
  bar.addColorStop(0, "#012b75");
  bar.addColorStop(1, "#139528");
  g.fillStyle = bar;
  g.fillRect(0, 600, 1024, 40);

  const w = 860;
  const h = (logo.naturalHeight / logo.naturalWidth) * w;
  g.drawImage(logo, (1024 - w) / 2, 270 - h / 2, w, h);
  g.fillStyle = "#012b75";
  g.font = `600 34px ${pageFont()}`;
  g.textAlign = "center";
  g.fillText(tagline, 512, 520);
  return finish(c);
}

/** Lit-window pattern for the skyline buildings. */
export function windowTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#1b3d6b";
  g.fillRect(0, 0, 64, 128);
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let y = 4; y < 128; y += 10) {
    for (let x = 4; x < 64; x += 10) {
      g.fillStyle = rnd() > 0.55 ? "rgba(255,236,170,0.95)" : "rgba(140,185,230,0.35)";
      g.fillRect(x, y, 6, 6);
    }
  }
  const t = finish(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function finish(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/**
 * Diagonal light streak for the glossy sweep across the card. The edges are
 * transparent so the streak can slide fully off the card.
 */
export function sheenTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 512, 512, 0);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(0.42, "rgba(255,255,255,0)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.55)");
  grad.addColorStop(0.53, "rgba(255,255,255,0.15)");
  grad.addColorStop(0.6, "rgba(255,255,255,0)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}
