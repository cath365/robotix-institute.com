'use client';

import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

interface RobotState {
  x: number;
  y: number;
  z: number;
  rotation: number;
  sensorReading: number;
  hasObject: boolean;
}

interface SimulationSceneProps {
  robotState: RobotState;
  commands: string[];
  onCommandComplete?: (commandIndex: number) => void;
}

// ─── Command Executor Hook ──────────────────────────────────
function useCommandExecutor(
  commands: string[],
  onStateChange: (state: Partial<RobotState>) => void
) {
  const [currentCommandIndex, setCurrentCommandIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const commandQueueRef = useRef<string[]>([]);
  const currentState = useRef({ x: 0, z: 0, rotation: 0 });

  // Direction vectors: 0=North(+Z), 1=East(+X), 2=South(-Z), 3=West(-X)
  const getDirectionVector = useCallback((rotation: number) => {
    const dir = Math.round(((rotation % 360) + 360) % 360 / 90) % 4;
    const dx = [0, 1, 0, -1];
    const dz = [-1, 0, 1, 0];
    return { dx: dx[dir], dz: dz[dir] };
  }, []);

  useEffect(() => {
    if (commands.length > 0 && commands !== commandQueueRef.current) {
      commandQueueRef.current = [...commands];
      currentState.current = { x: 0, z: 0, rotation: 0 };
      setCurrentCommandIndex(0);
      setIsExecuting(true);
    }
  }, [commands]);

  useEffect(() => {
    if (!isExecuting || currentCommandIndex < 0 || currentCommandIndex >= commandQueueRef.current.length) {
      setIsExecuting(false);
      return;
    }

    const cmd = commandQueueRef.current[currentCommandIndex];
    let delay = 500; // Default animation time

    // Process command
    if (cmd.startsWith('move_')) {
      const { dx, dz } = getDirectionVector(currentState.current.rotation);
      currentState.current.x += dx;
      currentState.current.z += dz;
      onStateChange({ x: currentState.current.x, z: currentState.current.z });
    } else if (cmd === 'turn_left') {
      currentState.current.rotation = (currentState.current.rotation - 90 + 360) % 360;
      onStateChange({ rotation: currentState.current.rotation });
      delay = 400;
    } else if (cmd === 'turn_right') {
      currentState.current.rotation = (currentState.current.rotation + 90) % 360;
      onStateChange({ rotation: currentState.current.rotation });
      delay = 400;
    } else if (cmd === 'scan') {
      onStateChange({ sensorReading: Math.floor(Math.random() * 80) + 10 });
      delay = 300;
    } else if (cmd === 'pickup') {
      onStateChange({ hasObject: true });
      delay = 600;
    } else if (cmd === 'place') {
      onStateChange({ hasObject: false });
      delay = 600;
    } else if (cmd.startsWith('wait_')) {
      delay = parseInt(cmd.split('_')[1]) || 1000;
    }

    const timer = setTimeout(() => {
      setCurrentCommandIndex(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentCommandIndex, isExecuting, getDirectionVector, onStateChange]);

  return { currentCommandIndex, isExecuting };
}

// ─── Robot Model ────────────────────────────────────────────
function RobotModel({ state, isMoving }: { state: RobotState; isMoving?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelRef1 = useRef<THREE.Mesh>(null);
  const wheelRef2 = useRef<THREE.Mesh>(null);
  const sensorLightRef = useRef<THREE.Mesh>(null);
  const targetPos = useRef(new THREE.Vector3(state.x, 0.3, state.z));
  const targetRot = useRef((-state.rotation * Math.PI) / 180);

  useEffect(() => {
    targetPos.current.set(state.x, 0.3, state.z);
    targetRot.current = (-state.rotation * Math.PI) / 180;
  }, [state.x, state.z, state.rotation]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Smooth movement
    const prevPos = groupRef.current.position.clone();
    groupRef.current.position.lerp(targetPos.current, 4 * delta);
    
    // Check if moving
    const isCurrentlyMoving = prevPos.distanceTo(groupRef.current.position) > 0.001;
    
    // Smooth rotation
    const currentY = groupRef.current.rotation.y;
    const diff = targetRot.current - currentY;
    // Handle wraparound
    const shortestDiff = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI;
    groupRef.current.rotation.y += shortestDiff * 4 * delta;
    
    // Wheel spin when moving
    const wheelSpeed = isCurrentlyMoving ? 8 : 0;
    if (wheelRef1.current) wheelRef1.current.rotation.x += delta * wheelSpeed;
    if (wheelRef2.current) wheelRef2.current.rotation.x += delta * wheelSpeed;
    
    // Sensor light pulse
    if (sensorLightRef.current) {
      const material = sensorLightRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.3, 0]}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.25, 0.8]} />
        <meshStandardMaterial color="#2B1EA3" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Top sensor dome */}
      <mesh position={[0, 0.2, -0.1]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#F4B400" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Eye / camera */}
      <mesh position={[0, 0.1, -0.42]}>
        <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
        <meshStandardMaterial color="#1A0E6B" emissive="#F4B400" emissiveIntensity={0.5} />
      </mesh>
      {/* Antenna */}
      <mesh position={[0.15, 0.35, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.25, 8]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <mesh position={[0.15, 0.48, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#F4B400" emissive="#F4B400" emissiveIntensity={1} />
      </mesh>
      {/* Wheels */}
      <mesh ref={wheelRef1} position={[-0.35, -0.1, 0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh ref={wheelRef2} position={[0.35, -0.1, 0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.35, -0.1, -0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.35, -0.1, -0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
}

// ─── Goal Marker ────────────────────────────────────────────
function GoalMarker() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      ref.current.rotation.y = state.clock.elapsedTime;
    }
  });

  return (
    <group position={[4, 0, -4]}>
      <mesh ref={ref}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#F4B400" emissive="#F4B400" emissiveIntensity={0.5} transparent opacity={0.8} />
      </mesh>
      {/* Glow ring */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshBasicMaterial color="#F4B400" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Obstacles ──────────────────────────────────────────────
function Obstacles() {
  const obstacles = useMemo(() => [
    { pos: [2, 0.3, -1] as [number, number, number], size: [0.5, 0.6, 0.5] as [number, number, number] },
    { pos: [1, 0.3, -3] as [number, number, number], size: [0.5, 0.6, 0.5] as [number, number, number] },
    { pos: [3, 0.3, -2] as [number, number, number], size: [0.8, 0.6, 0.3] as [number, number, number] },
    { pos: [-1, 0.3, -2] as [number, number, number], size: [0.5, 0.6, 0.5] as [number, number, number] },
  ], []);

  return (
    <>
      {obstacles.map((obs, i) => (
        <mesh key={i} position={obs.pos} castShadow>
          <boxGeometry args={obs.size} />
          <meshStandardMaterial color="#1A0E6B" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
    </>
  );
}

// ─── Floor Grid Lines ───────────────────────────────────────
function FloorGrid() {
  return (
    <>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0B0638" />
      </mesh>
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1A0E6B"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#2B1EA3"
        fadeDistance={30}
        infiniteGrid
        position={[0, 0, 0]}
      />
    </>
  );
}

// ─── Scene ──────────────────────────────────────────────────
function Scene({ robotState, commands, onStateUpdate }: { 
  robotState: RobotState; 
  commands: string[];
  onStateUpdate: (state: Partial<RobotState>) => void;
}) {
  const { currentCommandIndex, isExecuting } = useCommandExecutor(commands, onStateUpdate);
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#F4B400" />

      <FloorGrid />
      <RobotModel state={robotState} isMoving={isExecuting} />
      <GoalMarker />
      <Obstacles />
      
      {/* Sensor beam visualization */}
      {robotState.sensorReading >= 0 && (
        <SensorBeam 
          position={[robotState.x, 0.3, robotState.z]} 
          rotation={robotState.rotation}
          distance={robotState.sensorReading / 100}
        />
      )}

      {/* Start marker */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color="#2B1EA3" transparent opacity={0.5} />
      </mesh>
      
      {/* Trail/path visualization */}
      <PathTrail path={[{ x: 0, z: 0 }, { x: robotState.x, z: robotState.z }]} />

      <OrbitControls
        makeDefault
        minDistance={3}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2.1}
        target={[2, 0, -2]}
      />
    </>
  );
}

// ─── Sensor Beam Visualization ──────────────────────────────
function SensorBeam({ position, rotation, distance }: { 
  position: [number, number, number]; 
  rotation: number; 
  distance: number 
}) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const opacity = 0.3 + Math.sin(state.clock.elapsedTime * 8) * 0.2;
      (ref.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  const rad = (-rotation * Math.PI) / 180;
  const endX = position[0] + Math.sin(rad) * distance;
  const endZ = position[2] - Math.cos(rad) * distance;

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([position[0], position[1], position[2], endX, position[1], endZ])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#F4B400" transparent opacity={0.5} />
    </line>
  );
}

// ─── Path Trail ─────────────────────────────────────────────
function PathTrail({ path }: { path: { x: number; z: number }[] }) {
  if (path.length < 2) return null;
  
  const points = path.map(p => new THREE.Vector3(p.x, 0.02, p.z));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineDashedMaterial color="#F4B400" transparent opacity={0.3} dashSize={0.1} gapSize={0.1} />
    </line>
  );
}

export default function SimulationScene({ robotState, commands, onCommandComplete }: SimulationSceneProps) {
  const [internalState, setInternalState] = useState(robotState);
  
  const handleStateUpdate = useCallback((update: Partial<RobotState>) => {
    setInternalState(prev => ({ ...prev, ...update }));
  }, []);
  
  // Sync external state changes
  useEffect(() => {
    if (robotState.x === 0 && robotState.z === 0 && robotState.rotation === 0) {
      setInternalState(robotState);
    }
  }, [robotState]);
  
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [6, 8, 8], fov: 45 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0B0638']} />
        <fog attach="fog" args={['#0B0638', 15, 30]} />
        <Scene 
          robotState={internalState} 
          commands={commands} 
          onStateUpdate={handleStateUpdate}
        />
      </Canvas>
    </div>
  );
}
