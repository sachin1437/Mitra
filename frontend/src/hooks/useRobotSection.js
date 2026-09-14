import { useEffect, useRef } from 'react';
import { globalRobotController } from '@/components/robot/RobotController';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useRobotSection({ id, config }) {
  const triggerRef = useRef(null);

  const configString = JSON.stringify(config);

  useEffect(() => {
    if (!triggerRef.current) return;
    const currentConfig = JSON.parse(configString);

    const applyTarget = (isForce = false) => {
      // If triggered by a resize (not forced), only apply if this is the currently active section.
      // This prevents inactive sections from overwriting the robot config during window resizes!
      if (!isForce && globalRobotController.activeSectionId !== id && globalRobotController.activeSectionId !== undefined) return;

      let finalConfig = { ...currentConfig };


      const isMobile = window.innerWidth < 1024;
      const isTablet = false;

      if (isMobile) {
        if (currentConfig.mobileConfig) {
          finalConfig = { ...finalConfig, ...currentConfig.mobileConfig };
        } else {
          // Mobile Fallback: Shrink robot and move it to a safe top/bottom decorative zone
          finalConfig.scale = (currentConfig.scale || 1) * 0.75;

      
          if (finalConfig.position) {
            const x = finalConfig.position[0];
            const safeX = x > 0 ? 1.5 : (x < 0 ? -1.5 : 0);
            finalConfig.position = [safeX, finalConfig.position[1] + 1, finalConfig.position[2] - 1];
          }
        }
      } else if (isTablet) {
        finalConfig.scale = (currentConfig.scale || 1) * 0.8;
      }

      globalRobotController.setTarget(finalConfig, id);
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: triggerRef.current,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => {
          if (self.isActive) {
            applyTarget(true); // Force apply on scroll
          }
        },
      });
    });

    // If it's the hero section, apply immediately on mount so it doesn't spawn offscreen
    if (id === 'hero') {
      applyTarget(true); // Force apply on mount
    }

    const handleResize = () => applyTarget(false);

    // Recalculate on resize
    window.addEventListener('resize', handleResize);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', handleResize);
    };
  }, [id, configString]);

  return triggerRef;
}
