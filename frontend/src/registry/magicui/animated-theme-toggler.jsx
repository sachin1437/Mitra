import { useCallback, useRef } from 'react'
import { Moon, Sun } from 'lucide-react'
import { flushSync } from 'react-dom'

import { useTheme } from '@/app/providers/ThemeProvider'
import { cn } from '@/lib/utils'

export const TransitionVariant = {
  circle: 'circle',
  square: 'square',
  triangle: 'triangle',
  diamond: 'diamond',
  hexagon: 'hexagon',
  rectangle: 'rectangle',
  star: 'star',
}

function polygonCollapsed(point, vertexCount) {
  return `polygon(${Array.from({ length: vertexCount }, () => point).join(', ')})`
}

function point(x, y, viewportWidth, viewportHeight) {
  return `${(x / viewportWidth) * 100}% ${(y / viewportHeight) * 100}%`
}

function getThemeTransitionClipPaths(variant, cx, cy, maxRadius, viewportWidth, viewportHeight) {
  const toRadius = (r) => `${(r / (Math.hypot(viewportWidth, viewportHeight) / Math.SQRT2)) * 100}%`

  switch (variant) {
    case 'square': {
      const halfW = Math.max(cx, viewportWidth - cx)
      const halfH = Math.max(cy, viewportHeight - cy)
      const halfSide = Math.max(halfW, halfH) * 1.05
      const end = [
        point(cx - halfSide, cy - halfSide, viewportWidth, viewportHeight),
        point(cx + halfSide, cy - halfSide, viewportWidth, viewportHeight),
        point(cx + halfSide, cy + halfSide, viewportWidth, viewportHeight),
        point(cx - halfSide, cy + halfSide, viewportWidth, viewportHeight),
      ].join(', ')
      return [polygonCollapsed(point(cx, cy, viewportWidth, viewportHeight), 4), `polygon(${end})`]
    }
    case 'triangle': {
      const scale = maxRadius * 2.2
      const dx = (Math.sqrt(3) / 2) * scale
      const verts = [
        point(cx, cy - scale, viewportWidth, viewportHeight),
        point(cx + dx, cy + 0.5 * scale, viewportWidth, viewportHeight),
        point(cx - dx, cy + 0.5 * scale, viewportWidth, viewportHeight),
      ].join(', ')
      return [polygonCollapsed(point(cx, cy, viewportWidth, viewportHeight), 3), `polygon(${verts})`]
    }
    case 'diamond': {
      const R = maxRadius * Math.SQRT2
      const end = [
        point(cx, cy - R, viewportWidth, viewportHeight),
        point(cx + R, cy, viewportWidth, viewportHeight),
        point(cx, cy + R, viewportWidth, viewportHeight),
        point(cx - R, cy, viewportWidth, viewportHeight),
      ].join(', ')
      return [polygonCollapsed(point(cx, cy, viewportWidth, viewportHeight), 4), `polygon(${end})`]
    }
    case 'hexagon': {
      const R = maxRadius * Math.SQRT2
      const verts = []
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 3
        verts.push(point(cx + R * Math.cos(a), cy + R * Math.sin(a), viewportWidth, viewportHeight))
      }
      return [polygonCollapsed(point(cx, cy, viewportWidth, viewportHeight), 6), `polygon(${verts.join(', ')})`]
    }
    case 'rectangle': {
      const halfW = Math.max(cx, viewportWidth - cx)
      const halfH = Math.max(cy, viewportHeight - cy)
      const halfSide = Math.max(halfW, halfH) * 1.05
      const end = [
        point(cx - halfSide, cy - halfH, viewportWidth, viewportHeight),
        point(cx + halfSide, cy - halfH, viewportWidth, viewportHeight),
        point(cx + halfSide, cy + halfH, viewportWidth, viewportHeight),
        point(cx - halfSide, cy + halfH, viewportWidth, viewportHeight),
      ].join(', ')
      return [polygonCollapsed(point(cx, cy, viewportWidth, viewportHeight), 4), `polygon(${end})`]
    }
    case 'star': {
      const R = maxRadius * Math.SQRT2 * 1.03
      const innerRatio = 0.42
      const verts = []
      for (let i = 0; i < 5; i++) {
        const outerA = -Math.PI / 2 + (i * 2 * Math.PI) / 5
        verts.push(point(cx + R * Math.cos(outerA), cy + R * Math.sin(outerA), viewportWidth, viewportHeight))
        const innerA = outerA + Math.PI / 5
        verts.push(point(cx + R * innerRatio * Math.cos(innerA), cy + R * innerRatio * Math.sin(innerA), viewportWidth, viewportHeight))
      }
      const startR = Math.max(2, R * 0.025)
      const starPolygon = (radius) => {
        const points = []
        for (let i = 0; i < 5; i++) {
          const outerA = -Math.PI / 2 + (i * 2 * Math.PI) / 5
          points.push(point(cx + radius * Math.cos(outerA), cy + radius * Math.sin(outerA), viewportWidth, viewportHeight))
          const innerA = outerA + Math.PI / 5
          points.push(point(cx + radius * innerRatio * Math.cos(innerA), cy + radius * innerRatio * Math.sin(innerA), viewportWidth, viewportHeight))
        }
        return `polygon(${points.join(', ')})`
      }
      return [starPolygon(startR), starPolygon(R)]
    }
    case 'circle':
    default:
      return [
        `circle(0% at ${point(cx, cy, viewportWidth, viewportHeight)})`,
        `circle(${toRadius(maxRadius)} at ${point(cx, cy, viewportWidth, viewportHeight)})`,
      ]
  }
}

