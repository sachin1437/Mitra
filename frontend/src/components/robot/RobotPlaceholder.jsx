import React from 'react';
import { motion } from 'framer-motion';

export default function RobotPlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none w-full h-full z-0">
      <div className="relative w-[280px] h-[280px] md:w-[400px] md:h-[400px] flex items-center justify-center">
        {/* Core Glow */}
        <div className="absolute inset-0 rounded-full bg-text-primary/5 blur-3xl" />
        
        {/* Outer Ring */}
        <motion.div 
          className="absolute inset-0 rounded-full border border-text-primary/10 border-t-text-primary/40 border-l-[#E8BA35]/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Middle Ring */}
        <motion.div 
          className="absolute inset-6 rounded-full border border-text-primary/5 border-b-[#E8BA35]/50 border-r-text-primary/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner Ring */}
        <motion.div 
          className="absolute inset-12 rounded-full border border-dashed border-text-primary/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center Pulsing Sphere */}
        <motion.div 
          className="w-24 h-24 rounded-full bg-gradient-to-tr from-text-primary/10 to-text-primary/30 blur-md shadow-[0_0_40px_currentColor]"
          style={{ color: 'rgba(var(--color-text-primary), 0.2)' }}
          animate={{ 
            scale: [1, 1.15, 1], 
            opacity: [0.6, 1, 0.6] 
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
