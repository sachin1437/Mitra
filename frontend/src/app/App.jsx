import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SmoothScrollProvider from './providers/SmoothScrollProvider'
import { ThemeProvider } from "./providers/ThemeProvider"
import StaggeredMenu from '@/components/ui/StaggeredMenu'
import LazySection from '@/lib/performance/LazySection'

const menuItems = [
  { label: 'About', ariaLabel: 'Learn about us', link: '/#about' },
  { label: 'Privacy', ariaLabel: 'View our privacy policy', link: '/#privacy' },
  { label: 'How it works', ariaLabel: 'Understand how it works', link: '/#main' },
  { label: 'Technology', ariaLabel: 'Explore our technology', link: '/#technology' }
];

const socialItems = [
  { label: 'Twitter', link: 'https://twitter.com' },
  { label: 'GitHub', link: 'https://github.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' }
];

import { CinematicFooter } from '@/components/ui/motion-footer'
import Preloader from '@/components/preloader/Preloader'
import SmoothCursor from '@/components/cursor/SmoothCursor'

// TIER 1 UI - Load Immediately
import Hero from '@/components/hero/Hero'
import GlobalRobot3D from '@/components/robot/GlobalRobot3D'

import Home from '@/components/pages/Home'
import PrivacyPage from '@/components/pages/PrivacyPage'
import TermsPage from '@/components/pages/TermsPage'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // If the URL has no hash, scroll to top on route change.
    // If it has a hash, we let the interceptor handle it or native jump.
    if (!pathname.includes('#')) {
      window.scrollTo(0, 0)
    }
    // Force GSAP ScrollTrigger to recalculate heights when route changes
    setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh()
      }
    }, 100)
  }, [pathname])

  return null
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SmoothScrollProvider>
        <SmoothCursor />
        <Router>
          <Preloader />

          <div className="relative w-full flex flex-col bg-bg-primary">
            <GlobalRobot3D />
            <StaggeredMenu
              position="right"
              items={menuItems}
              socialItems={[]}
              displaySocials={false}
              displayItemNumbering={true}
              menuButtonColor="var(--color-text-primary)"
              openMenuButtonColor="var(--color-text-primary)"
              changeMenuColorOnOpen={true}
              colors={['#B497CF', '#5227FF']}
              logoUrl="/logos/mitra-ai-mark.svg"
              accentColor="#5227FF"
              onMenuOpen={() => console.log('Menu opened')}
              onMenuClose={() => console.log('Menu closed')}
            />

            <ScrollToTop />
            <main className="w-full grow z-10 relative bg-bg-primary">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
              </Routes>
            </main>

            <CinematicFooter />
          </div>
        </Router>
      </SmoothScrollProvider>
    </ThemeProvider>
  )
}

export default App
