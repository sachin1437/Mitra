import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

const securityTopics = [
  "Privacy-first architecture",
  "Secure authentication",
  "Protected conversations",
  "Controlled data retention",
  "Automatic expiration",
  "Minimal exposure"
]

export default function SecuritySection() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      // Abstract background grid animation
      gsap.to('.sec-grid-line-h', {
        scaleX: 1,
        duration: 1.5,
        stagger: 0.1,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: '.sec-grid',
          start: 'top 80%',
        }
      })

      gsap.to('.sec-grid-line-v', {
        scaleY: 1,
        duration: 1.5,
        stagger: 0.1,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: '.sec-grid',
          start: 'top 80%',
        }
      })

      // Topic reveal
      gsap.fromTo('.sec-topic',
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.sec-topics',
            start: 'top 75%',
          }
        }
      )
    }, containerRef.current)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="py-24 md:py-40 bg-bg-primary relative overflow-hidden">

      {/* Abstract Security Grid */}
      <div className="sec-grid absolute inset-0 z-0 opacity-20 pointer-events-none">
        {/* Horizontal Lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`h-${i}`} className="sec-grid-line-h absolute left-0 right-0 h-px bg-(--color-border) origin-left scale-x-0" style={{ top: `${(i + 1) * 12.5}%` }} />
        ))}
        {/* Vertical Lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`v-${i}`} className="sec-grid-line-v absolute top-0 bottom-0 w-px bg-(--color-border) origin-top scale-y-0" style={{ left: `${(i + 1) * 12.5}%` }} />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center text-center">
        <div className="text-xs tracking-[0.2em] uppercase text-text-secondary mb-6">
          Security & Architecture
        </div>
        <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-16">
          Designed for minimal exposure.
        </h2>

        <div className="sec-topics w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {securityTopics.map((topic, i) => (
            <div key={i} className="sec-topic flex items-center justify-between p-6 bg-bg-secondary/70 backdrop-blur-sm border border-(--color-border) rounded-xl group hover:bg-surface transition-colors">
              <span className="text-lg text-text-secondary group-hover:text-text-primary transition-colors">{topic}</span>
              <div className="w-2 h-2 rounded-full bg-text-secondary/20 group-hover:bg-text-primary transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
