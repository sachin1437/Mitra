import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRobotSection } from '@/hooks/useRobotSection'

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function PrivacySection() {
  const containerRef = useRef(null)
  
  const robotRef = useRobotSection({
    id: 'privacy',
    config: {
      position: [0, -3.0, -3], // Bottom center, slightly back
      rotation: [0, 0, 0],
      scale: 1.0
    }
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Fade in left side
      gsap.fromTo('.privacy-left > *',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          stagger: 0.15,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 65%',
          }
        }
      )

      // Fade and scale in right card
      gsap.fromTo('.safety-card',
        { opacity: 0, x: 40 },
        {
          opacity: 1, x: 0,
          duration: 1,
          ease: 'power3.out',
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
        if (robotRef) robotRef.current = el;
      }} 
      id="privacy" 
      className="py-32 md:py-48 bg-bg-primary relative border-t border-border overflow-hidden"
    >
      
      {/* Subtle Background Grid for the entire section */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }}
      />

      <div className="max-w-[90rem] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">

        {/* Left Side: Privacy By Default */}
        <div className="privacy-left w-full">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-px bg-amber-600 dark:bg-[#E8BA35]"></div>
            <span className="text-amber-600 dark:text-[#E8BA35] uppercase tracking-[0.2em] text-xs font-medium">Privacy, in plain terms</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-10 text-text-primary leading-[1.1]">
            Private by default,<br />not by settings.
          </h2>

          <div className="flex flex-col gap-6 text-lg md:text-xl text-[var(--color-text-secondary)] font-light leading-relaxed max-w-xl">
            <p>
              Every message is protected the moment you send it. Nothing is kept beyond your session unless you choose to save it, and incognito mode leaves nothing behind at all.
            </p>
            <p>
              We don't publish how our systems work. What matters is what happens to your words after you send them, and that's simple: they stay yours.
            </p>
            
            {/* Highlighted Bullet Point */}
            <div className="mt-4 flex items-start gap-4 p-5 rounded-xl bg-surface border border-border backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] mt-2.5 flex-shrink-0"></div>
              <p className="text-sm md:text-base font-mono text-text-primary tracking-wide leading-relaxed">
                Same protection for every message. There's no separate private mode that's more secure than the default.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Safety / When It Matters Most */}
        <div className="w-full">
          <div className="safety-card relative overflow-hidden rounded-2xl bg-bg-secondary border border-border p-8 md:p-12 shadow-2xl">
            
            {/* The distinct left red border from the mockup */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF5B37] shadow-[0_0_15px_rgba(255,91,55,0.4)]" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <span className="text-[#FF5B37] font-mono text-xs md:text-sm tracking-widest uppercase">
                  // When it matters most
                </span>
              </div>

              <h3 className="text-3xl md:text-4xl font-medium tracking-tight mb-8 text-text-primary">
                Mitra knows what it isn't.
              </h3>

              <div className="flex flex-col gap-6 text-base md:text-lg text-[var(--color-text-secondary)] font-light leading-relaxed">
                <p>
                  Mitra is not a replacement for professional care, and it's built to say so. When something in the conversation signals real danger, Mitra shifts, gently and without alarm, toward real help: a direct path to Tele-MANAS (14416), India's national mental health helpline.
                </p>
                <p>
                  The goal isn't to handle the moment alone. It's to make sure no one is left handling it alone either.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
