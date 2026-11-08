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
        <points geometry={pulse} frustumCulled={false}>
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

/* City: dense low-rise blocks on a road grid, painted walls with real-size
   windows (shader), roof water tanks, trees, street lights, moving traffic
   and a dusk sky. */

const BLOCK = 10; // road grid spacing
const CITY_SIZE = 240;
const MAIN_EVERY = 4; // every 4th road is a main road

function groundTex() {
  const N = CITY_SIZE / BLOCK; // cells across
  const px = 2048;
  const s = px / N;
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const g = c.getContext("2d")!;
  g.fillStyle = "#2a2a2a";
  g.fillRect(0, 0, px, px);
  const r = seeded(21);
  // blocks: dusty ground, some parks
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const park = r() < 0.07;
      g.fillStyle = park ? "#2f4a2c" : r() < 0.5 ? "#4a4339" : "#3f3b35";
      g.fillRect(i * s + s * 0.13, j * s + s * 0.13, s * 0.74, s * 0.74);
    }
  // lane markings on main roads
  g.strokeStyle = "rgba(230,220,190,0.35)";
  g.lineWidth = 1;
  g.setLineDash([6, 8]);
  for (let i = 0; i <= N; i += MAIN_EVERY) {
    g.beginPath();
    g.moveTo(i * s, 0);
    g.lineTo(i * s, px);
    g.moveTo(0, i * s);
    g.lineTo(px, i * s);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Walls get windows sized in world units; roofs stay plain and darker. */
function buildingMaterial() {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0 });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vWP; varying vec3 vON; varying float vSeed;",
      )
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 wp = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          wp = instanceMatrix * wp;
          vSeed = fract(sin(dot(instanceMatrix[3].xz, vec2(12.9898, 78.233))) * 43758.5453);
        #else
          vSeed = 0.5;
        #endif
        vWP = wp.xyz;
        vON = objectNormal;`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vWP; varying vec3 vON; varying float vSeed;
        float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        if (abs(vON.y) < 0.5) {
          float along = abs(vON.x) > 0.5 ? vWP.z : vWP.x;
          vec2 cell = vec2(along / 0.62, vWP.y / 0.72);
          vec2 f = fract(cell);
          vec2 id = floor(cell);
          float win = step(0.24, f.x) * step(f.x, 0.76) * step(0.28, f.y) * step(f.y, 0.78);
          float ground = 1.0 - step(0.72, vWP.y);
          win *= 1.0 - ground;
          float r = h21(id + vSeed * 91.7);
          float lit = step(0.52, r);
          vec3 warm = mix(vec3(1.0, 0.74, 0.42), vec3(0.78, 0.88, 1.0), step(0.86, h21(id + 7.3)));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.06, 0.08, 0.1), win * 0.85);
          totalEmissiveRadiance += win * lit * warm * (0.9 + 0.6 * h21(id + 1.7));
          // shop fronts along the ground floor
          float shop = ground * step(0.15, vWP.y) * step(0.45, vSeed);
          totalEmissiveRadiance += shop * vec3(1.0, 0.82, 0.55) * 0.55;
        } else {
          diffuseColor.rgb *= 0.62;
        }`,
      );
  };
  return m;
}

const PAINT = ["#d8cdb4", "#c9b08a", "#a7a9a6", "#c8a39a", "#d4c182", "#a9bccb", "#dcd8cf", "#b9a58d"];

