'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';

function useDevicePerf() {
  const [tier, setTier] = useState<'high' | 'low'>('high');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cores = (navigator as any).hardwareConcurrency ?? 4;
    const memory = (navigator as any).deviceMemory ?? 4;
    const small = window.matchMedia('(max-width: 768px)').matches;
    if (reduced || cores <= 2 || memory < 4 || small) setTier('low');
  }, []);
  return tier;
}

function RobotCore() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={meshRef}>
        {/* Core sphere */}
        <Sphere args={[1.2, 64, 64]}>
          <MeshDistortMaterial
            color="#12006B"
            attach="material"
            distort={0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>

        {/* Inner glow */}
        <Sphere args={[1.0, 32, 32]}>
          <meshBasicMaterial color="#33D6FF" transparent opacity={0.18} />
        </Sphere>

        {/* Orbit rings */}
        {[1.8, 2.2, 2.6].map((radius, i) => (
          <mesh key={i} rotation={[Math.PI / (3 + i), Math.PI / (4 + i), 0]}>
            <torusGeometry args={[radius, 0.015, 16, 100]} />
            <meshBasicMaterial color="#33D6FF" transparent opacity={0.4 - i * 0.1} />
          </mesh>
        ))}

        {/* Floating nodes */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 1.8 + (i % 3) * 0.4;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle * 0.5) * 0.5,
                Math.sin(angle) * radius,
              ]}
            >
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial color="#8A3FFC" />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
}

function CircuitParticles({ count = 500 }: { count?: number }) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, [count]);

  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      ref.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#33D6FF"
        transparent
        opacity={0.6}
        sizeAttenuation={true}
      />
    </points>
  );
}

export default function HeroScene() {
  const tier = useDevicePerf();
  const isLow = tier === 'low';

  return (
    <div className="absolute inset-0 z-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={isLow ? [1, 1.25] : [1, 2]}
        gl={{ antialias: !isLow, alpha: true, powerPreference: 'low-power' }}
        frameloop="always"
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#33D6FF" />
        {!isLow && <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8A3FFC" />}
        {!isLow && (
          <spotLight
            position={[0, 5, 5]}
            angle={0.3}
            penumbra={1}
            intensity={0.8}
            color="#86EAFF"
          />
        )}
        <RobotCore />
        <CircuitParticles count={isLow ? 80 : 500} />
        <Stars
          radius={100}
          depth={50}
          count={isLow ? 200 : 1000}
          factor={3}
          saturation={0}
          fade
          speed={isLow ? 0.4 : 1}
        />
      </Canvas>
    </div>
  );
}
