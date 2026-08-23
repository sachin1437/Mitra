import React, { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import RobotScene from './RobotScene';
import RobotPlaceholder from './RobotPlaceholder';
import { ErrorBoundary } from '@/lib/performance/ErrorBoundary';

export default function Robot3D({ isDark = true }) {
  const containerRef = useRef(null);
  const [hasFailed, setHasFailed] = useState(false);
  
  if (hasFailed) {
    return (
      <div className="w-full h-full min-h-[400px] md:min-h-[600px] relative flex items-center justify-center">
        <RobotPlaceholder />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] md:min-h-[600px] relative flex items-center justify-center">
      <ErrorBoundary fallback={<RobotPlaceholder />}>
        {/* Placeholder handles the layout reservation and CLS avoidance */}
        <RobotPlaceholder />
        
        <div className="absolute inset-0 z-10">
          <Suspense fallback={null}>
            <Canvas
              camera={{ position: [0, 0, 7.5], fov: 40 }}
              dpr={[1, 1.5]} // Performance: limit DPR on mobile
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
              className="w-full h-full"
            >
              {/* Cinematic Lighting Rig */}
              <ambientLight intensity={isDark ? 0.7 : 1.2} />
              <directionalLight 
                position={[5, 8, 5]} 
                intensity={isDark ? 2.5 : 1.8} 
                color={isDark ? "#ffffff" : "#f1f5f9"} 
              />
              {/* Subtle Rim lights for 3D depth and cinematic quality */}
              <pointLight position={[-5, 5, -5]} intensity={isDark ? 3.5 : 1.5} color="#5227FF" />
              <pointLight position={[5, -5, -2]} intensity={isDark ? 2.5 : 1} color="#E8BA35" />

              <RobotScene containerRef={containerRef} onFail={() => setHasFailed(true)} />
            </Canvas>
          </Suspense>
        </div>
      </ErrorBoundary>
    </div>
  );
}
