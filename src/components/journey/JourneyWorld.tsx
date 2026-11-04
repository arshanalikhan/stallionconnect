"use client";
/* eslint-disable react-hooks/immutability, react-hooks/use-memo -- three.js textures are configured in place after loading */

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import logoFull from "@/assets/brand/logo-full.webp";
import { windowTexture } from "@/components/three/textures";

/* Code-built take on the "journey" clip: Earth from space, the India map,
   aerial Aligarh, the office tower, the office floor and the logo reveal.
   One camera route driven by page scroll, with soft navy dips between
   stages (the dip hides the jump between stage locations). All labels are
   real text, so spelling is always right. */

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const JOURNEY_BG = new THREE.Color("#020b1f");
const CYAN = new THREE.Color("#4fd8ff");
const GREEN = new THREE.Color("#22d39a");

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};
const lerp = THREE.MathUtils.lerp;
/** 0..1..0 window: fades in over [a,b], holds, fades out over [c,d]. */
const win = (u: number, a: number, b: number, c: number, d: number) =>
  smooth((u - a) / (b - a)) * (1 - smooth((u - c) / (d - c)));

function seeded(seed = 7) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
}

/** Shared progress so every label can read it without prop drilling. */
const J = { u: 0, fade: 0 };

/* ---------- stage layout ---------- */

// Each stage sits in its own region of the world; the camera jumps between
// them at the middle of a navy dip.
const MAP_O = new THREE.Vector3(0, -2000, 0);
const CITY_O = new THREE.Vector3(3000, 0, 0);
const OFFICE_O = new THREE.Vector3(6000, 0, 0);
const FINAL_O = new THREE.Vector3(9000, 0, 0);

const DIPS = [0.3, 0.5, 0.79, 0.92];
const DIP_W = 0.025;

/* India map plane: crop of the Blue Marble covering lon 62.6..104.8, lat 3.87..39.0. */
const MAP_W = 144;
const MAP_H = 120;
const LON0 = 62.6;
const LON1 = 104.8;
const LAT0 = 3.87;
const LAT1 = 39.0;
function mapXZ(lon: number, lat: number) {
  return new THREE.Vector3(
    ((lon - LON0) / (LON1 - LON0) - 0.5) * MAP_W,
    0,
    -((lat - LAT0) / (LAT1 - LAT0) - 0.5) * MAP_H,
  );
}
const ALIGARH = mapXZ(78.08, 27.88);

/** Camera for page progress u. Writes pos/look, returns the navy dip amount. */
export function journeyCamera(u: number, pos: THREE.Vector3, look: THREE.Vector3) {
  const k = clamp01(u);
  if (k < DIPS[0]) {
    // Earth: slow push in towards India.
    const t = smooth(k / DIPS[0]);
    pos.set(lerp(-4, 0, t), lerp(3, 1, t), lerp(42, 15.5, t));
    look.set(0, 0, 0);
  } else if (k < DIPS[1]) {
    // India map: high over the south, gliding north and down to Aligarh.
    const t = smooth((k - DIPS[0]) / (DIPS[1] - DIPS[0]));
    const from = mapXZ(77, 15);
    pos.set(lerp(from.x, ALIGARH.x, t), lerp(95, 30, t), lerp(from.z + 55, ALIGARH.z + 22, t)).add(MAP_O);
    look.set(lerp(from.x, ALIGARH.x, t), 0, lerp(from.z - 10, ALIGARH.z - 2, t)).add(MAP_O);
  } else if (k < DIPS[2]) {
    // Aligarh aerial, descending towards the office tower.
    const t = smooth((k - DIPS[1]) / (DIPS[2] - DIPS[1]));
    pos.set(lerp(-18, 0, t), lerp(70, 7, t), lerp(70, -22, t)).add(CITY_O);
    look.set(lerp(0, 0, t), lerp(0, 6, t), lerp(-10, -50, t)).add(CITY_O);
  } else if (k < DIPS[3]) {
    // Office floor: glide down the aisle to the logo wall.
    const t = smooth((k - DIPS[2]) / (DIPS[3] - DIPS[2]));
    pos.set(lerp(-3, 0, t), lerp(3.2, 2.2, t), lerp(14, -6, t)).add(OFFICE_O);
    look.set(0, lerp(1.6, 2.6, t), -16).add(OFFICE_O);
  } else {
    // Final logo reveal.
    const t = smooth((k - DIPS[3]) / (1 - DIPS[3]));
    pos.set(0, 0, lerp(16, 11, t)).add(FINAL_O);
    look.set(0, 0, 0).add(FINAL_O);
  }
  let dip = 0;
  for (const d of DIPS) dip = Math.max(dip, 1 - Math.abs(k - d) / DIP_W);
  return smooth(dip);
}

