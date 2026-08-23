import React from 'react'
import HeroContent from './HeroContent'
import { useTheme } from '@/app/providers/ThemeProvider'
import { useRobotSection } from '@/hooks/useRobotSection'

export default function Hero() {
  const containerRef = useRobotSection({
    id: 'hero',
    config: {
      position: [6.0, 1, 0], // Moved further right and down for the larger size
      rotation: [0.1, -0.2, 0],
      scale: 1.5, // Original sane scale
      mobileConfig: {
        position: [0, 1.8, 0], // Top center, pushed down a bit
        scale: 1.8, // Much larger on mobile compared to generic fallback
        rotation: [0, 0, 0] // Look straight ahead
      }
    }
  });
  const { theme, resolvedTheme } = useTheme()
  const activeTheme = theme === 'system' ? resolvedTheme : theme
  const isDark = activeTheme === 'dark'

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[100vh] lg:h-[100vh] flex items-center justify-center overflow-hidden bg-bg-primary pt-24 pb-0 lg:py-0"
    >
      <div className="w-full max-w-[90rem] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full relative z-10">
        {/* Left Column: Text Content */}
        <div className="order-2 lg:order-1 lg:col-span-7 xl:col-span-8 flex flex-col justify-center h-full pb-12 lg:pb-0 pr-4 relative z-[60]">
          <HeroContent />
        </div>

        {/* Right Column: 3D Robot Experience (Now Handled Globally) */}
        <div className="order-1 lg:order-2 lg:col-span-5 xl:col-span-4 relative w-full h-[40vh] min-h-[300px] lg:h-[85vh] lg:min-h-[auto] flex items-center justify-center">
          {/* Empty spacer since robot is global */}
        </div>
      </div>
    </section>
  )
}
