import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import RobotScene from './RobotScene';
import { ErrorBoundary } from '@/lib/performance/ErrorBoundary';
import { globalRobotController } from './RobotController';

export default function GlobalRobot3D({ isDark = true }) {
  // Track mouse movements to update the controller
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse coordinates to -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      globalRobotController.updateMouse(x, y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 0, 15], fov: 40 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            className="w-full h-full !pointer-events-none"
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

            <RobotScene />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