/* ---------- helpers ---------- */

const FONT = '"Tinos", "Times New Roman", serif';

/** Text sprite. Returns texture and its aspect ratio. */
function textTex(lines: { text: string; size: number; color: string; weight?: string; spacing?: number }[]) {
  const pad = 24;
  const c = document.createElement("canvas");
  const g = c.getContext("2d")!;
  const measure = lines.map((l) => {
    g.font = `${l.weight ?? "600"} ${l.size}px ${FONT}`;
    return g.measureText(l.text).width + (l.spacing ?? 0) * l.text.length;
  });
  c.width = Math.ceil(Math.max(...measure) + pad * 2);
  c.height = Math.ceil(lines.reduce((h, l) => h + l.size * 1.25, 0) + pad * 2);
  let y = pad;
  lines.forEach((l) => {
    g.font = `${l.weight ?? "600"} ${l.size}px ${FONT}`;
    g.fillStyle = l.color;
    g.textBaseline = "top";
    g.shadowColor = "rgba(0,0,0,0.6)";
    g.shadowBlur = 12;
    const sp = l.spacing ?? 0;
    const w = g.measureText(l.text).width + sp * l.text.length;
    let x = (c.width - w) / 2;
    if (sp) {
      for (const ch of l.text) {
        g.fillText(ch, x, y);
        x += g.measureText(ch).width + sp;
      }
    } else g.fillText(l.text, x, y);
    y += l.size * 1.25;
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return { tex: t, aspect: c.width / c.height };
}

function Label({
  lines,
  height,
  position,
  range,
}: {
  lines: Parameters<typeof textTex>[0];
  height: number;
  position: THREE.Vector3 | [number, number, number];
  range: [number, number, number, number];
}) {
  const { tex, aspect } = useMemo(() => textTex(lines), [lines]);
  const mat = useRef<THREE.SpriteMaterial>(null);
  useFrame(() => {
    if (mat.current) mat.current.opacity = win(J.u, ...range);
  });
  return (
    <sprite position={position} scale={[height * aspect, height, 1]}>
      <spriteMaterial ref={mat} map={tex} transparent depthWrite={false} toneMapped={false} opacity={0} />
    </sprite>
  );
}

function dotTex() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.3, "rgba(255,255,255,0.7)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/* ---------- stage 1: Earth ---------- */

const R = 10;
function latLon(lat: number, lon: number, r = R) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const th = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}
/** Spin that brings a longitude to face +z (the camera). */
function faceLon(lon: number) {
  const v = latLon(0, lon);
  return -Math.atan2(v.x, v.z);
}

const COUNTRIES: [string, number, number][] = [
  ["UNITED STATES", 39, -98],
  ["UNITED KINGDOM", 54, -2],
  ["UNITED ARAB EMIRATES", 24, 54],
  ["SINGAPORE", 1.35, 103.8],
];
const INDIA_LL: [number, number] = [22, 79];

function Earth({ dot }: { dot: THREE.Texture }) {
  const [day, night, clouds] = useLoader(THREE.TextureLoader, [
    `${base}/globe/earth.webp`,
    `${base}/globe/earth-night.webp`,
    `${base}/globe/clouds.webp`,
  ]);
  useMemo(() => {
    day.colorSpace = THREE.SRGBColorSpace;
    night.colorSpace = THREE.SRGBColorSpace;
    day.anisotropy = 8;
  }, [day, night]);

  const spin = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const camera = useThree((s) => s.camera);
  const start = faceLon(-20);
  const end = faceLon(INDIA_LL[1]);

  const arcs = useMemo(() => {
    const a = latLon(...INDIA_LL);
    return COUNTRIES.map(([, lat, lon]) => {
      const b = latLon(lat, lon);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.setLength(R + a.distanceTo(b) * 0.35);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      return {
        curve,
        geo: new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)),
      };
    });
  }, []);
  const arcMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const pulse = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(arcs.length * 3), 3));
    return g;
  }, [arcs]);
  const pulseMat = useRef<THREE.PointsMaterial>(null);
  const labels = useRef<(THREE.Sprite | null)[]>([]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const nrm = useMemo(() => new THREE.Vector3(), []);

  const countryTex = useMemo(
    () =>
      [["INDIA", ...INDIA_LL] as [string, number, number], ...COUNTRIES].map(([n]) =>
        textTex([{ text: n, size: 54, color: "#ffffff", spacing: 3 }]),
      ),
    [],
  );

  useFrame(({ clock }) => {
    const u = J.u;
    const t = smooth(u / DIPS[0]);
    if (spin.current) spin.current.rotation.y = lerp(start, end, t) + clock.elapsedTime * 0.004;
    if (cloudRef.current) cloudRef.current.rotation.y = clock.elapsedTime * 0.006;
    const show = win(u, 0.1, 0.15, 0.27, 0.3);
    arcs.forEach((a, i) => {
      const m = arcMats.current[i];
      if (m) m.opacity = show * 0.9;
      const p = a.curve.getPoint((clock.elapsedTime * 0.3 + i * 0.25) % 1);
      pulse.getAttribute("position").setXYZ(i, p.x, p.y, p.z);
    });
    pulse.getAttribute("position").needsUpdate = true;
    if (pulseMat.current) pulseMat.current.opacity = show;
    // Country labels: only on the side facing the camera.
    labels.current.forEach((s) => {
      if (!s) return;
      s.getWorldPosition(tmp);
      nrm.copy(tmp).normalize();
      const facing = clamp01((nrm.dot(tmp.clone().sub(camera.position).normalize().negate()) - 0.1) * 3);
      (s.material as THREE.SpriteMaterial).opacity = show * facing;
    });
  });

  return (
    <group rotation={[0.38, 0, 0]}>
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[R, 96, 64]} />
          <meshStandardMaterial
            map={day}
            emissiveMap={night}
            emissive="#ffcf8a"
            emissiveIntensity={0.9}
            roughness={0.85}
            metalness={0}
          />
        </mesh>
        <mesh ref={cloudRef}>
          <sphereGeometry args={[R * 1.012, 64, 48]} />
          <meshStandardMaterial map={clouds} transparent opacity={0.55} depthWrite={false} />
        </mesh>
        {arcs.map((a, i) => (
          <line key={i}>
            <primitive object={a.geo} attach="geometry" />
            <lineBasicMaterial
              ref={(m) => {
                arcMats.current[i] = m;
              }}
              color={i % 2 ? CYAN : GREEN}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </line>
        ))}
        <points geometry={pulse}>
          <pointsMaterial
            ref={pulseMat}
            map={dot}
            size={0.7}
            color={GREEN}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
        {[["INDIA", ...INDIA_LL] as [string, number, number], ...COUNTRIES].map(([n, lat, lon], i) => (
          <sprite
            key={n}
            ref={(s) => {
              labels.current[i] = s;
            }}
            position={latLon(lat, lon, R * 1.08)}
            scale={[0.9 * countryTex[i].aspect, 0.9, 1]}
          >
            <spriteMaterial map={countryTex[i].tex} transparent opacity={0} depthWrite={false} toneMapped={false} />
          </sprite>
        ))}
      </group>
      {/* atmosphere */}
      <mesh scale={1.06}>
        <sphereGeometry args={[R, 64, 48]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          vertexShader={`varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
          fragmentShader={`varying vec3 vN; void main(){ float i = pow(0.75 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(0.3,0.6,1.0,1.0) * i * 1.6; }`}
        />
      </mesh>
    </group>
  );
}

function Stars({ count, dot, spread }: { count: number; dot: THREE.Texture; spread: number }) {
  const geo = useMemo(() => {
    const r = seeded(5);
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(spread * (0.6 + r() * 0.4));
      p.set([v.x, v.y, v.z], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [count, spread]);
  return (
    <points geometry={geo}>
      <pointsMaterial map={dot} size={1.2} color="#cfe8ff" transparent depthWrite={false} fog={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ---------- stage 2: India map ---------- */

const CITIES: [string, number, number][] = [
  ["NEW DELHI", 77.21, 28.61],
  ["MUMBAI", 72.88, 19.08],
  ["BENGALURU", 77.59, 12.97],
  ["LUCKNOW", 80.95, 26.85],
];

function Pin({ at, color = GREEN, scale = 1 }: { at: THREE.Vector3; color?: THREE.Color; scale?: number }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const r = ring.current;
    if (!r) return;
    const k = (clock.elapsedTime * 0.6) % 1;
    r.scale.setScalar(scale * (1 + k * 2.5));
    (r.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - k);
  });
  return (
    <group position={at}>
      <mesh position-y={1.6 * scale} rotation-x={Math.PI}>
        <coneGeometry args={[0.55 * scale, 1.8 * scale, 24]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position-y={2.6 * scale}>
        <sphereGeometry args={[0.6 * scale, 24, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.05}>
        <ringGeometry args={[0.7, 0.9, 48]} />
        <meshBasicMaterial color={color} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function IndiaMap() {
  const [day, night] = useLoader(THREE.TextureLoader, [`${base}/globe/india.webp`, `${base}/globe/india-night.webp`]);
  useMemo(() => {
    day.colorSpace = THREE.SRGBColorSpace;
    night.colorSpace = THREE.SRGBColorSpace;
    day.anisotropy = 8;
  }, [day, night]);
  const routes = useMemo(() => {
    return CITIES.map(([, lon, lat]) => {
      const a = mapXZ(lon, lat);
      const b = ALIGARH;
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.y = a.distanceTo(b) * 0.25;
      return new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(48));
    });
  }, []);
  const routeMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  useFrame(() => {
    const o = win(J.u, 0.32, 0.36, 0.46, 0.5);
    routeMats.current.forEach((m) => m && (m.opacity = o * 0.9));
  });
  return (
    <group position={MAP_O}>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[MAP_W, MAP_H]} />
        <meshStandardMaterial map={day} emissiveMap={night} emissive="#ffd08a" emissiveIntensity={0.6} roughness={1} color="#9fb0c8" />
      </mesh>
      {/* ocean / edges fade into navy */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.2}>
        <planeGeometry args={[2000, 2000]} />
        <meshBasicMaterial color="#0a2448" />
      </mesh>
      {routes.map((g, i) => (
        <line key={i}>
          <primitive object={g} attach="geometry" />
          <lineBasicMaterial
            ref={(m) => {
              routeMats.current[i] = m;
            }}
            color={i % 2 ? CYAN : GREEN}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </line>
      ))}
      {CITIES.map(([n, lon, lat]) => {
        const p = mapXZ(lon, lat);
        return (
          <group key={n}>
            <Pin at={p} color={CYAN} scale={1.1} />
            <Label
              lines={[{ text: n, size: 56, color: "#ffffff", spacing: 3 }]}
              height={3.2}
              position={[p.x, 6.5, p.z]}
              range={[0.32, 0.35, 0.45, 0.48]}
            />
          </group>
        );
      })}
      <Pin at={ALIGARH} scale={1.2} />
    </group>
  );
}

/* ---------- stage 3: Aligarh aerial + office tower ---------- */

function groundTex() {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const g = c.getContext("2d")!;
  g.fillStyle = "#1a2433";
  g.fillRect(0, 0, 1024, 1024);
  const r = seeded(21);
  // patches of green and dust between roads
  for (let i = 0; i < 260; i++) {
    g.fillStyle = r() < 0.5 ? "rgba(48,72,52,0.55)" : "rgba(70,64,58,0.45)";
    g.fillRect(r() * 1024, r() * 1024, 20 + r() * 60, 20 + r() * 60);
  }
  // roads with warm light
  for (let i = 0; i <= 16; i++) {
    const p = i * 64;
    const main = i % 4 === 0;
    g.fillStyle = main ? "#3b3a3a" : "#2b2d31";
    g.fillRect(p - (main ? 7 : 4), 0, main ? 14 : 8, 1024);
    g.fillRect(0, p - (main ? 7 : 4), 1024, main ? 14 : 8);
    if (main) {
      g.fillStyle = "rgba(255,196,110,0.55)";
      for (let k = 0; k < 1024; k += 16) {
        g.fillRect(p - 8, k, 2, 2);
        g.fillRect(p + 6, k, 2, 2);
        g.fillRect(k, p - 8, 2, 2);
        g.fillRect(k, p + 6, 2, 2);
      }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function City({ low }: { low: boolean }) {
  const win = useMemo(() => {
    const t = windowTexture();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }, []);
  const ground = useMemo(groundTex, []);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const COUNT = low ? 700 : 1500;
  const SIZE = 160; // ground size; 16 road cells of 10 units

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const r = seeded(33);
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    let n = 0;
    for (let tries = 0; n < COUNT && tries < COUNT * 4; tries++) {
      const x = (r() - 0.5) * SIZE;
      const z = (r() - 0.5) * SIZE;
      const cx = ((x % 10) + 10) % 10;
      const cz = ((z % 10) + 10) % 10;
      if (cx < 1.8 || cx > 8.2 || cz < 1.8 || cz > 8.2) continue; // keep roads clear
      if (Math.abs(x) < 12 && z < -36 && z > -64) continue; // office plot
      const w = 1.2 + r() * 2.2;
      const d = 1.2 + r() * 2.2;
      const h = 1 + Math.pow(r(), 2.2) * (Math.hypot(x, z) < 40 ? 9 : 5);
      o.position.set(x, h / 2, z);
      o.scale.set(w, h, d);
      o.rotation.y = 0;
      o.updateMatrix();
      m.setMatrixAt(n, o.matrix);
      col.setHSL(0.6 + r() * 0.05, 0.18, 0.16 + r() * 0.14);
      m.setColorAt(n, col);
      n++;
    }
    m.count = n;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [COUNT]);

  return (
    <group position={CITY_O}>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial map={ground} roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.05}>
        <planeGeometry args={[1200, 1200]} />
        <meshBasicMaterial color="#0d1a2c" />
      </mesh>
      <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          roughness={0.9}
          emissiveMap={win}
          emissive="#ffd9a0"
          emissiveIntensity={0.9}
        />
      </instancedMesh>
      <Pin at={new THREE.Vector3(0, 0, -10)} scale={2.2} />
      <Label
        lines={[
          { text: "ALIGARH", size: 120, color: "#ffffff", weight: "700", spacing: 10 },
          { text: "UTTAR PRADESH, INDIA", size: 44, color: "#bfe9ff", spacing: 6 },
        ]}
        height={9}
        position={[0, 24, -10]}
        range={[0.51, 0.54, 0.63, 0.67]}
      />
      <Tower win={win} />
    </group>
  );
}

function Tower({ win }: { win: THREE.Texture }) {
  const glass = useMemo(() => {
    const t = win.clone();
    t.repeat.set(4, 6);
    t.needsUpdate = true;
    return t;
  }, [win]);
  return (
    <group position={[0, 0, -50]}>
      <mesh position-y={12}>
        <boxGeometry args={[16, 24, 12]} />
        <meshStandardMaterial
          color="#2a4a70"
          metalness={0.8}
          roughness={0.15}
          emissiveMap={glass}
          emissive="#bfe2ff"
          emissiveIntensity={0.7}
        />
      </mesh>
      {/* glowing entrance facing the camera */}
      <mesh position={[0, 2, 6.02]}>
        <planeGeometry args={[5, 4]} />
        <meshBasicMaterial color="#ffe7bd" toneMapped={false} />
      </mesh>
      <mesh position={[0, 4.4, 6.5]}>
        <boxGeometry args={[7, 0.3, 1.4]} />
        <meshStandardMaterial color="#d7e2ee" />
      </mesh>
      {/* brand accent strips */}
      {[-8.05, 8.05].map((x) => (
        <mesh key={x} position={[x, 12, 6.02]}>
          <boxGeometry args={[0.15, 24, 0.15]} />
          <meshBasicMaterial color={x < 0 ? GREEN : CYAN} toneMapped={false} />
        </mesh>
      ))}
      <Label
        lines={[{ text: "OFFICE", size: 110, color: "#ffffff", weight: "700", spacing: 14 }]}
        height={4.5}
        position={[0, 28, 2]}
        range={[0.68, 0.71, 0.76, 0.785]}
      />
    </group>
  );
}

/* ---------- stage 4: office floor ---------- */

function screenTex() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 160;
  const g = c.getContext("2d")!;
  const gr = g.createLinearGradient(0, 0, 256, 160);
  gr.addColorStop(0, "#0c3a7a");
  gr.addColorStop(1, "#0b5c6a");
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 160);
  g.fillStyle = "rgba(255,255,255,0.85)";
  g.fillRect(14, 14, 120, 10);
  g.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = 0; i < 5; i++) g.fillRect(14, 40 + i * 18, 140 - i * 12, 7);
  g.fillStyle = "#22d39a";
  g.fillRect(170, 40, 70, 90);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Office({ low }: { low: boolean }) {
  const logo = useLoader(THREE.TextureLoader, logoFull.src);
  useMemo(() => {
    logo.colorSpace = THREE.SRGBColorSpace;
    logo.anisotropy = 8;
  }, [logo]);
  const screen = useMemo(screenTex, []);
  const tagline = useMemo(
    () => textTex([{ text: "Where every connection counts", size: 64, color: "#0b3a8c", weight: "600" }]),
    [],
  );
  const desks = useRef<THREE.InstancedMesh>(null);
  const screens = useRef<THREE.InstancedMesh>(null);
  const chairs = useRef<THREE.InstancedMesh>(null);
  const rows = low ? 4 : 6;
  const cols = 6;

  useEffect(() => {
    const o = new THREE.Object3D();
    let n = 0;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        if (c === 2 || c === 3) continue; // centre aisle
        const x = (c - 2.5) * 3.2;
        const z = 8 - r * 3.6;
        o.position.set(x, 0.75, z);
        o.scale.set(2.6, 0.08, 1.2);
        o.rotation.set(0, 0, 0);
        o.updateMatrix();
        desks.current?.setMatrixAt(n, o.matrix);
        o.position.set(x, 1.25, z - 0.35);
        o.scale.set(0.95, 0.6, 1);
        o.updateMatrix();
        screens.current?.setMatrixAt(n, o.matrix);
        o.position.set(x, 0.5, z + 0.9);
        o.scale.set(0.6, 1, 0.6);
        o.updateMatrix();
        chairs.current?.setMatrixAt(n, o.matrix);
        n++;
      }
    [desks, screens, chairs].forEach((m) => {
      if (m.current) {
        m.current.count = n;
        m.current.instanceMatrix.needsUpdate = true;
      }
    });
  }, [rows]);
  const max = rows * cols;

  return (
    <group position={OFFICE_O}>
      {/* floor, ceiling, walls */}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[30, 40]} />
        <meshStandardMaterial color="#1a2536" roughness={0.25} metalness={0.3} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position-y={4.2}>
        <planeGeometry args={[30, 40]} />
        <meshStandardMaterial color="#0f1828" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 15, 2.1, 0]} rotation-y={(-s * Math.PI) / 2}>
          <planeGeometry args={[40, 4.2]} />
          <meshStandardMaterial color="#14324a" />
        </mesh>
      ))}
      {/* ceiling light strips */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0, 4.15, 12 - i * 5]}>
          <boxGeometry args={[18, 0.05, 0.25]} />
          <meshBasicMaterial color="#e8f4ff" toneMapped={false} />
        </mesh>
      ))}
      <instancedMesh ref={desks} args={[undefined, undefined, max]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#d8dee6" roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={screens} args={[undefined, undefined, max]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={screen} toneMapped={false} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={chairs} args={[undefined, undefined, max]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#12233c" roughness={0.6} />
      </instancedMesh>
      {/* logo wall */}
      <mesh position={[0, 2.1, -16]}>
        <planeGeometry args={[30, 4.2]} />
        <meshStandardMaterial color="#e9eef4" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.6, -15.95]}>
        <planeGeometry args={[7.2, 7.2 * (372 / 1200)]} />
        <meshBasicMaterial map={logo} transparent toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.35, -15.95]}>
        <planeGeometry args={[0.45 * tagline.aspect, 0.45]} />
        <meshBasicMaterial map={tagline.tex} transparent toneMapped={false} />
      </mesh>
      {[GREEN, CYAN].map((c, i) => (
        <mesh key={i} position={[0, 0.12 + i * 3.95, -15.9]}>
          <boxGeometry args={[30, 0.06, 0.06]} />
          <meshBasicMaterial color={c} toneMapped={false} />
        </mesh>
      ))}
      <pointLight position={[0, 3.5, -12]} intensity={20} distance={18} color="#cfe6ff" />
    </group>
  );
}

/* ---------- stage 5: final logo reveal ---------- */

function Final({ dot }: { dot: THREE.Texture }) {
  const logo = useLoader(THREE.TextureLoader, logoFull.src);
  const tagline = useMemo(
    () => textTex([{ text: "Where every connection counts", size: 64, color: "#cfe6ff", weight: "600" }]),
    [],
  );
  const plate = useRef<THREE.MeshBasicMaterial>(null);
  const trails = useMemo(() => {
    const r = seeded(77);
    return Array.from({ length: 14 }, (_, i) => {
      const y0 = (r() - 0.5) * 6;
      const pts = Array.from({ length: 6 }, (_, k) => new THREE.Vector3(-30 + k * 12, y0 + (r() - 0.5) * 5, -4 - r() * 6));
      return {
        geo: new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3(pts).getPoints(120)),
        color: i % 2 ? CYAN : GREEN,
      };
    });
  }, []);
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.2) * 0.03;
    if (plate.current) plate.current.opacity = 0.85 + Math.sin(clock.elapsedTime * 1.4) * 0.08;
  });
  return (
    <group position={FINAL_O}>
      <group ref={group}>
        {trails.map((t, i) => (
          <line key={i}>
            <primitive object={t.geo} attach="geometry" />
            <lineBasicMaterial color={t.color} transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} />
          </line>
        ))}
      </group>
      {/* soft light plate behind the logo so its blue lettering reads on navy */}
      <sprite scale={[14, 6.5, 1]} position-z={-0.5}>
        <spriteMaterial map={dot} color="#e6f2ff" transparent opacity={0.7} depthWrite={false} />
      </sprite>
      <mesh>
        <planeGeometry args={[8, 8 * (372 / 1200)]} />
        <meshBasicMaterial ref={plate} map={logo} transparent toneMapped={false} />
      </mesh>
      <mesh position-y={-2}>
        <planeGeometry args={[0.6 * tagline.aspect, 0.6]} />
        <meshBasicMaterial map={tagline.tex} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------- navy dip between stages ---------- */

export function JourneyFade() {
  const camera = useThree((s) => s.camera);
  const mesh = useRef<THREE.Mesh>(null);
  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    camera.add(m);
    return () => {
      camera.remove(m);
    };
  }, [camera]);
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    (m.material as THREE.MeshBasicMaterial).opacity = J.fade;
    m.visible = J.fade > 0.001;
  });
  return (
    // Behind the card (which sits 7 units out), in front of the scenery.
    <mesh ref={mesh} position={[0, 0, -9]} renderOrder={5}>
      <planeGeometry args={[60, 40]} />
      <meshBasicMaterial color={JOURNEY_BG} transparent depthWrite={false} fog={false} />
    </mesh>
  );
}

/** Progress setter used by the director in SiteScene. */
export function setJourneyProgress(u: number, fade: number) {
  J.u = u;
  J.fade = fade;
}

export function JourneyWorld({ low }: { low: boolean }) {
  const dot = useMemo(dotTex, []);
  return (
    <>
      <Stars count={low ? 1500 : 3000} dot={dot} spread={300} />
      <Earth dot={dot} />
      <Label
        lines={[{ text: "PLANET EARTH", size: 120, color: "#ffffff", weight: "400", spacing: 22 }]}
        height={1.5}
        position={[0, -6.2, 20]}
        range={[-1, 0, 0.07, 0.11]}
      />
      <IndiaMap />
      <City low={low} />
      <Office low={low} />
      <group position={FINAL_O}>
        <Stars count={600} dot={dot} spread={80} />
      </group>
      <Final dot={dot} />
    </>
  );
}
