/**
 * Presence.tsx
 * ---------------------------------------------------------------------------
 *  Renders real-time presence avatars in the 3D workspace.
 *  Translates 2D zone IDs to 3D room coordinates.
 * ---------------------------------------------------------------------------
 */
import { usePresence } from "../hooks/usePresence";
import { getRoom } from "./manifest";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const ZONE_MAPPING: Record<string, string> = {
  phase00: "dna-lab",
  phase01: "strategy",
  phase02: "architecture",
  phase03: "devhub",
  server: "servers",
  reunion: "reception", // Fallback for meeting room
};

function Avatar3D({ 
  position, 
  name, 
  color 
}: { 
  position: [number, number, number], 
  name: string, 
  initial: string, 
  color: string 
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.lerp(targetPos, 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Character body (Stylized capsule) */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.4, 4, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Floating Name & Initial */}
      <Html position={[0, 1.2, 0]} center distanceFactor={10}>
        <div className="flex flex-col items-center pointer-events-none select-none">
          <div 
            className="px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-white font-black text-[8px] uppercase tracking-widest whitespace-nowrap shadow-xl"
            style={{ borderBottom: `2px solid ${color}` }}
          >
            {name}
          </div>
          <div className="w-0.5 h-2 bg-white/20 mt-0.5" />
        </div>
      </Html>

      {/* Ground shadow circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[0.3, 32]} />
        <meshBasicMaterial color="#000" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}

export function Presence() {
  const { presences } = usePresence();

  const users = useMemo(() => {
    return Object.values(presences).map((user: any, idx: number) => {
      const roomID = ZONE_MAPPING[user.zonaActual] || user.zonaActual;
      const room = getRoom(roomID);
      
      if (!room) return null;

      // Calculate a small spread offset so they don't overlap perfectly
      const angle = (idx / 8) * Math.PI * 2;
      const radius = 1.2;
      const offsetX = Math.cos(angle) * radius;
      const offsetZ = Math.sin(angle) * radius;

      return {
        id: user.userId,
        name: user.nombre,
        initial: user.nombre.charAt(0),
        position: [room.position[0] + offsetX, 0, room.position[2] + offsetZ] as [number, number, number],
        color: room.accent
      };
    }).filter(Boolean);
  }, [presences]);

  return (
    <group>
      {users.map((u: any) => (
        <Avatar3D 
          key={u.id}
          position={u.position}
          name={u.name}
          initial={u.initial}
          color={u.color}
        />
      ))}
    </group>
  );
}
