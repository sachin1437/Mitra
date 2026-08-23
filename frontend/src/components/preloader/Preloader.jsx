import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Preloader() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Determine loading time. (In a real app, this waits for assets/models)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2400)
    return () => clearTimeout(timer)
  }, [])

  // Premium easing curve (Expo out/inOut style)
  const ease = [0.76, 0, 0.24, 1]

  const textVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease, staggerChildren: 0.1 } 
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { duration: 0.5, ease } 
    }
  }

  const letterVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease } }
  }

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          initial={{ y: 0 }}
          exit={{ 
            y: '-100%', 
            transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.3 } 
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a] text-white overflow-hidden"
        >
          {/* Subtle glowing background orb */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0 m-auto w-64 h-64 rounded-full bg-amber-500/10 blur-[100px]"
          />

          <motion.div 
            variants={textVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative flex flex-col items-center z-10"
          >
            {/* Logo Text Stagger */}
            <div className="flex overflow-hidden mb-8">
              {['M', 'I', 'T', 'R', 'A'].map((letter, i) => (
                <motion.span 
                  key={i} 
                  variants={letterVariants}
                  className="text-4xl md:text-6xl font-medium tracking-[0.2em] font-geist"
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Status Text */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-xs md:text-sm tracking-[0.4em] uppercase text-gray-400 font-light mb-8"
            >
              System Initializing
            </motion.div>

            {/* Premium Progress Bar */}
            <div className="w-64 md:w-80 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 1.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
                className="w-full h-full bg-gradient-to-r from-amber-500/20 via-amber-400 to-amber-500/20"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
