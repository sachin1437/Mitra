import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRobotSection } from '@/hooks/useRobotSection'
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// A component that splits text into words and wraps them in spans for staggered animation
const RevealText = ({ text, className = "" }) => {
  return text.split(' ').map((word, i) => (
    <span key={i} className={`reveal-word opacity-20 ${className}`}>
      {word}{' '}
    </span>
  ));
};

export default function ProblemSection() {
  const containerRef = useRef(null)
  
  const robotRef = useRobotSection({
    id: 'problem',
    config: {
      scale: 0 // Hide robot during this text-heavy section to avoid overlap
    }
  });
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      // 1. Top label and headline static reveal
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          end: 'bottom 80%',
          toggleActions: 'play none none reverse',
        }
      })

      // Top label reveal
      tl.fromTo('.problem-label',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
      )
      
      // Headline line-by-line reveal with clip mask effect
      .fromTo('.problem-headline-line',
        { y: '100%', opacity: 0, rotationX: 15 },
        { 
          y: '0%', 
          opacity: 1, 
          rotationX: 0, 
          duration: 0.8, 
          stagger: 0.15, 
          ease: 'power3.out',
          transformOrigin: '0% 50% -50'
        },
        "-=0.4"
      );

      // 2. Professional "scrubbed" text reveal on scroll for paragraphs
      gsap.to('.reveal-word', {
        opacity: 1,
        stagger: 0.1, // this stagger gives the consecutive word-by-word reveal effect
        scrollTrigger: {
          trigger: '.paragraphs-container',
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: 1, // Smooth dampening 
        }
      });
      
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section 
      ref={(el) => {
        containerRef.current = el;
        if (robotRef) robotRef.current = el;
      }} 
      className="relative w-full py-32 md:py-48 bg-bg-primary border-t border-border overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12 flex flex-col items-start text-left">
        
        {/* Label */}
        <div className="problem-label flex items-center gap-4 mb-12">
          <div className="w-8 h-[1px] bg-amber-600 dark:bg-[#E8BA35] opacity-80" />
          <span className="text-amber-600 dark:text-[#E8BA35] text-xs font-bold tracking-[0.2em] uppercase">
            Why we're building this
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-16 text-text-primary max-w-4xl" style={{ perspective: '1000px' }}>
          <div className="overflow-hidden pb-2"><div className="problem-headline-line">Most people don't tell anyone.</div></div>
          <div className="overflow-hidden pb-2"><div className="problem-headline-line text-text-secondary">That's the actual problem.</div></div>
        </h2>

        {/* Paragraphs with Text Reveal */}
        <div className="paragraphs-container space-y-8 text-lg md:text-xl lg:text-2xl text-text-secondary font-light max-w-3xl leading-relaxed">
          <p>
            <RevealText text="Between work pressure, family expectations, and a culture where" />
            <RevealText text="therapy still carries stigma," className="font-medium text-text-primary" />
            <RevealText text="most people don't reach out until things are already bad, and even then, often not to a person." />
          </p>
          <p>
            <RevealText text="Mitra isn't trying to replace a therapist, a friend, or a family member. It's built for the gap before any of them are reachable. We're starting with India's college students, because that's where the gap is widest right now, but the problem isn't unique to campuses." />
          </p>
          <p>
            <RevealText text="That's the moment Mitra is built for. Not a diagnosis, not a lecture, just someone on the other end who's actually paying attention." className="text-text-primary" />
          </p>
        </div>

      </div>
    </section>
  )
}
