import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function HeroContent() {
  // Premium animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        delayChildren: 3.2, // Wait for preloader
        staggerChildren: 0.1, // Stagger each line
      }
    }
  }

  const lineVariants = {
    hidden: { y: "100%", opacity: 0, rotateX: 20 },
    show: { 
      y: "0%", 
      opacity: 1, 
      rotateX: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } // Professional expoOut
    }
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col items-start justify-center w-full max-w-4xl relative z-[60]"
    >
      <h1
        className="text-[clamp(2.5rem,7vw,6.5rem)] leading-[1.05] font-medium tracking-tight mb-8 text-text-primary"
        style={{ perspective: '1000px' }}
      >
        <div className="overflow-hidden pb-1 md:pb-2">
          <motion.div variants={lineVariants} className="whitespace-nowrap origin-bottom">A friend who never</motion.div>
        </div>
        <div className="overflow-hidden pb-1 md:pb-2">
          <motion.div variants={lineVariants} className="whitespace-nowrap origin-bottom">forgets to keep <span className="text-amber-600 dark:text-[#E8BA35]">your</span></motion.div>
        </div>
        <div className="overflow-hidden pb-1 md:pb-2">
          <motion.div variants={lineVariants} className="whitespace-nowrap origin-bottom text-amber-600 dark:text-[#E8BA35]">secret.</motion.div>
        </div>
      </h1>

      <motion.div variants={fadeUp} className="max-w-xl mb-12">
        <p className="text-lg md:text-xl lg:text-2xl text-text-secondary leading-relaxed font-light">
          Mitra is an AI companion built for the moments people usually face alone. We're starting with India's college students, and building toward a lot more than a chatbot.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-6 items-start sm:items-center pointer-events-auto">
        <a href="/Mitra-v1.0.2beta.apk" download className="px-8 py-4 bg-[#E8BA35] text-[#121316] font-medium rounded-full hover:scale-105 hover:shadow-xl transition-all duration-300 inline-block text-center shadow-lg pointer-events-auto">
          Download APK
        </a>
        <a href="#main" className="text-sm font-medium tracking-wide text-text-secondary hover:text-amber-600 dark:hover:text-[#E8BA35] transition-colors flex items-center gap-2 group pointer-events-auto">
          See what Mitra does
          <span className="transform group-hover:translate-y-1 transition-transform">↓</span>
        </a>
      </motion.div>
    </motion.div>
  )
}
