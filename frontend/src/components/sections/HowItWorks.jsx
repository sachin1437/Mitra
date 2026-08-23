import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useRobotSection } from '@/hooks/useRobotSection'

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const steps = [
  {
    num: "01",
    title: "Speaks the way you actually text",
    desc: "Hinglish when that feels natural, never slipping into therapy-speak, never sounding like a script."
  },
  {
    num: "02",
    title: "Notices what matters, quietly",
    desc: "A safety layer that runs under every conversation, built to notice when something is seriously wrong and respond the right way."
  },
  {
    num: "03",
    title: "Forgets on command",
    desc: "Incognito mode leaves nothing behind. No history to find, nothing to explain to anyone."
  }
]

export default function HowItWorks() {
  const containerRef = useRef(null)

  const robotRef = useRobotSection({
    id: 'main',
    config: {
      position: [-4.5, -1, 0], // Far bottom-left side, below the sticky numbers
      rotation: [0, 0.2, 0], // Looking slightly right
      scale: 1.0
    }
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Animate numbers based on scroll position of right column items
      const rightItems = gsap.utils.toArray('.hiw-right-item')
      const numbers = gsap.utils.toArray('.hiw-num')

      rightItems.forEach((item, i) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 40%', // Triggers later (when item scrolls further up) to avoid changing to 02 while 01 is still mainly in view
          end: 'bottom 40%',
          onEnter: () => setActive(i),
          onEnterBack: () => setActive(i),
        })
      })

      function setActive(index) {
        numbers.forEach((num, i) => {
          gsap.to(num, {
            opacity: i === index ? 1 : 0,
            y: i === index ? 0 : (i < index ? -30 : 30),
            duration: 0.6,
            ease: 'power3.out',
            overwrite: true
          })
        })
      }

      // Initialize first as active
      setActive(0)

    }, containerRef.current)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={(el) => {
        containerRef.current = el;
        robotRef.current = el;
      }}
      id="main"
      className="relative w-full bg-bg-primary pt-32"
    >

      {/* Top Header Layer */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 mb-16 relative z-20">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-4 text-text-primary">
          Three systems, one companion.
        </h2>
        <p className="text-lg md:text-xl text-text-secondary font-light">
          Built and tested with real conversations, not guesswork.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 relative">

        {/* Left Sticky Column - Using CSS Sticky instead of GSAP pin to prevent overlapping jumps */}
        <div className="md:col-span-4 relative h-full">
          <div className="sticky top-0 h-[50vh] md:h-screen flex flex-col justify-center">
            <div className="text-xs tracking-[0.2em] uppercase text-text-secondary mb-12 hidden md:block">
              What Mitra Does
            </div>

            <div className="relative h-40 md:h-56 overflow-hidden">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="hiw-num absolute top-0 left-0 text-[8rem] md:text-[10rem] lg:text-[12rem] font-light text-text-primary opacity-0 leading-none tracking-tighter"
                >
                  {step.num}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Scrolling Column */}
        <div className="md:col-span-8 pb-[20vh] relative z-10 md:pl-8 lg:pl-16">
          <div className="text-xs tracking-[0.2em] uppercase text-text-secondary mb-12 md:hidden">
            What Mitra Does
          </div>

          <div className="flex flex-col">
            {steps.map((step, i) => (
              <div
                key={i}
                className="hiw-right-item min-h-[50vh] md:min-h-[100vh] flex flex-col justify-center py-[10vh]"
              >
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-6 text-text-primary leading-tight">
                  {step.title}
                </h3>
                <p className="text-xl md:text-2xl text-text-secondary font-light leading-relaxed max-w-xl">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