function City({ low }: { low: boolean }) {
  const ground = useMemo(groundTex, []);
  const bMat = useMemo(buildingMaterial, []);
  const buildings = useRef<THREE.InstancedMesh>(null);
  const tanks = useRef<THREE.InstancedMesh>(null);
  const trees = useRef<THREE.InstancedMesh>(null);
  const MAXB = low ? 1600 : 3600;
  const MAXT = low ? 500 : 1200;
  const MAXTREE = low ? 600 : 1500;

  useEffect(() => {
    const B = buildings.current;
    const T = tanks.current;
    const TR = trees.current;
    if (!B || !T || !TR) return;
    const r = seeded(33);
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    let nb = 0;
    let nt = 0;
    let ntr = 0;
    const N = CITY_SIZE / BLOCK;
    const density = low ? 0.42 : 0.68;
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) {
        const bx = -CITY_SIZE / 2 + i * BLOCK;
        const bz = -CITY_SIZE / 2 + j * BLOCK;
        const cx = bx + BLOCK / 2;
        const cz = bz + BLOCK / 2;
        if (Math.abs(cx) < 14 && cz < -36 && cz > -66) continue; // office plot
        const park = r() < 0.07;
        const centre = Math.hypot(cx, cz);
        for (let a = 0; a < 3; a++)
          for (let b = 0; b < 3; b++) {
            const lx = bx + 2.2 + a * 2.8;
            const lz = bz + 2.2 + b * 2.8;
            if (park || r() > density) {
              // trees on empty lots and parks
              if (ntr < MAXTREE && r() < (park ? 0.9 : 0.35)) {
                const s = 0.6 + r() * 0.7;
                o.position.set(lx + (r() - 0.5), s * 0.9, lz + (r() - 0.5));
                o.scale.set(s, s * 1.1, s);
                o.updateMatrix();
                TR.setMatrixAt(ntr++, o.matrix);
              }
              continue;
            }
            if (nb >= MAXB) continue;
            const w = 1.7 + r() * 0.9;
            const d = 1.7 + r() * 0.9;
            const tall = centre < 60 && r() < 0.12;
            const storeys = tall ? 6 + Math.floor(r() * 10) : 2 + Math.floor(Math.pow(r(), 1.6) * 4);
            const h = storeys * 0.72 + 0.1;
            o.position.set(lx, h / 2, lz);
            o.scale.set(w, h, d);
            o.updateMatrix();
            B.setMatrixAt(nb, o.matrix);
            col.set(PAINT[Math.floor(r() * PAINT.length)]).multiplyScalar(0.5 + r() * 0.18);
            B.setColorAt(nb, col);
            nb++;
            // rooftop water tanks, a common sight
            if (nt < MAXT && r() < 0.45) {
              o.position.set(lx + (r() - 0.5) * w * 0.5, h + 0.22, lz + (r() - 0.5) * d * 0.5);
              o.scale.set(1, 1, 1);
              o.updateMatrix();
              T.setMatrixAt(nt++, o.matrix);
            }
          }
      }
    B.count = nb;
    T.count = nt;
    TR.count = ntr;
    [B, T, TR].forEach((m) => (m.instanceMatrix.needsUpdate = true));
    if (B.instanceColor) B.instanceColor.needsUpdate = true;
  }, [low, MAXB, MAXT, MAXTREE]);

  return (
    <group position={CITY_O}>
      <DuskSky />
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[CITY_SIZE, CITY_SIZE]} />
        <meshStandardMaterial map={ground} roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.05}>
        <planeGeometry args={[1400, 1400]} />
        <meshStandardMaterial color="#2a2722" roughness={1} />
      </mesh>
      <instancedMesh ref={buildings} args={[undefined, undefined, MAXB]} material={bMat} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <instancedMesh ref={tanks} args={[undefined, undefined, MAXT]} frustumCulled={false}>
        <cylinderGeometry args={[0.22, 0.22, 0.4, 10]} />
        <meshStandardMaterial color="#1c1f22" roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={trees} args={[undefined, undefined, MAXTREE]} frustumCulled={false}>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#2c4a26" roughness={1} flatShading />
      </instancedMesh>
      <StreetLights />
      <Traffic low={low} />
      <FarLights low={low} />
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
      <Tower win={TOWER_WIN()} />
    </group>
  );
}

let towerWin: THREE.Texture | null = null;
function TOWER_WIN() {
  if (!towerWin) {
    towerWin = windowTexture();
    towerWin.wrapS = towerWin.wrapT = THREE.RepeatWrapping;
  }
  return towerWin;
}

