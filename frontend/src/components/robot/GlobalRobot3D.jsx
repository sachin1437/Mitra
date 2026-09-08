import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import RobotScene from './RobotScene';
import { ErrorBoundary } from '@/lib/performance/ErrorBoundary';
import { globalRobotController } from './RobotController';
import { useTheme } from '@/app/providers/ThemeProvider';

export default function GlobalRobot3D() {
  const { theme, resolvedTheme } = useTheme();
  const activeTheme = theme === 'system' ? resolvedTheme : theme;
  const isDark = activeTheme === 'dark';

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
    <div className="fixed inset-0 z-50 pointer-events-none" style={{ viewTransitionName: 'none' }}>
      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 0, 15], fov: 40 }}
            dpr={1}
            // preserveDrawingBuffer causes VRAM exhaustion on mobile during view transitions, leading to WebGL context loss (robot disappears).
            // We only enable it on desktop where VRAM is plentiful.
            gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: typeof window !== 'undefined' && window.innerWidth > 768 }}
            className="w-full h-full !pointer-events-none"
          >
            {/* Comprehensive Lighting Rig */}
            <ambientLight intensity={isDark ? 1.5 : 2.0} />
            
            {/* Main Key Light */}
            <directionalLight 
              position={[5, 8, 10]} 
              intensity={isDark ? 3.0 : 2.5} 
              color={isDark ? "#ffffff" : "#f1f5f9"} 
            />
            
            {/* Left Fill Light */}
            <directionalLight 
              position={[-10, 2, 5]} 
              intensity={isDark ? 2.0 : 1.5} 
              color="#ffffff" 
            />
            
            {/* Right Fill Light */}
            <directionalLight 
              position={[10, 2, 5]} 
              intensity={isDark ? 2.0 : 1.5} 
              color="#ffffff" 
            />

            {/* Bottom Fill Light (so underside isn't pure black) */}
            <directionalLight 
              position={[0, -10, 5]} 
              intensity={isDark ? 1.5 : 1.0} 
              color="#ffffff" 
            />

            {/* Subtle Rim lights for 3D depth and cinematic quality */}
            <pointLight position={[-5, 5, -5]} intensity={isDark ? 4.0 : 2.5} color="#5227FF" />
            <pointLight position={[5, -5, -2]} intensity={isDark ? 3.0 : 2.0} color="#E8BA35" />

            <RobotScene />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
