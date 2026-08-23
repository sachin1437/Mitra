import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { useRobotSection } from '@/hooks/useRobotSection'

export default function AboutSection() {
  const containerRef = useRef(null)
  
  const robotRef = useRobotSection({
    id: 'about',
    config: {
      position: [0, 2.8, -1], // Top center, safely above the 2-column grid
      rotation: [0.2, 0, 0], // Looking slightly down
      scale: 0.8
    }
  });
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Headline reveal
      gsap.fromTo('.about-headline',
        { opacity: 0, y: 50 },
        {
          opacity: 1, 
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: '.about-headline',
            start: 'top 80%',
            end: 'top 50%',
            scrub: true,
          }
        }
      )
      
      // Principles stagger
      gsap.fromTo('.about-principle',
        { opacity: 0, x: -20 },
        {
          opacity: 1, 
          x: 0,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.about-principles-container',
            start: 'top 75%',
            end: 'top 40%',
            scrub: true,
          }
        }
      )
    }, containerRef)
    
    return () => ctx.revert()
  }, [])

  const principles = [
    "Listens without judgment",
    "Understands context",
    "Responds naturally",
    "Remembers the conversation",
    "Respects privacy"
  ]

  return (
    <section 
      ref={(el) => {
        containerRef.current = el;
        robotRef.current = el;
      }} 
      id="about" 
      className="py-24 md:py-40 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] relative"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          
          <div className="flex flex-col justify-center">
            <div className="text-xs tracking-[0.2em] uppercase text-[var(--color-text-secondary)] mb-6 about-headline">
              What is Mitra
            </div>
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-8 about-headline">
              Built to listen.
            </h2>
            <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] font-light leading-relaxed about-headline">
              Mitra is designed for natural conversations where you can express yourself
              without feeling like you need to formulate the perfect question.
            </p>
          </div>
          
          <div className="about-principles-container flex flex-col justify-center gap-6">
            {principles.map((principle, index) => (
              <div key={index} className="about-principle flex items-center gap-6 group">
                <div className="w-12 h-[1px] bg-[var(--color-text-secondary)] group-hover:bg-[var(--color-text-primary)] group-hover:w-16 transition-all duration-300" />
                <span className="text-lg md:text-xl font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors duration-300 uppercase tracking-widest">
                  {principle}
                </span>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  )
}
