import React, { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'

export default function Preloader() {
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null)
  const textRef = useRef(null)
  const progressRef = useRef(null)
  const orbRef = useRef(null)
  const glowRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(orbRef.current, {
        y: -10,
        rotation: 8,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to(glowRef.current, {
        scale: 1.08,
        opacity: 0.85,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }, containerRef)

    const tl = gsap.timeline({
      onComplete: () => {
        setLoading(false)
      }
    })

    tl.fromTo(orbRef.current, {
      scale: 0.72,
      opacity: 0,
      filter: 'blur(14px)'
    }, {
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.8,
      ease: 'power3.out'
    })
    .fromTo(progressRef.current, {
      scaleX: 0,
      opacity: 0.3,
    }, {
      scaleX: 1,
      opacity: 1,
      duration: 1.8,
      ease: 'power3.inOut'
    }, '-=0.1')
    .to(textRef.current, {
      opacity: 0,
      y: -14,
      filter: 'blur(4px)',
      duration: 0.55,
      ease: 'power2.inOut'
    }, '-=0.25')
    .to(containerRef.current, {
      opacity: 0,
      scale: 1.02,
      duration: 0.7,
      ease: 'expo.inOut'
    })
    .set(containerRef.current, {
      display: 'none'
    })

    return () => {
      tl.kill()
      ctx.revert()
    }
  }, [])

  if (!loading) return null

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
    >
      <div ref={glowRef} className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_42%)] opacity-70" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.02),transparent)] opacity-70" />

      <div className="relative flex flex-col items-center">
        <div ref={orbRef} className="mb-6 h-16 w-16 rounded-full border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text-primary)_10%,transparent)] shadow-[0_0_80px_rgba(255,255,255,0.12)] backdrop-blur-md" />

        <div ref={textRef} className="text-sm tracking-[0.3em] font-light uppercase text-[var(--color-text-secondary)] mb-8">
          Initializing Mitra
        </div>
        
        <div className="w-72 h-[1px] bg-[var(--color-border)] relative overflow-hidden rounded-full">
          <div 
            ref={progressRef} 
            className="absolute top-0 left-0 h-full w-full bg-[linear-gradient(90deg,transparent,var(--color-text-primary),transparent)] origin-left scale-x-0"
          ></div>
        </div>
      </div>
    </div>
  )
}
