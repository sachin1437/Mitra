import { createContext, useContext, useEffect, useMemo, useState } from "react"

const ThemeProviderContext = createContext()

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  )
  const [resolvedTheme, setResolvedTheme] = useState("light")
  const [transitionTimer, setTransitionTimer] = useState(null)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)")
      const systemTheme = media.matches ? "dark" : "light"
      setResolvedTheme(systemTheme)
      root.classList.add(systemTheme)
      root.style.colorScheme = systemTheme

      const handleChange = (event) => {
        const nextTheme = event.matches ? "dark" : "light"
        setResolvedTheme(nextTheme)
        root.classList.remove("light", "dark")
        root.classList.add(nextTheme)
        root.style.colorScheme = nextTheme
      }

      media.addEventListener("change", handleChange)

      return () => {
        media.removeEventListener("change", handleChange)
        root.style.colorScheme = ""
      }
    }

    setResolvedTheme(theme)
    root.classList.add(theme)
    root.style.colorScheme = theme

    return () => {
      root.style.colorScheme = ""
    }
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (nextTheme) => {
        const root = window.document.documentElement
        root.classList.add("theme-switching")
        if (transitionTimer) {
          window.clearTimeout(transitionTimer)
        }
        setTransitionTimer(
          window.setTimeout(() => {
            root.classList.remove("theme-switching")
          }, 500)
        )
        localStorage.setItem(storageKey, nextTheme)
        setTheme(nextTheme)
      },
    }),
    [resolvedTheme, storageKey, theme, transitionTimer]
  )

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
