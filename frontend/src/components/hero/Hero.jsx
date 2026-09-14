import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import HeroContent from './HeroContent'
import { useRobotSection } from '@/hooks/useRobotSection'
import { globalRobotController } from '@/components/robot/RobotController'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Hero() {
  const containerRef = useRef(null);

  const robotRef = useRobotSection({
    id: 'hero',
    config: {
      // The "Presenting" Pose - Desktop
      // We push it back in Z (-2.0), move it slightly right (3.5) and down (-1.5)
      // and scale it massively (3.2) so the hand reaches across the screen
      // behind the text.
      position: [3.5, -1.5, -2.0],
      rotation: [0.05, -0.2, 0],
      scale: 3.2,
      mobileConfig: {
        // Mobile Presenting Pose
        position: [1.5, -2.0, -1.0],
        rotation: [0.05, -0.1, 0],
        scale: 1.8
      }
    }
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5, // Smoother scrub
        onRefresh: (self) => {
          if (globalRobotController.activeSectionId === 'hero') {
            self.update();
          }
        },
        onUpdate: (self) => {
          if (globalRobotController.activeSectionId !== 'hero') return;

          const p = self.progress;
          const isMobile = window.innerWidth < 768;

          // Base resting values
          const basePos = isMobile ? [1.5, -2.0, -1.0] : [3.5, -1.5, -2.0];
          const baseRot = isMobile ? [0.05, -0.1, 0] : [0.05, -0.2, 0];
          const baseScale = isMobile ? 1.8 : 3.2;

          // Phase 1 (0% to 20%): Anticipation / Subtle Reaction
          // Phase 2 (20% to 100%): Moving out and down into the next section

          let moveP = 0;
          let antP = 0;

          if (p <= 0.2) {
            antP = p / 0.2; // 0 to 1
          } else {
            antP = 1;
            moveP = (p - 0.2) / 0.8; // 0 to 1
          }

          const easedAntP = gsap.parseEase('power2.out')(antP);
          const easedMoveP = gsap.parseEase('power2.inOut')(moveP);

          // Anticipation: Slightly push back in Z and subtly rotate
          let currentX = basePos[0];
          let currentY = basePos[1];
          let currentZ = basePos[2] - (easedAntP * 1.5);
          let rotX = baseRot[0] - (easedAntP * 0.05);
          let rotY = baseRot[1] + (easedAntP * 0.1);
          let rotZ = baseRot[2];
          let scale = baseScale;

          // Movement: Travel downward, outward, and rotate to transition to next section
          if (moveP > 0) {
            currentX += (isMobile ? 3 : 5) * easedMoveP; // Move right
            currentY -= (isMobile ? 3 : 6) * easedMoveP; // Move down deep into page
            currentZ -= 2 * easedMoveP; // Move further back

            rotX += 0.2 * easedMoveP;
            rotY += 0.4 * easedMoveP;

            scale = Math.max(0.1, baseScale - (baseScale * 0.4 * easedMoveP)); // Shrink slightly to create perspective
          }

          globalRobotController.targetPosition.set(currentX, currentY, currentZ);
          globalRobotController.targetRotation.set(rotX, rotY, rotZ);
          globalRobotController.targetScale = scale;
        }
      });
    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={(el) => {
        containerRef.current = el;
        robotRef.current = el;
      }}
      className="relative w-full min-h-[120svh] flex flex-col justify-start pt-32 lg:pt-48 overflow-hidden bg-bg-primary"
    >
      {/* High Z-Index Typography Container */}
      {/* Uses max-w to keep it readable, but lets it float in the scene. Pointer events none on wrapper to let mouse pass to robot if needed. */}
      <div className="w-full max-w-[90rem] mx-auto px-6 md:px-12 relative z-[60] pointer-events-none">
        <HeroContent />
      </div>
    </section>
  )
}
