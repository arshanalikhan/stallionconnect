"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import logoFull from "@/assets/brand/logo-full.webp";
import { SECTION_IDS, type Quality, type SceneState } from "./sceneState";
import { callCardTexture, logoCardTexture, sheenTexture, windowTexture } from "./textures";

type Props = {
  quality: Quality;
  state: React.RefObject<SceneState>;
  onReady: () => void;
};

const damp = THREE.MathUtils.damp;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};

/* ---------- colours (day and night) ---------- */
const DAY = new THREE.Color("#e3eefa");
const NIGHT = new THREE.Color("#06173a");
const GROUND_DAY = new THREE.Color("#e6eff9");
const GROUND_NIGHT = new THREE.Color("#0a1f45");
const BUILDING = new THREE.Color("#c9d6e6");
/** Live sky colour; also used by the fog, so both shift together. */
const SKY = DAY.clone();
/** Scratch vectors reused every frame to avoid allocations. */
const scratch = { pos: new THREE.Vector3(), look: new THREE.Vector3(), ahead: new THREE.Vector3() };

/** Seeded random so the city looks the same on every visit. */
function seeded(seed = 11) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
}

/** The camera's route down the avenue, from the hero to the contact section. */
const PATH = new THREE.CatmullRomCurve3(
  [
    [0, 3.2, 14],
    [0, 3.6, 0],
    [2.2, 4.6, -20],
    [-2.2, 6.2, -44],
    [0, 5.2, -68],
    [0, 4.4, -92],
    [2, 5.2, -116],
    [-1, 6.8, -140],
    [0, 9, -160],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  "catmullrom",
  0.4,
);

/* ---------- shared materials so the night shift can update them ---------- */
type Shared = {
  buildings: THREE.MeshStandardMaterial[];
  ground?: THREE.MeshBasicMaterial;
  grid?: THREE.Material;
  hemi?: THREE.HemisphereLight;
  sun?: THREE.DirectionalLight;
};

/** Only one scene exists per page, so a module-level registry is enough. */
const registry: Shared = { buildings: [] };

function Skyline({ quality }: { quality: Quality }) {
  const groups = useMemo(() => {
    const rnd = seeded();
    const tex = windowTexture();
    const kinds = [
      { w: 3, h: 9 },
      { w: 3.6, h: 15 },
      { w: 3.2, h: 22 },
      { w: 4.4, h: 32 },
    ];
    const spots: [number, number][][] = kinds.map(() => []);
    const fill = quality === "high" ? 0.5 : 0.28;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 30; j++) {
          if (rnd() > fill) continue;
          const k = rnd() < 0.45 ? 0 : rnd() < 0.55 ? 1 : rnd() < 0.7 ? 2 : 3;
          spots[k].push([side * (14 + i * 6.4 + (rnd() - 0.5) * 2), -18 - j * 6.2]);
        }
      }
    }
    return kinds.map((k, idx) => {
      const map = tex.clone();
      map.needsUpdate = true;
      map.repeat.set(k.w / 1.3, k.h / 1.7);
      const mat = new THREE.MeshStandardMaterial({
        color: "#c9d6e6",
        map,
        emissive: "#ffffff",
        emissiveMap: map,
        emissiveIntensity: 0.15,
        metalness: 0.3,
        roughness: 0.4,
      });
      return { geo: new THREE.BoxGeometry(k.w, k.h, k.w), mat, spots: spots[idx], h: k.h };
    });
  }, [quality]);

  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);
  useEffect(() => {
    registry.buildings = groups.map((g) => g.mat);
    const d = new THREE.Object3D();
    groups.forEach((gr, i) => {
      const im = refs.current[i];
      if (!im) return;
      gr.spots.forEach(([x, z], n) => {
        d.position.set(x, gr.h / 2, z);
        d.updateMatrix();
        im.setMatrixAt(n, d.matrix);
      });
      im.instanceMatrix.needsUpdate = true;
    });
    return () => groups.forEach((g) => (g.geo.dispose(), g.mat.dispose()));
  }, [groups]);

  return (
    <group>
      {groups.map((g, i) => (
        <instancedMesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          args={[g.geo, g.mat, g.spots.length]}
        />
      ))}
      <group position={[0, 0, -195]}>
        {[
          [5, 3.2, 26, 0],
          [3.4, 2.1, 24, 22],
          [2.2, 1.1, 22, 42],
          [0.9, 0.12, 18, 60],
        ].map(([r0, r1, h, y], i) => (
          <mesh key={i} position={[0, y + h / 2, 0]}>
            <cylinderGeometry args={[r1, r0, h, 24]} />
            <meshStandardMaterial color="#c3dbf1" metalness={0.7} roughness={0.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Ground() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[500, 500]} />
        <meshBasicMaterial
          ref={(m) => {
            if (m) registry.ground = m;
          }}
          color={GROUND_DAY}
        />
      </mesh>
      <gridHelper args={[500, 125, "#139528", "#139528"]} position-y={0.02}>
        <meshBasicMaterial
          ref={(m) => {
            if (m) registry.grid = m;
          }}
          attach="material"
          color="#139528"
          transparent
          opacity={0.12}
        />
      </gridHelper>
    </group>
  );
}

/** Four rings (Discover, Design, Deploy, Optimise) placed where "How we work" is read. */
function Gates({ state }: { state: React.RefObject<SceneState> }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    const [g0, g1] = state.current.gates;
    refs.current.forEach((m, i) => {
      if (!m) return;
      // Slightly after the section starts so the camera passes through while it is read.
      const u = Math.min(0.98, g0 + ((i + 0.6) / 4) * (g1 - g0) + 0.015);
      m.position.copy(PATH.getPointAt(u));
      m.lookAt(PATH.getPointAt(Math.min(1, u + 0.01), scratch.ahead));
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.2 + Math.sin(clock.elapsedTime * 2 - i) * 0.5;
    });
  });
  return (
    <group>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <torusGeometry args={[5.6, 0.13, 16, 80]} />
          <meshStandardMaterial color="#139528" emissive="#2bd66b" emissiveIntensity={1.2} />
        </mesh>
      ))}
    </group>
  );
}

