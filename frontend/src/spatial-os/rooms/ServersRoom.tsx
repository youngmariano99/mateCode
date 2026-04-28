import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getRoom } from "../manifest";
import { RoomShell } from "../primitives/RoomShell";

const room = getRoom("server")!;

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
        <boxGeometry args={[0.7, 2.2, 0.55]} />
        <meshStandardMaterial color="#0e1116" roughness={0.4} metalness={0.6} />
      </mesh>
      <group ref={ledsRef}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[0, 0.3 + i * 0.22, 0.29]}>
            <boxGeometry args={[0.45, 0.04, 0.02]} />
            <meshStandardMaterial color={room.accent} emissive={room.accent} emissiveIntensity={1.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function ServersRoom() {
  const rackZs = [-5.5, -3.7, -1.9, 1.9, 3.7, 5.5];
  return (
    <RoomShell room={room}>
      {rackZs.map((z, i) => (
        <Rack key={`w-${i}`} position={[-1.1, 0, z]} seed={i} />
      ))}
      {rackZs.map((z, i) => (
        <Rack key={`e-${i}`} position={[1.1, 0, z]} seed={i + 10} />
      ))}

      {/* Monitoring console */}
      <mesh position={[0, 0.5, 6.4]} castShadow>
        <boxGeometry args={[1.6, 1, 0.5]} />
        <meshStandardMaterial color="#1a1f29" roughness={0.5} />
      </mesh>
      {[-0.5, 0, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 1.2, 6.15]}>
          <boxGeometry args={[0.45, 0.3, 0.04]} />
          <meshStandardMaterial color="#000" emissive={room.accent} emissiveIntensity={0.7} />
        </mesh>
      ))}

      <pointLight position={[0, 2.5, 0]} color={room.accent} intensity={1} distance={10} />
    </RoomShell>
  );
}
