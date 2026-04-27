/**
 * Lighting.tsx — Studio-clean lighting rig.
 *  - Strong hemisphere fill so no surface goes pitch-black.
 *  - Bright ambient base to read materials clearly in 2.5D.
 *  - Soft directional "sun" with shadows for definition.
 *  - Warm central point light to lift the corridor and add coziness.
 *  Per-room accent glow is handled via emissive materials (LED strips).
 */
export function Lighting() {
  return (
    <>
      {/* Bright ambient base — kills pitch-black corners */}
      <ambientLight intensity={0.95} />

      {/* Sky/ground hemisphere fill — soft cool sky, warm bounce */}
      <hemisphereLight args={["#e6ecf5", "#3a3328", 0.85]} />

      {/* Main key "sun" — softer, with crisp shadows */}
      <directionalLight
        castShadow
        position={[18, 24, 14]}
        intensity={0.9}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-bias={-0.0005}
      />

      {/* Cool fill from the opposite side */}
      <directionalLight position={[-14, 16, -10]} intensity={0.45} color="#cfe1ff" />

      {/* Warm interior point light over the corridor — adds the "office warmth" */}
      <pointLight position={[0, 6, 0]} intensity={0.9} distance={45} decay={1.6} color="#ffd8a8" />

      {/* Subtle wing-fill point lights so each wing reads clearly */}
      <pointLight position={[-12, 5, 0]} intensity={0.35} distance={22} color="#ffe8cc" />
      <pointLight position={[12, 5, 0]} intensity={0.35} distance={22} color="#ffe8cc" />
    </>
  );
}