function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rnd = seeded(5);
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (rnd() - 0.5) * 60;
      p[i * 3 + 1] = rnd() * 26 + 1;
      p[i * 3 + 2] = 14 - rnd() * 190;
    }
    return p;
  }, [count]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.008;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.16} transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}

/* ---------- glossy card ---------- */

const CARD_W = 3.4;
const CARD_H = 2.12;
const CARD_R = 0.22;

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Rounded face with 0..1 UVs so a texture fills it and the corners are cut. */
function roundedFace(w: number, h: number, r: number) {
  const g = new THREE.ShapeGeometry(roundedRect(w, h, r), 16);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
  }
  return g;
}

/**
 * Clear coat: a black, mirror-like layer added on top of the face. Black adds
 * nothing, so only the reflections of the studio lighting show, which reads
 * as a glossy lacquered surface without washing out the design underneath.
 */
const coat = {
  color: "#000000",
  metalness: 1,
  roughness: 0.12,
  envMapIntensity: 0.3,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
} as const;

/** Moving highlight streak. */
const streak = {
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  toneMapped: false,
} as const;

/**
 * The live-call card: rounded glossy body with a curved rim, clear-coated faces
 * that reflect the environment, and a light streak that sweeps across.
 * Attached to the camera, so it stays on screen and glides between per-section
 * resting places as the page scrolls (see `stops`).
 */
/**
 * Phones and tablets: the card rests in the hero's open space above the
 * headline, then steps aside so sections read without big gaps; a little of
 * the city shows between sections (`.scene-window` in globals.css).
 */
function mobileStops(vw: number, vh: number): Stop[] {
  const w = Math.min(vw * 0.68, 340);
  const tilt = 0.22;
  return Array.from({ length: SECTION_IDS.length }, (_, i) => ({
    x: i === 0 ? vw / 2 : vw + 300,
    y: i === 0 ? vh * 0.27 : vh * 0.33,
    w,
    yaw: i * Math.PI + (i % 2 ? tilt : -tilt),
  }));
}

