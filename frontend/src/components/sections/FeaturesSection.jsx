import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SpotlightCard from '@/components/ui/SpotlightCard'
import { useRobotSection } from '@/hooks/useRobotSection'

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  { 
    title: "Always there", 
    desc: "No waiting for an appointment and no explaining yourself twice. Mitra is there at 2am the same way it's there at 2pm." 
  },
  { 
    title: "No judgment", 
    desc: "Say the messy, half-formed thing. There's no face to read and no relationship to protect afterward." 
  },
  { 
    title: "Speaks your language", 
    desc: "Moves naturally between English and Hindi the way you actually think, not the way a textbook does." 
  },
  { 
    title: "Genuinely private", 
    desc: "Not private with an asterisk. What you say stays where you said it." 
  },
]

export default function FeaturesSection() {
  const containerRef = useRef(null)
  
  const robotRef = useRobotSection({
    id: 'features',
    config: {
      position: [4.5, 2.5, -1], // Far Top right, away from title text
      rotation: [0.1, -0.4, 0], 
      scale: 0.8
    }
  });
  
  useEffect(() => {
    if (!containerRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo('.fs-header',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
          }
        }
      )

      // Cards stagger animation
      gsap.fromTo('.fs-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.fs-grid',
            start: 'top 80%',
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
      className="py-32 md:py-48 bg-bg-primary relative overflow-hidden border-t border-border"
    >
      {/* Subtle background grid pattern */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }}
      />

      <div className="max-w-[90rem] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="fs-header mb-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-px bg-amber-600 dark:bg-[#E8BA35]"></div>
            <span className="text-amber-600 dark:text-[#E8BA35] uppercase tracking-[0.2em] text-xs font-medium">Why it's different</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-text-primary max-w-4xl leading-[1.1]">
            Built to actually help, not just listen.
          </h2>
        </div>
        
        {/* Spotlight Cards Grid */}
        <div className="fs-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <SpotlightCard key={i} className="fs-card h-full">
              <div className="w-8 h-px bg-amber-600 dark:bg-[#E8BA35] mb-6 opacity-80"></div>
              <h3 className="text-xl md:text-2xl font-medium mb-4 text-text-primary">{feature.title}</h3>
              <p className="text-[var(--color-text-secondary)] font-light leading-relaxed text-[15px] md:text-base">
                {feature.desc}
              </p>
            </SpotlightCard>
          ))}
        </div>



      </div>
    </section>
  )
}
