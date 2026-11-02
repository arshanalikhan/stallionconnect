"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import logoFull from "@/assets/brand/logo-full.webp";
import { site } from "@/config/site";
import { callCardTexture, logoCardTexture, windowTexture } from "./textures";

export type Quality = "high" | "low";

type Props = {
  quality: Quality;
  /** 0 at the top of the hero, 1 when it has scrolled out of view. */
  progress: React.RefObject<number>;
  active: boolean;
  onReady: () => void;
};

const BG = new THREE.Color("#e3eefa");
const damp = THREE.MathUtils.damp;

/** Seeded random so the skyline looks the same on every visit. */
function seeded(seed = 11) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
}

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
    const fill = quality === "high" ? 0.55 : 0.32;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 16; j++) {
          if (rnd() > fill) continue;
          const k = rnd() < 0.45 ? 0 : rnd() < 0.55 ? 1 : rnd() < 0.7 ? 2 : 3;
          spots[k].push([side * (16 + i * 6.4 + (rnd() - 0.5) * 2), -26 - j * 6.5]);
        }
      }
    }
    return kinds.map((k, idx) => {
      const map = tex.clone();
      map.needsUpdate = true;
      map.repeat.set(k.w / 2.4, k.h / 3.2);
      const mat = new THREE.MeshStandardMaterial({
        color: "#b7d1ec",
        map,
        emissive: "#ffffff",
        emissiveMap: map,
        emissiveIntensity: 0.25,
        metalness: 0.3,
        roughness: 0.35,
      });
      return { geo: new THREE.BoxGeometry(k.w, k.h, k.w), mat, spots: spots[idx], h: k.h };
    });
  }, [quality]);

  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);
  useEffect(() => {
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
      {/* landmark tower at the end of the avenue */}
      <group position={[0, 0, -120]}>
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
      <mesh rotation-x={-Math.PI / 2} position-y={0}>
        <planeGeometry args={[400, 400]} />
        <meshBasicMaterial color="#e6eff9" />
      </mesh>
      <gridHelper args={[400, 100, "#139528", "#139528"]} position-y={0.02}>
        <meshBasicMaterial attach="material" color="#139528" transparent opacity={0.12} />
      </gridHelper>
    </group>
  );
}

