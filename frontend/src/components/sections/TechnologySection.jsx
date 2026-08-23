import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ArrowDown } from 'lucide-react'
import { useRobotSection } from '@/hooks/useRobotSection'

const architecture = [
  "Secure Client",
  "Conversation Layer",
  "AI Processing",
  "Temporary Storage",
  "Automatic Expiration"
]

export default function TechnologySection() {
  const containerRef = useRef(null)
  
  const robotRef = useRobotSection({
    id: 'technology',
    config: {
      scale: 0 // Hide robot during this text-heavy section to avoid overlap
    }
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const layers = gsap.utils.toArray('.tech-layer')
      const arrows = gsap.utils.toArray('.tech-arrow')

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.tech-stack',
          start: 'top 75%',
          end: 'bottom 40%',
          scrub: 1,
        }
      })

      layers.forEach((layer, i) => {
        tl.fromTo(layer,
          { opacity: 0.1, scale: 0.9, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 1 }
        )
        if (arrows[i]) {
          tl.fromTo(arrows[i],
            { opacity: 0, y: -10 },
            { opacity: 1, y: 0, duration: 0.5 },
            "-=0.5"
          )
        }
      })

    }, containerRef.current)
    return () => ctx.revert()
  }, [])

  return (
    <section 
      ref={(el) => {
        containerRef.current = el;
        if (robotRef) robotRef.current = el;
      }} 
      id="technology" 
      className="py-24 md:py-40 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center">

        <div className="text-center mb-24">
          <div className="text-xs tracking-[0.2em] uppercase text-[var(--color-text-secondary)] mb-6">
            Architecture
          </div>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight">
            Behind the conversation.
          </h2>
        </div>

        <div className="tech-stack w-full max-w-2xl flex flex-col items-center">

          <div className="tech-layer px-8 py-4 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-lg font-medium backdrop-blur-sm">
            User
          </div>

          <div className="tech-arrow my-4 text-[var(--color-text-secondary)]/70">
            <ArrowDown size={24} />
          </div>

          {architecture.map((layer, i) => (
            <React.Fragment key={i}>
              <div className="tech-layer w-full p-6 md:p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-text-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="text-xl md:text-2xl font-medium relative z-10">{layer}</h3>
              </div>

              {i < architecture.length - 1 && (
                <div className="tech-arrow my-4 text-[var(--color-text-secondary)]/70">
                  <ArrowDown size={24} />
                </div>
              )}
            </React.Fragment>
          ))}

        </div>

      </div>
    </section>
  )
}
