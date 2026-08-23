import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { useRobotSection } from '@/hooks/useRobotSection'

export default function HumanConversation() {
  const containerRef = useRef(null)

  const robotRef = useRobotSection({
    id: 'human-conversation',
    config: {
      position: [4.5, 0, 0], // Far right
      rotation: [0, -0.2, 0], // Looking slightly left
      scale: 1.2
    }
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      // Comparison animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.hc-compare',
          start: 'top 70%',
          end: 'bottom 40%',
          scrub: true,
        }
      })

      tl.fromTo('.hc-traditional',
        { opacity: 0.5, filter: 'blur(0px)', scale: 1 },
        { opacity: 0.1, filter: 'blur(4px)', scale: 0.95 }
      )
        .fromTo('.hc-mitra',
          { opacity: 0.1, filter: 'blur(10px)', y: 50 },
          { opacity: 1, filter: 'blur(0px)', y: 0 },
          "<"
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
      className="py-24 md:py-40 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-12 md:mb-16">
          Designed for conversation.<br />
          <span className="text-[var(--color-text-secondary)]">Not commands.</span>
        </h2>

        <div className="hc-compare flex flex-col items-center justify-center gap-10 md:gap-12 relative">

          {/* Traditional Assistant */}
          <div className="hc-traditional flex flex-col items-center opacity-50">
            <div className="text-xs tracking-[0.2em] uppercase text-[var(--color-text-secondary)] mb-4">Traditional Assistant</div>
            <div className="px-8 py-4 border border-[var(--color-border)] rounded-full text-lg">
              "How can I help you today?"
            </div>
          </div>

          {/* Divider */}
          <div className="w-[1px] h-10 md:h-12 bg-gradient-to-b from-transparent via-[var(--color-border)] to-transparent" />

          {/* Mitra AI */}
          <div className="hc-mitra flex flex-col items-center">
            <div className="text-xs tracking-[0.2em] uppercase text-[var(--color-text-primary)] mb-4">Mitra AI</div>
            <div className="px-10 py-5 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] rounded-full text-xl md:text-2xl font-medium shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              "You can start wherever you want."
            </div>
          </div>

        </div>

        <p className="mt-24 text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto font-light leading-relaxed">
          Mitra is configured for natural conversational behavior. It doesn't expect perfectly formatted queries. It's designed to feel natural, contextual, and empathetic to how humans actually speak.
        </p>

      </div>
    </section>
  )
}
