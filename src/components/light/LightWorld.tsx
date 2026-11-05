"use client";
/* eslint-disable react-hooks/immutability -- three.js textures are configured in place after loading */

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { applyTheme, dashTex, iconTex, type Dash, type Icon } from "@/components/network/NetworkScene";

/* Light, photoreal take on the finance network: a real daylight sky with
   clouds, the Earth in daylight, frosted-glass dashboards, glossy icon discs
   and glossy brand-coloured ribbons over a soft white floor. Uses the same
   camera route as the network scene (networkCamera). */

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const LIGHT_FOG = new THREE.Color("#bcd2ec");
const BRAND_BLUE = new THREE.Color("#1a4fd0");
const BRAND_GREEN = new THREE.Color("#13a36e");
const FLOOR_Y = -14;

function seeded(seed = 7) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
}

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Soft cumulus puff: many overlapping blobs, lit from above. */
function cloudTex(seed: number) {
  return canvasTex(512, 256, (g) => {
    const r = seeded(seed);
    for (let i = 0; i < 70; i++) {
      const x = 80 + r() * 352;
      const y = 90 + r() * 90 - Math.sin(((x - 80) / 352) * Math.PI) * 50;
      const rad = 30 + r() * 60;
      const grad = g.createRadialGradient(x, y - rad * 0.3, 0, x, y, rad);
      const shade = 236 + Math.round(r() * 19);
      grad.addColorStop(0, `rgba(255,255,255,0.55)`);
      grad.addColorStop(0.6, `rgba(${shade},${shade + 2 > 255 ? 255 : shade + 2},255,0.25)`);
      grad.addColorStop(1, "rgba(220,230,245,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 512, 256);
    }
  });
}

function blobTex() {
  return canvasTex(128, 128, (g) => {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(30,50,80,0.28)");
    r.addColorStop(1, "rgba(30,50,80,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
  });
}

/* ---------- sky that travels with the camera ---------- */

/** Daylight sky as a cheap gradient (same look as the physical sky model,
    a fraction of the per-pixel cost). Follows the camera. */
function DaySky() {
  const camera = useThree((s) => s.camera);
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(() => mesh.current?.position.copy(camera.position));
  return (
    <mesh ref={mesh} renderOrder={-1}>
      <sphereGeometry args={[200, 24, 12]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        toneMapped={false}
        vertexShader={`varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`varying vec3 vP; void main(){
          float h = clamp(vP.y, 0.0, 1.0);
          vec3 c = mix(vec3(0.83,0.88,0.94), vec3(0.62,0.74,0.89), smoothstep(0.0, 0.18, h));
          c = mix(c, vec3(0.36,0.55,0.83), smoothstep(0.18, 0.75, h));
          // soft sun glow, high on the left
          float sun = pow(max(dot(vP, normalize(vec3(-0.45, 0.55, -0.7))), 0.0), 24.0);
          c += vec3(1.0, 0.96, 0.86) * sun * 0.35;
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`}
      />
    </mesh>
  );
}

/* ---------- clouds ---------- */

function Clouds({ count }: { count: number }) {
  const items = useMemo(() => {
    const r = seeded(9);
    const texs = [cloudTex(3), cloudTex(17), cloudTex(29), cloudTex(41)];
    return Array.from({ length: count }, (_, i) => {
      // Mostly to the sides and below the route, a few overhead.
      const side = r() < 0.5 ? -1 : 1;
      const below = r() < 0.55;
      const s = 14 + r() * 26;
      // Keep the whole puff clear of the camera route (x within about 8, y -3 to 3).
      const x = side * (s * 0.5 + 9 + r() * 34);
      const y = below ? Math.min(FLOOR_Y + 3 + r() * 6, -6 - s * 0.25) : Math.max(6 + r() * 14, 5 + s * 0.25);
      const z = 20 - r() * 290;
      return { tex: texs[i % texs.length], p: [x, y, z] as [number, number, number], s, ph: r() * 6, op: 0.75 + r() * 0.25 };
    });
  }, [count]);
  const group = useRef<THREE.Group>(null);
  const camera = useThree((st) => st.camera);
  useFrame(({ clock }) => {
    group.current?.children.forEach((c, i) => {
      c.position.x = items[i].p[0] + Math.sin(clock.elapsedTime * 0.05 + items[i].ph) * 1.5;
      // Thin out smoothly as the camera nears, so a cloud never pops on or off screen.
      const d = c.position.distanceTo(camera.position) - items[i].s * 0.35;
      const k = Math.min(1, Math.max(0, (d - 6) / 22));
      ((c as THREE.Sprite).material as THREE.SpriteMaterial).opacity = items[i].op * k * k * (3 - 2 * k);
    });
  });
  return (
    <group ref={group}>
      {items.map((c, i) => (
        <sprite key={i} position={c.p} scale={[c.s, c.s * 0.5, 1]}>
          <spriteMaterial map={c.tex} transparent opacity={c.op} depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}

/* ---------- floor with soft contact shadows ---------- */

function Floor({ shadows }: { shadows: [number, number, number][] }) {
  const blob = useMemo(() => blobTex(), []);
  return (
    <group position-y={FLOOR_Y}>
      <mesh rotation-x={-Math.PI / 2} position-z={-120}>
        <planeGeometry args={[900, 900]} />
        <meshLambertMaterial color="#a9bfdc" />
      </mesh>
      <gridHelper args={[900, 180, "#7d9cc6", "#93afd3"]} position={[0, 0.01, -120]} />
      {shadows.map(([x, z, s], i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[x, 0.02, z]}>
          <planeGeometry args={[s, s * 0.7]} />
          <meshBasicMaterial map={blob} transparent depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- Earth in daylight ---------- */

function Earth() {
  const [day, clouds] = useLoader(THREE.TextureLoader, [`${base}/globe/earth.webp`, `${base}/globe/clouds.webp`]);
  useMemo(() => {
    day.colorSpace = THREE.SRGBColorSpace;
    day.anisotropy = 8;
  }, [day]);
  const spin = useRef<THREE.Group>(null);
  const cl = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.05;
    if (cl.current) cl.current.rotation.y += dt * 0.012;
  });
  const R = 11;
  return (
    <group position={[-17, 1, -66]} rotation={[0.35, 0, 0.1]}>
      <group ref={spin} rotation-y={-1.6}>
        <mesh>
          <sphereGeometry args={[R, 96, 64]} />
          <meshStandardMaterial map={day} roughness={0.8} />
        </mesh>
        <mesh ref={cl}>
          <sphereGeometry args={[R * 1.012, 64, 48]} />
          <meshStandardMaterial map={clouds} transparent opacity={0.75} depthWrite={false} />
        </mesh>
      </group>
      <mesh scale={1.05}>
        <sphereGeometry args={[R, 64, 48]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          vertexShader={`varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
          fragmentShader={`varying vec3 vN; void main(){ float i = pow(0.72 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(0.45,0.7,1.0,1.0) * i * 1.2; }`}
        />
      </mesh>
    </group>
  );
}

/* ---------- frosted glass dashboards ---------- */

function roundedShape(w: number, h: number, r: number) {
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

const DASH_SPECS: [Dash, string, string][] = [
  ["line", "Portfolio value", "$1,354,237"],
  ["kpi", "Contact centre today", "Live"],
  ["bars", "Monthly collections", "+12.4%"],
  ["donut", "Work mix", "4 processes"],
  ["table", "Invoices", "Accounts receivable"],
  ["line", "Revenue growth", "+18.2% YoY"],
  ["bars", "Calls answered", "18,420"],
  ["kpi", "Quality score", "96%"],
];
/** Glass panels spread along the whole route, alternating sides, so there is
    always something in view (the globe owns z -45 to -80). */
const DASHES: [Dash, string, string, [number, number, number], number][] = (() => {
  const r = seeded(13);
  const out: [Dash, string, string, [number, number, number], number][] = [];
  let i = 0;
  for (let z = -6; z > -280; z -= 11) {
    if (z < -42 && z > -84) continue;
    const side = i % 2 ? 1 : -1;
    const [k, t, v] = DASH_SPECS[i % DASH_SPECS.length];
    out.push([k, t, v, [side * (7.5 + r() * 4), -4 + r() * 8, z - r() * 4], -side * (0.3 + r() * 0.15)]);
    i++;
  }
  return out;
})();

function GlassDashboards({ low }: { low: boolean }) {
  const { slab, glass, items } = useMemo(() => {
    applyTheme(true);
    const r = seeded(29);
    const slab = new THREE.ExtrudeGeometry(roundedShape(6.6, 4.2, 0.35), {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 4,
      curveSegments: 12,
    });
    slab.translate(0, 0, -0.11);
    // Frosted look without real refraction: transmission re-renders the whole
    // scene every frame, which made scrolling lag. Env reflections keep the sheen.
    void low;
    const glass = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.12,
      metalness: 0.05,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });
    const items = DASHES.map(([k, t, v, p, ry]) => ({ tex: dashTex(k, t, v, r), p, ry, ph: r() * 6 }));
    return { slab, glass, items };
  }, [low]);
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      g.position.y = items[i].p[1] + Math.sin(t * 0.5 + items[i].ph) * 0.25;
      g.rotation.y = items[i].ry + Math.sin(t * 0.3 + items[i].ph) * 0.04;
    });
  });
  return (
    <>
      {items.map((it, i) => (
        <group
          key={i}
          ref={(g) => {
            refs.current[i] = g;
          }}
          position={it.p}
          rotation={[0, it.ry, 0]}
        >
          {/* the chart is printed on the front of the glass slab */}
          <mesh position-z={0.21}>
            <planeGeometry args={[6.2, 3.88]} />
            <meshBasicMaterial map={it.tex} toneMapped={false} transparent />
          </mesh>
          <mesh geometry={slab} material={glass} />
        </group>
      ))}
    </>
  );
}

