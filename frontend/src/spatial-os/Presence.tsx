/**
 * Presence.tsx
 * ---------------------------------------------------------------------------
 *  Renders real-time presence avatars in the 3D workspace.
 *  Uses the high-fidelity Avatar pawn component.
 * ---------------------------------------------------------------------------
 */
import { usePresence } from "../hooks/usePresence";
import { getRoom } from "./manifest";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Avatar } from "./components/Avatar";

const ZONE_MAPPING: Record<string, string> = {
  phase00: "dna-lab",
  phase01: "strategy",
  phase02: "architecture",
  phase03: "devhub",
  server: "servers",
  reunion: "reception",
  lobby: "lobby",
  spawn: "lobby",
  desconocido: "lobby",
};

function LerpedAvatar({ 
  position, 
  name, 
  color 
}: { 
  position: [number, number, number], 
  name: string, 
  color: string 
}) {
  // Local state for the smooth animated position
  const [lerpedPos, setLerpedPos] = useState<[number, number, number]>(position);
  const targetPos = useMemo(() => new THREE.Vector3(...position), [position]);
  const currentPos = useRef(new THREE.Vector3(...position));

  useFrame(() => {
    // Interpolate toward the backend target position
    currentPos.current.lerp(targetPos, 0.1);
    setLerpedPos([currentPos.current.x, currentPos.current.y, currentPos.current.z]);
  });

  return (
    <Avatar 
      position={lerpedPos}
      name={name}
      color={color}
    />
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
      const radius = 1.5;
      const offsetX = Math.cos(angle) * radius;
      const offsetZ = Math.sin(angle) * radius;

      return {
        id: user.userId,
        name: user.nombre,
        position: [room.position[0] + offsetX, 0, room.position[2] + offsetZ] as [number, number, number],
        color: room.accent
      };
    }).filter(Boolean);
  }, [presences]);

  return (
    <group>
      {users.map((u: any) => (
        <LerpedAvatar 
          key={u.id}
          position={u.position}
          name={u.name}
          color={u.color}
        />
      ))}
    </group>
  );
}
