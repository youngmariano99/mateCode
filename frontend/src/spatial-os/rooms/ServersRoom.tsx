/**
 * ServersRoom.tsx — PRODUCTION · Cuarto de Servidores (Infraestructura)
 * ---------------------------------------------------------------------------
 *  Tech grid floor (handled by manifest floor: 'grid'), tall dark racks with
 *  blinking LEDs, central monitoring console with multiple screens.
 *  Accent: electric blue.
 * ---------------------------------------------------------------------------
 */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getRoom } from "../manifest";
import { RoomShell } from "../primitives/RoomShell";

const room = getRoom("servers")!;

function Rack({ position, seed }: { position: [number, number, number]; seed: number }) {
  const ledsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ledsRef.current) return;
    const t = clock.getElapsedTime();
    ledsRef.current.children.forEach((c, i) => {
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.4 + Math.abs(Math.sin(t * 2 + i * 0.7 + seed)) * 1.6;
    });
  });

  return (
    <group position={position}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.8, 2.2, 0.6]} />
        <meshStandardMaterial color="#0e1116" roughness={0.4} metalness={0.6} />
      </mesh>
      <group ref={ledsRef}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[0, 0.3 + i * 0.22, 0.31]}>
            <boxGeometry args={[0.5, 0.04, 0.02]} />
            <meshStandardMaterial color={room.accent} emissive={room.accent} emissiveIntensity={1.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function ServersRoom() {
  return (
    <RoomShell room={room}>
      {/* Two parallel rows of racks */}
      {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((x, i) => (
        <Rack key={`r1-${i}`} position={[x, 0, -1.3]} seed={i} />
      ))}
      {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((x, i) => (
        <Rack key={`r2-${i}`} position={[x, 0, 1.3]} seed={i + 10} />
      ))}

      {/* Central monitoring console (against east wall) */}
      <mesh position={[3.4, 0.5, 0]} castShadow>
        <boxGeometry args={[0.5, 1, 1.6]} />
        <meshStandardMaterial color="#1a1f29" roughness={0.5} />
      </mesh>
      {[-0.5, 0, 0.5].map((z, i) => (
        <mesh key={i} position={[3.15, 1.2, z]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[0.45, 0.3, 0.04]} />
          <meshStandardMaterial color="#000" emissive={room.accent} emissiveIntensity={0.7} />
        </mesh>
      ))}

      <pointLight position={[0, 2.5, 0]} color={room.accent} intensity={1} distance={8} />
    </RoomShell>
  );
}