/**
 * Where the card rests in each section, in CSS pixels on screen, plus its turn
 * (yaw). These are the positions seen when a section starts (its top near the
 * top of the screen). Between sections it glides and turns to the next one,
 * so the call side and the logo side take turns facing you. Each spot is a
 * free area of that section's layout: the heading row's empty side, or a
 * column the section leaves open on desktop (card lanes in globals.css).
 */
type Stop = { x: number; y: number; w: number; yaw: number };
function stops(vw: number, vh: number): Stop[] {
  if (vw < 1024) return mobileStops(vw, vh);
  const c = Math.min(vw, 1280) - 64; // container width
  const left = (vw - c) / 2;
  const right = left + c;
  const PI = Math.PI;
  const lane = (share: number) => Math.min(c * share, 500); // card width in a lane
  const side = (share: number) => Math.min(c * share, 400); // beside a heading
  const tilt = 0.22; // slight angle at rest so it reads as 3D
  return [
    // home: right column of the hero
    { x: vw / 2 + c * 0.27, y: vh * 0.5, w: Math.min(c * 0.4, 540), yaw: -tilt },
    // services: beside the heading, right
    { x: right - c * 0.2, y: vh * 0.34, w: side(0.3), yaw: PI + tilt },
    // about: left lane
    { x: left + c * 0.2, y: vh * 0.48, w: lane(0.34), yaw: 2 * PI - tilt },
    // ceo message: portrait on the left, letter on the right; the card steps aside
    { x: vw + 420, y: vh * 0.45, w: lane(0.3), yaw: 2.5 * PI },
    // why us: beside the heading, right
    { x: right - c * 0.2, y: vh * 0.32, w: side(0.3), yaw: 3 * PI + tilt },
    // how we work: beside the centred heading, right
    { x: right - c * 0.1, y: vh * 0.3, w: side(0.19), yaw: 4 * PI - tilt },
    // industries: right lane
    { x: right - c * 0.19, y: vh * 0.48, w: lane(0.32), yaw: 5 * PI + tilt },
    // careers: right lane
    { x: right - c * 0.19, y: vh * 0.48, w: lane(0.32), yaw: 6 * PI - tilt },
    // faq: right lane
    { x: right - c * 0.19, y: vh * 0.48, w: lane(0.32), yaw: 7 * PI + tilt },
    // contact: the form fills the width, so the card slides away to the right
    { x: vw + 420, y: vh * 0.4, w: lane(0.32), yaw: 8 * PI - tilt },
  ];
}

