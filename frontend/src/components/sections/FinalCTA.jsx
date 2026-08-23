import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { useRobotSection } from '@/hooks/useRobotSection'

export default function FinalCTA() {
  const containerRef = useRef(null)

  const robotRef = useRobotSection({
    id: 'final-cta',
    config: {
      position: [4.5, -0.5, 0], // Far Right side
      rotation: [0, -0.2, 0], // Face slightly left
      scale: 1.3
    }
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.cta-content',
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1, scale: 1, duration: 1, ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 60%',
          }
        }
      )
    }, containerRef.current)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={(el) => {
        containerRef.current = el;
        robotRef.current = el;
      }}
      className="relative w-full h-screen min-h-[700px] flex items-center justify-center bg-bg-primary overflow-hidden"
    >
      <div className="absolute inset-0 z-1 bg-bg-primary/60" />

      <div className="cta-content relative z-10 max-w-[90rem] mx-auto px-6 md:px-12 w-full flex flex-col items-start justify-center text-left">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-12 leading-[1.2] max-w-4xl text-text-primary">
          Today, Mitra lives on your phone. Where it goes next goes <span className="text-text-primary border-b border-amber-600 dark:border-[#E8BA35] pb-1">well beyond a chatbot.</span>
        </h2>

      </div>
    </section>
  )
}