/* ---------- glossy icon discs ---------- */

function IconDiscs() {
  const { nodes, links } = useMemo(() => {
    applyTheme(true);
    const r = seeded(41);
    const icons: Icon[] = ["headset", "phone", "chat", "user", "mail", "chart", "globe", "user", "headset", "chat"];
    const nodes = icons.map((icon, i) => ({
      tex: iconTex(icon),
      p: new THREE.Vector3((i % 2 ? 1 : -1) * (7 + r() * 7), (r() - 0.5) * 10, -150 - i * 2.6 - r() * 2),
    }));
    const links: THREE.TubeGeometry[] = [];
    nodes.forEach((a, i) =>
      nodes.forEach((b, j) => {
        if (j > i && a.p.distanceTo(b.p) < 9)
          links.push(new THREE.TubeGeometry(new THREE.LineCurve3(a.p, b.p), 1, 0.035, 6, false));
      }),
    );
    return { nodes, links };
  }, []);
  const camera = useThree((s) => s.camera);
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(() => refs.current.forEach((g) => g?.lookAt(camera.position)));
  return (
    <>
      {links.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#9fb6d6" roughness={0.4} />
        </mesh>
      ))}
      {nodes.map((n, i) => (
        <group
          key={i}
          position={n.p}
          ref={(g) => {
            refs.current[i] = g;
          }}
        >
          <mesh rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.85, 0.85, 0.28, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
          <mesh position-z={0.15}>
            <circleGeometry args={[0.78, 48]} />
            <meshBasicMaterial map={n.tex} transparent toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* ---------- glossy ribbons ---------- */

function Ribbons({ count, z, y, spread }: { count: number; z: number; y: number; spread: number }) {
  const tubes = useMemo(() => {
    const r = seeded(Math.abs(z) + 3);
    return Array.from({ length: count }, (_, i) => {
      const pts: THREE.Vector3[] = [];
      const yo = (r() - 0.5) * spread;
      const zo = (r() - 0.5) * 18;
      const ph = r() * 6;
      for (let k = 0; k <= 8; k++) {
        const u = k / 8;
        const e = Math.abs(u - 0.5) * 2;
        pts.push(
          new THREE.Vector3(-46 + 92 * u, y + yo * (0.35 + 0.65 * e) + Math.sin(u * 6 + ph) * 0.9, z + zo * (0.3 + 0.7 * e)),
        );
      }
      return {
        geo: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 110, 0.045 + r() * 0.05, 6, false),
        color: i % 3 === 0 ? BRAND_GREEN : i % 3 === 1 ? BRAND_BLUE : new THREE.Color("#5aa9e6"),
        ph,
      };
    });
  }, [count, z, y, spread]);
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    group.current?.children.forEach((m, i) => {
      m.position.y = Math.sin(t * 0.4 + tubes[i].ph) * 0.35;
      m.rotation.x = Math.sin(t * 0.25 + tubes[i].ph) * 0.02;
    });
  });
  return (
    <group ref={group}>
      {tubes.map((t, i) => (
        <mesh key={i} geometry={t.geo}>
          <meshStandardMaterial color={t.color} roughness={0.22} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

export function LightWorld({ low }: { low: boolean }) {
  useEffect(() => () => applyTheme(false), []);
  const shadows: [number, number, number][] = [
    [-17, -66, 30],
    ...DASHES.map(([, , , p]) => [p[0], p[2], 9] as [number, number, number]),
    [0, -162, 30],
    [0, -210, 70],
  ];
  return (
    <>
      <DaySky />
      <Clouds count={low ? 18 : 34} />
      <Floor shadows={shadows} />
      <Earth />
      <GlassDashboards low={low} />
      <IconDiscs />
      <Ribbons count={low ? 6 : 10} z={-8} y={-3} spread={12} />
      <Ribbons count={low ? 4 : 7} z={-100} y={-6} spread={8} />
      <Ribbons count={low ? 4 : 7} z={-160} y={-6.5} spread={8} />
      <Ribbons count={low ? 6 : 11} z={-212} y={-5.5} spread={7} />
      <Ribbons count={low ? 5 : 9} z={-285} y={0.5} spread={14} />
    </>
  );
}