export function AnimatedThemeToggler({
  className,
  duration = 400,
  variant,
  fromCenter = false,
  theme,
  onThemeChange,
  ...props
}) {
  const shape = variant ?? 'circle'
  const themeContext = useTheme()
  const currentTheme = theme ?? (themeContext.theme === 'system' ? themeContext.resolvedTheme : themeContext.theme)
  const isDark = currentTheme === 'dark'
  const buttonRef = useRef(null)
  const isTransitioningRef = useRef(false)
  const applyTheme = useCallback((nextTheme) => {
    if (theme !== undefined) {
      onThemeChange?.(nextTheme)
      return
    }

    themeContext.setTheme(nextTheme)
  }, [onThemeChange, theme, themeContext])

  const toggleTheme = useCallback(() => {
    const button = buttonRef.current
    if (!button || isTransitioningRef.current || document.documentElement.dataset.magicuiThemeVt === 'active') {
      return
    }

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let x
    let y

    if (fromCenter) {
      x = viewportWidth / 2
      y = viewportHeight / 2
    } else {
      const { top, left, width, height } = button.getBoundingClientRect()
      x = left + width / 2
      y = top + height / 2
    }

    const maxRadius = Math.hypot(Math.max(x, viewportWidth - x), Math.max(y, viewportHeight - y))
    const clipPath = getThemeTransitionClipPaths(shape, x, y, maxRadius, viewportWidth, viewportHeight)

    const root = document.documentElement
    const nextTheme = isDark ? 'light' : 'dark'

    if (typeof document.startViewTransition !== 'function') {
      applyTheme(nextTheme)
      return
    }

    root.dataset.magicuiThemeVt = 'active'
    root.style.setProperty('--magicui-theme-toggle-vt-duration', `${duration}ms`)
    root.style.setProperty('--magicui-theme-vt-clip-from', clipPath[0])

    const cleanup = () => {
      isTransitioningRef.current = false
      delete root.dataset.magicuiThemeVt
      root.style.removeProperty('--magicui-theme-toggle-vt-duration')
      root.style.removeProperty('--magicui-theme-vt-clip-from')
    }

    isTransitioningRef.current = true
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        applyTheme(nextTheme)
      })
    })

    if (typeof transition?.finished?.finally === 'function') {
      transition.finished.finally(cleanup).catch(() => {})
    } else {
      cleanup()
    }

    const ready = transition?.ready
    if (ready && typeof ready.then === 'function') {
      ready
        .then(() => {
          document.documentElement.animate(
            { clipPath },
            {
              duration: 550, // Slightly longer duration but with an aggressive ease-out
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // extremely snappy start (expo-out)
              fill: 'forwards',
              pseudoElement: '::view-transition-new(root)',
            }
          )
        })
        .catch(() => {})
    }
  }, [applyTheme, duration, fromCenter, isDark, shape])

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(className)}
      {...props}
    >
      {isDark ? <Sun /> : <Moon />}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

export default AnimatedThemeToggler