/** Deep blue overhead fading to a warm dusk glow at the horizon. */
function DuskSky() {
  return (
    <mesh>
      <sphereGeometry args={[600, 32, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        vertexShader={`varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`varying vec3 vP; void main(){
          float h = clamp(vP.y, -0.1, 1.0);
          vec3 top = vec3(0.03, 0.07, 0.18);
          vec3 mid = vec3(0.16, 0.18, 0.32);
          vec3 low = vec3(0.62, 0.36, 0.26);
          vec3 c = mix(low, mid, smoothstep(0.0, 0.12, h));
          c = mix(c, top, smoothstep(0.12, 0.6, h));
          gl_FragColor = vec4(c, 1.0);
        }`}
      />
    </mesh>
  );
}

/** Warm street lights along every road. */
function StreetLights() {
  const geo = useMemo(() => {
    const p: number[] = [];
    const half = CITY_SIZE / 2;
    for (let k = 0; k <= CITY_SIZE / BLOCK; k++) {
      const line = -half + k * BLOCK;
      for (let t = -half; t < half; t += 3.2) {
        p.push(line + 0.75, 0.6, t, line - 0.75, 0.6, t + 1.6);
        p.push(t, 0.6, line + 0.75, t + 1.6, 0.6, line - 0.75);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, []);
  const dot = useMemo(dotTex, []);
  return (
    <points geometry={geo}>
      <pointsMaterial
        map={dot}
        size={0.7}
        color="#ffbf73"
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Head and tail lights moving along the main roads. */
function Traffic({ low }: { low: boolean }) {
  const COUNT = low ? 160 : 360;
  const dot = useMemo(dotTex, []);
  const cars = useMemo(() => {
    const r = seeded(61);
    const half = CITY_SIZE / 2;
    const mains: number[] = [];
    for (let k = 0; k <= CITY_SIZE / BLOCK; k += MAIN_EVERY) mains.push(-half + k * BLOCK);
    return Array.from({ length: COUNT }, () => ({
      line: mains[Math.floor(r() * mains.length)],
      vertical: r() < 0.5,
      dir: r() < 0.5 ? 1 : -1,
      off: r() * CITY_SIZE,
      speed: 4 + r() * 5,
    }));
  }, [COUNT]);
  const { geo, colors } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
    const c = new Float32Array(COUNT * 3);
    cars.forEach((car, i) => {
      // facing the camera (towards -z travel) shows headlights, else tail lights
      const head = car.dir > 0;
      c.set(head ? [1, 0.95, 0.85] : [1, 0.18, 0.12], i * 3);
    });
    g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    return { geo: g, colors: c };
  }, [cars, COUNT]);
  void colors;
  useFrame(({ clock }) => {
    const pos = geo.getAttribute("position") as THREE.BufferAttribute;
    const t = clock.elapsedTime;
    const half = CITY_SIZE / 2;
    cars.forEach((c, i) => {
      const s = ((c.off + c.dir * t * c.speed) % CITY_SIZE + CITY_SIZE) % CITY_SIZE - half;
      const lane = c.dir * 0.45;
      if (c.vertical) pos.setXYZ(i, c.line + lane, 0.25, s);
      else pos.setXYZ(i, s, 0.25, c.line + lane);
    });
    pos.needsUpdate = true;
  });
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial
        map={dot}
        size={0.55}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Lights of the wider city beyond the modelled blocks, fading into haze. */
function FarLights({ low }: { low: boolean }) {
  const geo = useMemo(() => {
    const r = seeded(71);
    const n = low ? 2500 : 6000;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      let x = 0;
      let z = 0;
      do {
        x = (r() - 0.5) * 900;
        z = (r() - 0.5) * 900;
      } while (Math.abs(x) < CITY_SIZE / 2 + 4 && Math.abs(z) < CITY_SIZE / 2 + 4);
      p.set([x, 0.4 + r() * 2, z], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [low]);
  const dot = useMemo(dotTex, []);
  return (
    <points geometry={geo}>
      <pointsMaterial
        map={dot}
        size={1.4}
        color="#ffc98a"
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
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
          color="#1d3554"
          metalness={0.8}
          roughness={0.15}
          emissiveMap={glass}
          emissive="#bfe2ff"
          emissiveIntensity={0.45}
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