function GlossyCard({ state }: { state: React.RefObject<SceneState> }) {
  const holder = useRef<THREE.Group>(null);
  const card = useRef<THREE.Group>(null);
  const nodes = useRef<THREE.Group>(null);
  const backMat = useRef<THREE.MeshBasicMaterial>(null);
  const camera = useThree((s) => s.camera);

  const assets = useMemo(() => {
    const depth = 0.05;
    const bevel = 0.05;
    const body = new THREE.ExtrudeGeometry(roundedRect(CARD_W, CARD_H, CARD_R), {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 8,
      curveSegments: 24,
    });
    body.translate(0, 0, -depth / 2);
    const face = roundedFace(CARD_W, CARD_H, CARD_R);
    const faceZ = depth / 2 + bevel + 0.002;
    const rnd = seeded(3);
    return {
      body,
      face,
      faceZ,
      front: callCardTexture(),
      sheen: [sheenTexture(), sheenTexture()],
      nodeData: Array.from({ length: 12 }, (_, i) => ({
        a: rnd() * Math.PI * 2,
        r: 2.4 + rnd() * 1.3,
        y: (rnd() - 0.5) * 2.4,
        s: 0.25 + rnd() * 0.45,
        size: 0.05 + rnd() * 0.06,
        color: ["#2bd66b", "#ffffff", "#1a56c4"][i % 3],
      })),
    };
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = logoFull.src;
    img.onload = () => {
      const m = backMat.current;
      if (!m) return;
      m.map = logoCardTexture(img, "Call centre  ·  BPO  ·  Back office");
      m.needsUpdate = true;
    };
  }, []);

  useEffect(() => {
    document.fonts?.ready.then(() => {
      assets.front.image = callCardTexture().image;
      assets.front.needsUpdate = true;
    });
  }, [assets]);

  useEffect(() => {
    const h = holder.current;
    if (!h) return;
    camera.add(h);
    return () => {
      camera.remove(h);
    };
  }, [camera]);

  useFrame(({ clock, camera: cam }, dt) => {
    const h = holder.current;
    const c = card.current;
    if (!h || !c) return;
    const s = state.current;
    const t = clock.elapsedTime;
    // Blend between this section's resting place and the next one.
    const list = stops(s.vw, s.vh);
    const i = Math.min(list.length - 2, Math.floor(s.sec));
    const e = smooth(s.sec - i);
    const a = list[i];
    const b = list[i + 1];
    const mix = (k: keyof Stop) => a[k] + (b[k] - a[k]) * e;

    // CSS pixels to world units at the card's depth.
    const dist = 7;
    const fov = THREE.MathUtils.degToRad((cam as THREE.PerspectiveCamera).fov);
    const halfH = Math.tan(fov / 2) * dist;
    const halfW = halfH * (s.vw / s.vh);
    const tx = (mix("x") / s.vw - 0.5) * 2 * halfW;
    const ty = (0.5 - mix("y") / s.vh) * 2 * halfH;
    const ts = ((mix("w") / s.vw) * 2 * halfW) / CARD_W;

    // Glide rather than snap.
    h.position.set(damp(h.position.x, tx, 6, dt), damp(h.position.y, ty, 6, dt), -dist);
    h.scale.setScalar(damp(h.scale.x || ts, ts, 6, dt));
    // Off screen at the end of the page: stop drawing it.
    h.visible = mix("x") < s.vw + 300;
    c.rotation.y = damp(c.rotation.y, mix("yaw") + s.mx * 0.15, 6, dt);
    c.rotation.x = damp(c.rotation.x, 0.08 - s.my * 0.2 + Math.sin(t * 0.8) * 0.03, 5, dt);
    c.rotation.z = Math.sin(t * 0.6) * 0.02;
    c.position.y = Math.sin(t * 1.1) * 0.07;

    // The light streak follows the card's angle, plus a slow sweep every few seconds.
    const sweep = ((t * 0.18) % 1.6) - 0.8;
    const off = sweep + (c.rotation.y + 0.3) * 0.35 + s.mx * 0.15;
    assets.sheen[0].offset.set(-off, off * 0.6);
    assets.sheen[1].offset.set(off, off * 0.6);

    nodes.current?.children.forEach((n, i) => {
      const d = assets.nodeData[i];
      const a = d.a + t * d.s;
      // Always behind the card so the dots never cover its text.
      n.position.set(
        Math.cos(a) * d.r,
        d.y + Math.sin(t + i) * 0.1,
        -0.35 - Math.abs(Math.sin(a)) * d.r * 0.3,
      );
    });
  });

  return (
    <group ref={holder}>
      <group ref={card}>
        {/* body with the curved, polished rim */}
        <mesh geometry={assets.body}>
          <meshPhysicalMaterial
            color="#0d3f91"
            metalness={0.75}
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.03}
            envMapIntensity={1.4}
          />
        </mesh>
        {/* front face: true colours, then a clear reflective coat, then a light streak */}
        <mesh geometry={assets.face} position-z={assets.faceZ}>
          <meshBasicMaterial map={assets.front} toneMapped={false} />
        </mesh>
        <mesh geometry={assets.face} position-z={assets.faceZ + 0.001}>
          <meshStandardMaterial {...coat} />
        </mesh>
        <mesh geometry={assets.face} position-z={assets.faceZ + 0.002}>
          <meshBasicMaterial map={assets.sheen[0]} {...streak} />
        </mesh>
        {/* back face (logo) */}
        <group rotation-y={Math.PI}>
          <mesh geometry={assets.face} position-z={assets.faceZ}>
            <meshBasicMaterial ref={backMat} color="#ffffff" toneMapped={false} />
          </mesh>
          <mesh geometry={assets.face} position-z={assets.faceZ + 0.001}>
            <meshStandardMaterial {...coat} />
          </mesh>
          <mesh geometry={assets.face} position-z={assets.faceZ + 0.002}>
            <meshBasicMaterial map={assets.sheen[1]} {...streak} />
          </mesh>
        </group>
      </group>
      <group ref={nodes}>
        {assets.nodeData.map((d, i) => (
          <mesh key={i}>
            <sphereGeometry args={[d.size, 20, 14]} />
            <meshPhysicalMaterial
              color={d.color}
              emissive={d.color}
              emissiveIntensity={0.5}
              roughness={0.15}
              clearcoat={1}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ---------- camera, lights and the day/night shift ---------- */

function Director({ state }: { state: React.RefObject<SceneState> }) {
  const u = useRef(0);
  const night = useRef(0);

  useFrame(({ camera, scene }, dt) => {
    const s = state.current;
    u.current = damp(u.current, clamp01(s.page), 3, dt);
    night.current = damp(night.current, s.night, 3, dt);
    const n = night.current;

    const pos = PATH.getPointAt(u.current, scratch.pos);
    const look = PATH.getPointAt(Math.min(1, u.current + 0.04), scratch.look);
    camera.position.set(pos.x + s.mx * 1.1, pos.y + s.my * 0.45, pos.z);
    camera.lookAt(look.x + s.mx * 0.6, look.y + 0.6, look.z);

    SKY.copy(DAY).lerp(NIGHT, n);
    (scene.fog as THREE.Fog | null)?.color.copy(SKY);
    registry.ground?.color.copy(GROUND_DAY).lerp(GROUND_NIGHT, n);
    for (const m of registry.buildings) {
      m.emissiveIntensity = 0.15 + n * 1.1;
      m.color.copy(BUILDING).multiplyScalar(1 - n * 0.55);
    }
    if (registry.hemi) registry.hemi.intensity = 1.1 - n * 0.7;
    if (registry.sun) registry.sun.intensity = 1.8 - n * 1.5;
    if (registry.grid) (registry.grid as THREE.MeshBasicMaterial).opacity = 0.12 + n * 0.18;
  });
  return null;
}

function Ready({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    if (++frames.current > 2) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

/** Tone mapping and soft studio reflections for the glossy card and buildings. */
function setupRenderer(gl: THREE.WebGLRenderer, scene: THREE.Scene) {
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.05;
  const pmrem = new THREE.PMREMGenerator(gl);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  pmrem.dispose();
}

export default function SiteScene({ quality, state, onReady }: Props) {
  const high = quality === "high";
  return (
    <Canvas
      aria-hidden="true"
      dpr={high ? [1, 1.5] : 1}
      gl={{ antialias: high, powerPreference: "high-performance", alpha: false }}
      camera={{ fov: 50, near: 0.1, far: 280, position: [0, 3.2, 14] }}
      onCreated={({ gl, scene, camera }) => {
        setupRenderer(gl, scene);
        scene.background = SKY;
        scene.fog = new THREE.Fog(SKY, 30, 125);
        // The card is attached to the camera, so the camera must be in the scene.
        scene.add(camera);
      }}
    >
      <hemisphereLight
        ref={(l) => {
          if (l) registry.hemi = l;
        }}
        args={["#ffffff", "#8fb8d8", 1.1]}
      />
      <directionalLight
        ref={(l) => {
          if (l) registry.sun = l;
        }}
        position={[-30, 50, 30]}
        intensity={1.8}
        color="#fff4e0"
      />
      <Director state={state} />
      <Ground />
      <Skyline quality={quality} />
      <Gates state={state} />
      <Particles count={high ? 500 : 220} />
      <GlossyCard state={state} />
      <Ready onReady={onReady} />
    </Canvas>
  );
}
