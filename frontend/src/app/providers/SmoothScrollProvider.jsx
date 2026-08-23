import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo ease-out
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    // Global interceptor for all hash links to use Lenis smooth scrolling
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;
      
      const href = target.getAttribute('href');
      if (!href || (!href.startsWith('#') && !href.startsWith('/#'))) return;
      
      // Extract just the #hash part
      const hash = href.startsWith('/#') ? href.substring(1) : href;
      // Skip if it's just a generic "#"
      if (hash === '#') return;
      
      const element = document.querySelector(hash);
      
      if (element) {
        e.preventDefault();
        lenis.scrollTo(element, { offset: -50, duration: 1.2 });
        // Update URL to match
        window.history.pushState(null, '', hash);
      }
    };
    
    document.addEventListener('click', handleAnchorClick);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    
    gsap.ticker.lagSmoothing(0)

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000)
      })
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
