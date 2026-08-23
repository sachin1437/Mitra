import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Cursor() {
  const cursorRef = useRef(null)

  useEffect(() => {
    // Only enable on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    const cursor = cursorRef.current
    if (!cursor) return

    const onMouseMove = (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: 'power2.out',
      })
    }

    const onMouseDown = () => {
      gsap.to(cursor, {
        scale: 0.8,
        duration: 0.15,
      })
    }

    const onMouseUp = () => {
      gsap.to(cursor, {
        scale: 1,
        duration: 0.15,
      })
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    // Handle interactive elements
    const interactiveSelectors = 'a, button, [role="button"], input, select, textarea'

    const onHoverEnter = () => {
      gsap.to(cursor, {
        scale: 1.5,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(2px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        duration: 0.2,
      })
    }

    const onHoverLeave = () => {
      gsap.to(cursor, {
        scale: 1,
        backgroundColor: 'rgba(255, 255, 255, 1)',
        backdropFilter: 'none',
        border: 'none',
        duration: 0.2,
      })
    }

    const addListeners = () => {
      document.querySelectorAll(interactiveSelectors).forEach((el) => {
        el.addEventListener('mouseenter', onHoverEnter)
        el.addEventListener('mouseleave', onHoverLeave)
      })
    }

    // Since we're in a React app with dynamic content, we can use MutationObserver
    // or just add listeners on mount. For simplicity here, we add on mount.
    // In a real robust app, you might use a React context to register interactables.
    addListeners()

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      document.querySelectorAll(interactiveSelectors).forEach((el) => {
        el.removeEventListener('mouseenter', onHoverEnter)
        el.removeEventListener('mouseleave', onHoverLeave)
      })
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
      style={{ transform: 'translate(-50%, -50%)' }}
    />
  )
}
