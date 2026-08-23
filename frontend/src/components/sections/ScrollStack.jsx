import { forwardRef, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import './ScrollStack.css'

gsap.registerPlugin(ScrollTrigger)

export const ScrollStackItem = forwardRef(function ScrollStackItem(
  { children, itemClassName = '' },
  ref
) {
  return (
    <article ref={ref} className={`scroll-stack-card ${itemClassName}`.trim()}>
      {children}
    </article>
  )
})

const slides = [
  {
    src: '/m1.png',
    alt: 'Conversation scene 1',
  },
  {
    src: '/m2.png',
    alt: 'Conversation scene 2',
  },
  {
    src: '/m3.png',
    alt: 'Conversation scene 3',
  },
  {
    src: '/m4.png',
    alt: 'Conversation scene 4',
  },
  {
    src: '/m5.png',
    alt: 'Conversation scene 5',
  },
]

const ScrollStack = ({ className = '' }) => {
  const sectionRef = useRef(null)
  const cardRefs = useRef([])

  useLayoutEffect(() => {
    const scope = sectionRef.current
    if (!scope) return undefined

    const ctx = gsap.context(() => {
      const cards = cardRefs.current.filter(Boolean)

      cards.forEach((card, index) => {
        const frame = card.querySelector('.scroll-expand-frame')
        const media = card.querySelector('.scroll-expand-media')
        const scrim = card.querySelector('.scroll-expand-scrim')

        if (!frame || !media || !scrim) return

        gsap.fromTo(
          card,
          { y: 96, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top 92%',
              end: 'top 54%',
              scrub: 0.12,
              invalidateOnRefresh: true,
            },
          }
        )

        gsap.fromTo(
          frame,
          {
            width: '48%',
            height: '40%',
            borderRadius: '32px',
            boxShadow: '0 36px 100px rgba(0, 0, 0, 0.2)',
          },
          {
            width: '100%',
            height: '100%',
            borderRadius: '0px',
            boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              end: 'bottom 38%',
              scrub: 0.12,
              invalidateOnRefresh: true,
            },
          }
        )

        gsap.fromTo(
          media,
          { scale: 1.72, opacity: 0.62, filter: 'blur(4px) saturate(0.88)' },
          {
            scale: 1,
            opacity: 1,
            filter: 'blur(0px) saturate(1)',
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              end: 'bottom 38%',
              scrub: 0.12,
              invalidateOnRefresh: true,
            },
          }
        )

        gsap.fromTo(
          scrim,
          { opacity: 0.9 },
          {
            opacity: 0.1,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              end: 'bottom 38%',
              scrub: 0.12,
              invalidateOnRefresh: true,
            },
          }
        )

        ScrollTrigger.create({
          trigger: card,
          start: 'top 34%',
          end: 'bottom 26%',
          onEnter: () => card.classList.add('is-active'),
          onEnterBack: () => card.classList.add('is-active'),
          onLeave: () => card.classList.remove('is-active'),
          onLeaveBack: () => card.classList.remove('is-active'),
        })
      })
    }, scope)

    ScrollTrigger.refresh()

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className={`scroll-stack-section ${className}`.trim()}>
      <div className="scroll-stack-wrap mx-auto px-4 sm:px-6 md:px-10" style={{ maxWidth: '1200px' }}>
        <div className="scroll-stack-track">
          {slides.map((slide, index) => (
            <ScrollStackItem
              key={slide.src}
              ref={(el) => { cardRefs.current[index] = el }}
              itemClassName="scroll-expand-item"
            >
              <div className="scroll-expand-stage" style={{ '--stack-index': index }}>
                <div className="scroll-expand-frame">
                  <img
                    className="scroll-expand-media"
                    src={slide.src}
                    alt={slide.alt}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                  <div className="scroll-expand-scrim" />
                </div>
              </div>
            </ScrollStackItem>
          ))}
          <div className="scroll-stack-tail" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}

export default ScrollStack