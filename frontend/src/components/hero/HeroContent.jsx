import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function HeroContent() {
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    // Reveal animation
    const ctx = gsap.context(() => {
      // 3.0s delay to allow new premium preloader to finish its animation
      const tl = gsap.timeline({ delay: 3.0 })

      tl.fromTo('.hero-text-line',
        { y: 60, opacity: 0, rotationX: 25 },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          stagger: 0.1,
          duration: 1.0,
          ease: 'power3.out',
          transformOrigin: '0% 50% -50'
        }
      )
        .fromTo(subtitleRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          "-=0.5"
        )
        .fromTo(ctaRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          "-=0.6"
        )
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="flex flex-col items-start justify-center w-full">
      <h1
        ref={titleRef}
        className="text-[2.5rem] sm:text-[3rem] leading-[1.1] md:text-6xl lg:text-7xl xl:text-[5.5rem] font-medium tracking-tight mb-6 sm:mb-8"
        style={{ perspective: '1000px' }}
      >
        <div className="overflow-hidden pb-1"><div className="hero-text-line opacity-0 whitespace-nowrap">A friend who never</div></div>
        <div className="overflow-hidden pb-1"><div className="hero-text-line opacity-0 whitespace-nowrap">forgets to keep <span className="text-amber-600 dark:text-[#E8BA35]">your</span></div></div>
        <div className="overflow-hidden pb-1"><div className="hero-text-line opacity-0 text-amber-600 dark:text-[#E8BA35] whitespace-nowrap">secret.</div></div>
      </h1>

      <div ref={subtitleRef} className="max-w-xl mb-10 opacity-0">
        <p className="text-lg md:text-xl text-text-secondary leading-relaxed font-light">
          Mitra is an AI companion built for the moments people usually face alone. We're starting with India's college students, and building toward a lot more than a chatbot.
        </p>
      </div>

      <div ref={ctaRef} className="flex flex-col sm:flex-row gap-6 items-start sm:items-center opacity-0 pointer-events-auto">
        <a href="/src/chat/app.html#login" className="px-8 py-4 bg-[#E8BA35] text-[#121316] font-medium rounded-full hover:scale-105 transition-transform duration-300 inline-block text-center">
          Start Conversation
        </a>
        <a href="#main" className="text-sm font-medium tracking-wide text-text-secondary hover:text-amber-600 dark:hover:text-[#E8BA35] transition-colors flex items-center gap-2 group">
          See what Mitra does
          <span className="transform group-hover:translate-y-1 transition-transform">↓</span>
        </a>
      </div>
    </div>
  )
}