/** Four rings down the avenue: Discover, Design, Deploy, Optimise. */
function Gates() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const zs = [-14, -34, -54, -74];
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.1 + Math.sin(clock.elapsedTime * 2 - i) * 0.5;
    });
  });
  return (
    <group>
      {zs.map((z, i) => (
        <mesh
          key={z}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[0, 6.4, z]}
        >
          <torusGeometry args={[6, 0.14, 16, 80]} />
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
      p[i * 3 + 1] = rnd() * 24 + 1;
      p[i * 3 + 2] = 10 - rnd() * 110;
    }
    return p;
  }, [count]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.01;
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

/**
 * The live-call card. It is attached to the camera so it stays on the right of
 * the hero, floats, follows the mouse and flips to the logo as you scroll.
 */
function CallCard({ progress }: { progress: React.RefObject<number> }) {
  const holder = useRef<THREE.Group>(null);
  const card = useRef<THREE.Group>(null);
  const nodes = useRef<THREE.Group>(null);
  const backMat = useRef<THREE.MeshBasicMaterial>(null);
  const camera = useThree((s) => s.camera);

  const { body, front, nodeData } = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(roundedRect(3.4, 2.12, 0.2), {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 3,
      curveSegments: 16,
    });
    geo.translate(0, 0, -0.03);
    const rnd = seeded(3);
    return {
      body: geo,
      front: callCardTexture(),
      nodeData: Array.from({ length: 12 }, (_, i) => ({
        a: rnd() * Math.PI * 2,
        r: 2.3 + rnd() * 1.4,
        y: (rnd() - 0.5) * 2.4,
        s: 0.25 + rnd() * 0.45,
        size: 0.05 + rnd() * 0.06,
        color: ["#2bd66b", "#ffffff", "#1a56c4"][i % 3],
      })),
    };
  }, []);

  // Logo for the back face, loaded once the image is ready.
  useEffect(() => {
    const img = new Image();
    img.src = logoFull.src;
    img.onload = () => {
      if (!backMat.current) return;
      backMat.current.map = logoCardTexture(img, site.tagline);
      backMat.current.needsUpdate = true;
    };
  }, []);

  // Redraw the front once the web font has loaded, so the text uses Syne.
  useEffect(() => {
    document.fonts?.ready.then(() => {
      front.image = callCardTexture().image;
      front.needsUpdate = true;
    });
  }, [front]);

  useEffect(() => {
    const h = holder.current;
    if (!h) return;
    camera.add(h);
    return () => {
      camera.remove(h);
    };
  }, [camera]);

  useFrame(({ clock, size, pointer }, dt) => {
    const h = holder.current;
    const c = card.current;
    if (!h || !c) return;
    const p = progress.current ?? 0;
    const t = clock.elapsedTime;

    // Place the card on the right half of the view, whatever the screen size.
    const cam = camera as THREE.PerspectiveCamera;
    const dist = 7;
    const halfH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * dist;
    const halfW = halfH * (size.width / size.height);
    // The canvas scrolls away with the hero; moving the card down by the same
    // amount keeps it on screen while it flips.
    h.position.set(halfW * 0.48, -halfH * 0.02 - p * halfH * 1.3, -dist);
    const scale = Math.min(1.15, (halfW * 0.68) / 3.4);
    h.scale.setScalar(scale);

    const flip = Math.min(1, p * 2.2) * Math.PI;
    c.rotation.y = damp(c.rotation.y, -0.32 + pointer.x * 0.25 + flip, 4, dt);
    c.rotation.x = damp(c.rotation.x, 0.06 - pointer.y * 0.18 + Math.sin(t * 0.8) * 0.03, 4, dt);
    c.position.y = Math.sin(t * 1.1) * 0.08;

    nodes.current?.children.forEach((n, i) => {
      const d = nodeData[i];
      const a = d.a + t * d.s;
      n.position.set(Math.cos(a) * d.r, d.y + Math.sin(t + i) * 0.1, Math.sin(a) * d.r * 0.35);
    });
  });

  return (
    <group ref={holder}>
      <group ref={card}>
        <mesh geometry={body}>
          <meshPhysicalMaterial color="#0a3b8a" metalness={0.5} roughness={0.3} clearcoat={1} />
        </mesh>
        <mesh position-z={0.05}>
          <planeGeometry args={[3.4, 2.12]} />
          <meshBasicMaterial map={front} toneMapped={false} />
        </mesh>
        <mesh position-z={-0.05} rotation-y={Math.PI}>
          <planeGeometry args={[3.4, 2.12]} />
          <meshBasicMaterial ref={backMat} color="#ffffff" toneMapped={false} />
        </mesh>
      </group>
      <group ref={nodes}>
        {nodeData.map((d, i) => (
          <mesh key={i}>
            <sphereGeometry args={[d.size, 16, 12]} />
            <meshStandardMaterial color={d.color} emissive={d.color} emissiveIntensity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Camera glides down the avenue as the hero scrolls, with gentle mouse parallax. */
function CameraRig({ progress }: { progress: React.RefObject<number> }) {
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, pointer }, dt) => {
    const p = progress.current ?? 0;
    camera.position.x = damp(camera.position.x, pointer.x * 1.2, 2.5, dt);
    camera.position.y = damp(camera.position.y, 3.2 + p * 3 + pointer.y * 0.5, 2.5, dt);
    camera.position.z = damp(camera.position.z, 14 - p * 22, 2.5, dt);
    look.set(camera.position.x * 0.3, 4 + p * 1.5, camera.position.z - 20);
    camera.lookAt(look);
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

export default function HeroScene({ quality, progress, active, onReady }: Props) {
  const high = quality === "high";
  return (
    <Canvas
      aria-hidden="true"
      frameloop={active ? "always" : "never"}
      dpr={high ? [1, 1.75] : 1}
      gl={{ antialias: high, powerPreference: "high-performance", alpha: false }}
      camera={{ fov: 50, near: 0.1, far: 260, position: [0, 3.2, 14] }}
      onCreated={({ gl, scene, camera }) => {
        // The 3D card is attached to the camera, so the camera must be in the scene.
        scene.add(camera);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.background = BG;
        scene.fog = new THREE.Fog(BG, 30, 125);
      }}
    >
      <hemisphereLight args={["#ffffff", "#8fb8d8", 1.1]} />
      <directionalLight position={[-30, 50, 30]} intensity={1.8} color="#fff4e0" />
      <CameraRig progress={progress} />
      <Ground />
      <Skyline quality={quality} />
      <Gates />
      <Particles count={high ? 700 : 260} />
      {high && <CallCard progress={progress} />}
      <Ready onReady={onReady} />
    </Canvas>
  );
}
