"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type NetState = { page: number; mx: number; my: number };
type Props = { low: boolean; state: React.RefObject<NetState>; onReady: () => void };

/* Live-rendered take on the "finance network" clip: stars and light lines,
   a data globe with connection arcs, floating finance dashboards, a contact
   network, and data streams over a grid. The camera position comes straight
   from page scroll, so there is nothing to load or seek. */

const CYAN = new THREE.Color("#4fd8ff");
const BLUE = new THREE.Color("#3b7bff");
const GREEN = new THREE.Color("#22d39a");
const NAVY = new THREE.Color("#03102b");
/** Pale sky used by the light theme. */
export const LIGHT_BG = new THREE.Color("#eaf2fb");

/** Theme for the scenery; set by NetworkWorld before its children build. */
const T = { light: false };
function applyTheme(light: boolean) {
  T.light = light;
  CYAN.set(light ? "#1d86d1" : "#4fd8ff");
  BLUE.set(light ? "#1a4fd0" : "#3b7bff");
  GREEN.set(light ? "#11a06c" : "#22d39a");
}
/** Glow (additive) on the dark theme; plain ink on the light theme. */
const blend = () => (T.light ? THREE.NormalBlending : THREE.AdditiveBlending);

function seeded(seed = 7) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
}

/** Camera route. Stage centres: globe z=-60, dashboards -110, network -160, streams -210. */
const PATH = new THREE.CatmullRomCurve3(
  [
    [0, 0, 18],
    [0, 0.5, -20],
    [6, 2, -48],
    [-3, 0, -90],
    [2, 0.5, -140],
    [0, -1.5, -190],
    [0, 0.5, -232],
    [0, 1, -262],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  "catmullrom",
  0.5,
);

/* ---------- canvas textures ---------- */

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function dotTex() {
  return canvasTex(64, 64, (g) => {
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(0.25, "rgba(255,255,255,0.8)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
  });
}

function glowTex() {
  return canvasTex(256, 256, (g) => {
    const r = g.createRadialGradient(128, 128, 60, 128, 128, 128);
    const c = T.light ? "29,134,209" : "79,216,255";
    const d = T.light ? "26,79,208" : "59,123,255";
    r.addColorStop(0, `rgba(${c},${T.light ? 0.22 : 0.55})`);
    r.addColorStop(0.5, `rgba(${d},${T.light ? 0.08 : 0.18})`);
    r.addColorStop(1, `rgba(${d},0)`);
    g.fillStyle = r;
    g.fillRect(0, 0, 256, 256);
  });
}

const FONT = '"Tinos", "Times New Roman", serif';

function panel(g: CanvasRenderingContext2D, w: number, h: number) {
  g.fillStyle = T.light ? "rgba(255,255,255,0.88)" : "rgba(8,30,70,0.72)";
  g.strokeStyle = T.light ? "rgba(26,79,208,0.28)" : "rgba(79,216,255,0.55)";
  g.lineWidth = 3;
  g.beginPath();
  g.roundRect(4, 4, w - 8, h - 8, 22);
  g.fill();
  g.stroke();
}

type Dash = "line" | "bars" | "donut" | "kpi" | "table";

function dashTex(kind: Dash, title: string, value: string, rnd: () => number) {
  const W = 512;
  const H = 320;
  return canvasTex(W, H, (g) => {
    panel(g, W, H);
    const ink = T.light ? "#0b2a5c" : "#ffffff";
    const soft = T.light ? "#4a6a90" : "rgba(200,230,255,0.85)";
    const acc = T.light ? "#1d86d1" : "rgba(79,216,255,0.8)";
    g.fillStyle = T.light ? "#4a6a90" : "rgba(160,220,255,0.85)";
    g.font = `600 24px ${FONT}`;
    g.fillText(title, 30, 50);
    g.fillStyle = ink;
    g.font = `700 40px ${FONT}`;
    g.fillText(value, 30, 100);
    const x0 = 30;
    const y0 = 130;
    const cw = W - 60;
    const ch = H - 160;
    if (kind === "line") {
      const pts: [number, number][] = [];
      let v = 0.4;
      for (let i = 0; i <= 24; i++) {
        v = Math.min(0.95, Math.max(0.1, v + (rnd() - 0.42) * 0.2));
        pts.push([x0 + (cw * i) / 24, y0 + ch * (1 - v)]);
      }
      const grad = g.createLinearGradient(0, y0, 0, y0 + ch);
      grad.addColorStop(0, "rgba(34,211,154,0.45)");
      grad.addColorStop(1, "rgba(34,211,154,0)");
      g.beginPath();
      g.moveTo(pts[0][0], y0 + ch);
      pts.forEach(([x, y]) => g.lineTo(x, y));
      g.lineTo(pts[pts.length - 1][0], y0 + ch);
      g.fillStyle = grad;
      g.fill();
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.strokeStyle = "#22d39a";
      g.lineWidth = 4;
      g.stroke();
    } else if (kind === "bars") {
      for (let i = 0; i < 12; i++) {
        const bh = ch * (0.25 + rnd() * 0.7);
        g.fillStyle = i % 3 === 2 ? "#22d39a" : acc;
        g.fillRect(x0 + i * (cw / 12) + 6, y0 + ch - bh, cw / 12 - 12, bh);
      }
    } else if (kind === "donut") {
      const cx = W - 120;
      const cy = 190;
      const parts = [0.42, 0.28, 0.18, 0.12];
      const cols = ["#22d39a", acc, "#3b7bff", T.light ? "#b9c8dc" : "rgba(255,255,255,0.5)"];
      let a = -Math.PI / 2;
      parts.forEach((p, i) => {
        g.beginPath();
        g.arc(cx, cy, 80, a, a + p * Math.PI * 2 - 0.04);
        g.strokeStyle = cols[i];
        g.lineWidth = 26;
        g.stroke();
        a += p * Math.PI * 2;
      });
      ["Collections", "Support", "Sales", "Other"].forEach((l, i) => {
        g.fillStyle = cols[i];
        g.fillRect(30, 150 + i * 36, 18, 18);
        g.fillStyle = soft;
        g.font = `22px ${FONT}`;
        g.fillText(l, 58, 167 + i * 36);
      });
    } else if (kind === "kpi") {
      const items = [
        ["Calls handled", "18,420"],
        ["First call resolution", "92%"],
        ["Avg handle time", "3m 41s"],
      ];
      items.forEach(([l, v], i) => {
        const y = y0 + 20 + i * 52;
        g.fillStyle = soft;
        g.font = `22px ${FONT}`;
        g.fillText(l, 30, y);
        g.fillStyle = "#22d39a";
        g.font = `700 26px ${FONT}`;
        g.fillText(v, W - 30 - g.measureText(v).width, y);
        g.fillStyle = T.light ? "rgba(26,79,208,0.12)" : "rgba(79,216,255,0.25)";
        g.fillRect(30, y + 12, cw, 4);
        g.fillStyle = acc;
        g.fillRect(30, y + 12, cw * (0.5 + rnd() * 0.45), 4);
      });
    } else {
      for (let r = 0; r < 5; r++) {
        const y = y0 + 10 + r * 32;
        g.fillStyle = T.light
          ? r % 2 ? "rgba(26,79,208,0.04)" : "rgba(26,79,208,0.09)"
          : r % 2 ? "rgba(79,216,255,0.08)" : "rgba(79,216,255,0.16)";
        g.fillRect(x0, y - 22, cw, 30);
        g.fillStyle = soft;
        g.font = `20px ${FONT}`;
        g.fillText(`INV-${2041 + r * 7}`, x0 + 12, y);
        const amt = `${(rnd() * 90000 + 4000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        g.fillText(amt, x0 + 200, y);
        g.fillStyle = r === 2 ? "#ffb547" : "#22d39a";
        g.fillText(r === 2 ? "Pending" : "Paid", x0 + cw - 90, y);
      }
    }
  });
}

type Icon = "headset" | "phone" | "chat" | "user" | "mail" | "chart" | "globe";

function iconTex(icon: Icon) {
  return canvasTex(160, 160, (g) => {
    g.translate(80, 80);
    g.beginPath();
    g.arc(0, 0, 66, 0, Math.PI * 2);
    g.fillStyle = T.light ? "rgba(255,255,255,0.95)" : "rgba(8,30,70,0.85)";
    g.fill();
    g.strokeStyle = T.light ? "#1d86d1" : "rgba(79,216,255,0.9)";
    g.lineWidth = 5;
    g.stroke();
    g.strokeStyle = T.light ? "#0b3a8c" : "#bff3ff";
    g.fillStyle = T.light ? "#0b3a8c" : "#bff3ff";
    g.lineWidth = 7;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    if (icon === "headset") {
      g.arc(0, 4, 30, Math.PI, 0);
      g.stroke();
      g.fillRect(-38, 0, 14, 26);
      g.fillRect(24, 0, 14, 26);
      g.beginPath();
      g.moveTo(31, 26);
      g.quadraticCurveTo(28, 40, 8, 40);
      g.stroke();
    } else if (icon === "phone") {
      g.moveTo(-26, -30);
      g.lineTo(-14, -32);
      g.lineTo(-6, -14);
      g.lineTo(-16, -6);
      g.quadraticCurveTo(-6, 12, 8, 18);
      g.lineTo(16, 8);
      g.lineTo(32, 16);
      g.lineTo(30, 28);
      g.quadraticCurveTo(-30, 30, -26, -30);
      g.stroke();
    } else if (icon === "chat") {
      g.roundRect(-34, -28, 68, 46, 12);
      g.moveTo(-14, 18);
      g.lineTo(-22, 34);
      g.lineTo(2, 18);
      g.stroke();
      [-14, 0, 14].forEach((x) => {
        g.beginPath();
        g.arc(x, -5, 4, 0, Math.PI * 2);
        g.fill();
      });
    } else if (icon === "user") {
      g.arc(0, -12, 14, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      g.arc(0, 34, 28, Math.PI, 0);
      g.stroke();
    } else if (icon === "mail") {
      g.rect(-32, -22, 64, 44);
      g.moveTo(-32, -22);
      g.lineTo(0, 4);
      g.lineTo(32, -22);
      g.stroke();
    } else if (icon === "chart") {
      g.moveTo(-30, 28);
      g.lineTo(-30, -30);
      g.moveTo(-30, 28);
      g.lineTo(32, 28);
      g.moveTo(-20, 14);
      g.lineTo(-4, -2);
      g.lineTo(8, 8);
      g.lineTo(28, -20);
      g.stroke();
    } else {
      g.arc(0, 0, 30, 0, Math.PI * 2);
      g.moveTo(-30, 0);
      g.lineTo(30, 0);
      g.moveTo(0, -30);
      g.bezierCurveTo(-20, -10, -20, 10, 0, 30);
      g.moveTo(0, -30);
      g.bezierCurveTo(20, -10, 20, 10, 0, 30);
      g.stroke();
    }
  });
}

/* ---------- scene parts ---------- */

function Stars({ count, tex }: { count: number; tex: THREE.Texture }) {
  const geo = useMemo(() => {
    const r = seeded(3);
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const tmp = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const z = 30 - r() * 320;
      const ang = r() * Math.PI * 2;
      const rad = 6 + r() * 60;
      p.set([Math.cos(ang) * rad, Math.sin(ang) * rad * 0.6, z], i * 3);
      tmp.copy(r() < 0.7 ? CYAN : BLUE).multiplyScalar(0.6 + r() * 0.6);
      c.set([tmp.r, tmp.g, tmp.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    return g;
  }, [count]);
  return (
    <points geometry={geo}>
      <pointsMaterial
        map={tex}
        size={0.45}
        vertexColors
        transparent
        depthWrite={false}
        blending={blend()}
      />
    </points>
  );
}

/** Long curved light lines sweeping past the camera (opening and closing). */
function LightLines({ z, count }: { z: number; count: number }) {
  const ref = useRef<THREE.Group>(null);
  const lines = useMemo(() => {
    const r = seeded(Math.abs(z) + 5);
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 ? 1 : -1;
      const y0 = (r() - 0.5) * 18;
      // Each line crosses from one side to the other in one unbroken curve.
      const pts = [
        new THREE.Vector3(side * (34 + r() * 10), y0, z + 10),
        new THREE.Vector3(side * (10 + r() * 6), y0 * 0.5 + (r() - 0.5) * 4, z - 12),
        new THREE.Vector3((r() - 0.5) * 3, y0 * 0.15, z - 32),
        new THREE.Vector3(-side * (12 + r() * 8), -y0 * 0.4, z - 50),
        new THREE.Vector3(-side * (34 + r() * 10), -y0 * 0.7, z - 66),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(
        new THREE.CatmullRomCurve3(pts).getPoints(140),
      );
      const mat = new THREE.LineBasicMaterial({
        color: r() < 0.5 ? CYAN : BLUE,
        transparent: true,
        opacity: 0.4 + r() * 0.45,
        blending: blend(),
        depthWrite: false,
      });
      return new THREE.Line(geo, mat);
    });
  }, [z, count]);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.15) * 0.05;
  });
  return (
    <group ref={ref}>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </group>
  );
}

/** Dotted globe with travelling arcs between "cities". */
function Globe({ low, dot, glow }: { low: boolean; dot: THREE.Texture; glow: THREE.Texture }) {
  const spin = useRef<THREE.Group>(null);
  const R = 11;
  const { dots, arcs, pulses } = useMemo(() => {
    const r = seeded(19);
    // Fibonacci sphere, thinned by a cheap "continent" noise so it reads as land.
    const N = low ? 2600 : 5200;
    const land = (v: THREE.Vector3) =>
      Math.sin(v.x * 2.1 + 1.3) * Math.cos(v.y * 2.7) + Math.sin(v.z * 3.1 + v.x * 1.7) * 0.8;
    const p: number[] = [];
    const v = new THREE.Vector3();
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      v.set(Math.cos(th) * rad, y, Math.sin(th) * rad);
      const isLand = land(v) > 0.35;
      if (!isLand && r() > 0.12) continue;
      p.push(v.x * R, v.y * R, v.z * R);
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));

    const city = () => {
      const a = r() * Math.PI * 2;
      const b = Math.acos(r() * 1.4 - 0.7);
      return new THREE.Vector3(Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a)).multiplyScalar(R);
    };
    const hub = city();
    const arcs: THREE.QuadraticBezierCurve3[] = [];
    for (let i = 0; i < 14; i++) {
      const a = i < 7 ? hub : city();
      const b = city();
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.setLength(R + a.distanceTo(b) * 0.45);
      arcs.push(new THREE.QuadraticBezierCurve3(a, mid, b));
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(arcs.length * 3), 3));
    return { dots: dg, arcs, pulses: pg };
  }, [low]);

  const arcLines = useMemo(
    () =>
      arcs.map(
        (c, i) =>
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(c.getPoints(60)),
            new THREE.LineBasicMaterial({
              color: i % 3 ? CYAN : GREEN,
              transparent: true,
              opacity: 0.8,
              blending: blend(),
              depthWrite: false,
            }),
          ),
      ),
    [arcs],
  );

  useFrame(({ clock }, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.06;
    const pos = pulses.getAttribute("position") as THREE.BufferAttribute;
    const t = clock.elapsedTime;
    arcs.forEach((c, i) => {
      const u = (t * 0.25 + i * 0.137) % 1;
      const q = c.getPoint(u);
      pos.setXYZ(i, q.x, q.y, q.z);
    });
    pos.needsUpdate = true;
  });

  return (
    <group position={[0, 0, -62]}>
      <sprite scale={[R * 3.1, R * 3.1, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={blend()} />
      </sprite>
      <group ref={spin} rotation={[0.35, 0, 0.1]}>
        <mesh>
          <sphereGeometry args={[R * 0.985, 48, 32]} />
          <meshBasicMaterial color={T.light ? "#ffffff" : "#04183f"} transparent opacity={T.light ? 0.92 : 0.85} />
        </mesh>
        <points geometry={dots}>
          <pointsMaterial
            map={dot}
            size={0.38}
            color={CYAN}
            transparent
            depthWrite={false}
            blending={blend()}
          />
        </points>
        {arcLines.map((l, i) => (
          <primitive key={i} object={l} />
        ))}
        <points geometry={pulses}>
          <pointsMaterial
            map={dot}
            size={1.1}
            color={GREEN}
            transparent
            depthWrite={false}
            blending={blend()}
          />
        </points>
      </group>
    </group>
  );
}

/** Floating finance dashboards the camera glides between. */
function Dashboards() {
  const items = useMemo(() => {
    const r = seeded(29);
    const specs: [Dash, string, string, [number, number, number], number][] = [
      ["line", "Portfolio value", "$1,354,237", [-9, 3.5, -100], 0.35],
      ["kpi", "Contact centre today", "Live", [9, -2.5, -104], -0.35],
      ["bars", "Monthly collections", "+12.4%", [-8, -4, -114], 0.3],
      ["donut", "Work mix", "4 processes", [8.5, 4, -118], -0.3],
      ["table", "Invoices", "Accounts receivable", [-7, 1, -128], 0.4],
      ["line", "Revenue growth", "+18.2% YoY", [7, -1, -132], -0.4],
    ];
    return specs.map(([k, t, v, p, ry]) => ({ tex: dashTex(k, t, v, r), p, ry, ph: r() * 6 }));
  }, []);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (m) m.position.y = items[i].p[1] + Math.sin(t * 0.5 + items[i].ph) * 0.25;
    });
  });
  return (
    <>
      {items.map((it, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          position={it.p}
          rotation={[0, it.ry, 0]}
        >
          <planeGeometry args={[6.4, 4]} />
          <meshBasicMaterial map={it.tex} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

/** Contact network: icon nodes joined by lines, with a voice waveform. */
function ContactNetwork() {
  const { nodes, lines } = useMemo(() => {
    const r = seeded(41);
    const icons: Icon[] = ["headset", "phone", "chat", "user", "mail", "chart", "globe", "user", "headset", "chat"];
    const nodes = icons.map((icon, i) => ({
      icon,
      tex: iconTex(icon),
      p: new THREE.Vector3(
        (i % 2 ? 1 : -1) * (7 + r() * 7),
        (r() - 0.5) * 10,
        -150 - i * 2.6 - r() * 2,
      ),
    }));
    const pts: THREE.Vector3[] = [];
    nodes.forEach((a, i) =>
      nodes.forEach((b, j) => {
        if (j > i && a.p.distanceTo(b.p) < 9) pts.push(a.p, b.p);
      }),
    );
    const lines = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({
        color: CYAN,
        transparent: true,
        opacity: 0.35,
        blending: blend(),
        depthWrite: false,
      }),
    );
    return { nodes, lines };
  }, []);

  const wave = useRef<THREE.InstancedMesh>(null);
  const BARS = 48;
  const tmp = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const m = wave.current;
    if (!m) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < BARS; i++) {
      const h = 0.2 + Math.abs(Math.sin(i * 0.45 + t * 2.2) * Math.cos(i * 0.17 - t)) * 2.4;
      tmp.position.set(-7 + i * 0.3, 0, 0);
      tmp.scale.set(1, h, 1);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <primitive object={lines} />
      {nodes.map((n, i) => (
        <sprite key={i} position={n.p} scale={[1.2, 1.2, 1]}>
          <spriteMaterial map={n.tex} transparent depthWrite={false} toneMapped={false} />
        </sprite>
      ))}
      <instancedMesh ref={wave} args={[undefined, undefined, BARS]} position={[-6, -5.5, -158]}>
        <boxGeometry args={[0.14, 1, 0.05]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.7} blending={blend()} />
      </instancedMesh>
    </>
  );
}

/** Flowing green/blue data streams over a grid floor. */
function Streams({ low }: { low: boolean }) {
  const COUNT = low ? 16 : 28;
  const SEG = 120;
  const { lines, seeds } = useMemo(() => {
    const r = seeded(53);
    const seeds = Array.from({ length: COUNT }, () => ({
      a: r() * Math.PI * 2,
      amp: 0.6 + r() * 1.8,
      y: -3 + r() * 2.5,
      z: -196 - r() * 26,
      side: r() < 0.5 ? -1 : 1,
    }));
    const lines = seeds.map((s, i) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SEG * 3), 3));
      return new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({
          color: i % 3 === 0 ? BLUE : i % 3 === 1 ? GREEN : CYAN,
          transparent: true,
          opacity: 0.45,
          blending: blend(),
          depthWrite: false,
        }),
      );
    });
    return { lines, seeds };
  }, [COUNT]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    lines.forEach((l, i) => {
      const s = seeds[i];
      const pos = l.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let k = 0; k < SEG; k++) {
        const u = k / (SEG - 1);
        // One unbroken line from left to right: fanned out at the edges,
        // pinched together in the middle, so there is no seam.
        const e = Math.abs(u - 0.5) * 2;
        const fan = 0.3 + 0.7 * e * e;
        const x = -42 + 84 * u;
        const y = -3.2 + (s.y + 1.75) * 2.2 * fan + Math.sin(u * 7 + t * 1.2 + s.a) * s.amp * (0.25 + 0.75 * fan);
        const z = -210 + (s.z + 209) * fan + Math.cos(u * 5 + t * 0.8 + s.a) * 1.5 * fan;
        pos.setXYZ(k, x, y, z);
      }
      pos.needsUpdate = true;
    });
  });

  const grid = useMemo(() => {
    const g = new THREE.GridHelper(120, 60, CYAN, CYAN);
    const m = g.material as THREE.LineBasicMaterial;
    m.transparent = true;
    m.opacity = 0.28;
    m.depthWrite = false;
    g.position.set(0, -6, -210);
    return g;
  }, []);

  return (
    <>
      <primitive object={grid} />
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </>
  );
}

/* ---------- camera ---------- */

function Rig({ state, onReady }: { state: React.RefObject<NetState>; onReady: () => void }) {
  const { camera } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const m = useRef({ x: 0, y: 0 });
  const frames = useRef(0);
  useFrame((_, dt) => {
    const s = state.current;
    const u = Math.min(0.999, Math.max(0, s.page));
    PATH.getPointAt(u, pos);
    PATH.getPointAt(Math.min(1, u + 0.02), look);
    m.current.x = THREE.MathUtils.damp(m.current.x, s.mx, 3, dt);
    m.current.y = THREE.MathUtils.damp(m.current.y, s.my, 3, dt);
    camera.position.set(pos.x + m.current.x * 0.8, pos.y + m.current.y * 0.5, pos.z);
    camera.lookAt(look.x, look.y, look.z);
    if (++frames.current === 3) onReady();
  });
  return null;
}

/** All network scenery (no camera, no canvas): used inside SiteScene. */
export function NetworkWorld({ low, light = false }: { low: boolean; light?: boolean }) {
  applyTheme(light);
  const tex = useMemo(() => ({ dot: dotTex(), glow: glowTex() }), []);
  useEffect(
    () => () => {
      tex.dot.dispose();
      tex.glow.dispose();
    },
    [tex],
  );
  return (
    <>
      <Stars count={low ? 1400 : 3200} tex={tex.dot} />
      <LightLines z={0} count={low ? 10 : 18} />
      <Globe low={low} dot={tex.dot} glow={tex.glow} />
      <Dashboards />
      <ContactNetwork />
      <Streams low={low} />
      <LightLines z={-232} count={low ? 8 : 14} />
    </>
  );
}

/** Camera position on the network route for a page progress u (0 to 1). */
export function networkCamera(u: number, pos: THREE.Vector3, look: THREE.Vector3) {
  const k = Math.min(0.999, Math.max(0, u));
  PATH.getPointAt(k, pos);
  PATH.getPointAt(Math.min(1, k + 0.02), look);
}

export const NETWORK_BG = NAVY;

export default function NetworkScene({ low, state, onReady }: Props) {
  const tex = useMemo(() => ({ dot: dotTex(), glow: glowTex() }), []);
  useEffect(() => () => {
    tex.dot.dispose();
    tex.glow.dispose();
  }, [tex]);
  return (
    <Canvas
      dpr={low ? 1 : [1, 1.5]}
      gl={{ antialias: !low, powerPreference: "high-performance", alpha: false }}
      camera={{ fov: 60, near: 0.1, far: 140, position: [0, 0, 18] }}
      onCreated={({ scene }) => {
        scene.background = NAVY;
        scene.fog = new THREE.Fog(NAVY, 35, 120);
      }}
    >
      <Rig state={state} onReady={onReady} />
      <Stars count={low ? 1400 : 3200} tex={tex.dot} />
      <LightLines z={0} count={low ? 10 : 18} />
      <Globe low={low} dot={tex.dot} glow={tex.glow} />
      <Dashboards />
      <ContactNetwork />
      <Streams low={low} />
      <LightLines z={-232} count={low ? 8 : 14} />
    </Canvas>
  );
}
