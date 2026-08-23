import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRobotSection } from '@/hooks/useRobotSection';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const conversation = [
  { sender: 'user', text: "I don't really know why I feel like talking today." },
  { sender: 'mitra', text: "You don't have to know why. I'm here to listen whenever you're ready." },
  { sender: 'user', text: "It's just been one of those weeks where everything feels a bit overwhelming." },
  { sender: 'mitra', text: "Overwhelming weeks can be exhausting. What's been the hardest part?" },
];

export default function ConversationDemo() {
  const containerRef = useRef(null);
  const pinRef = useRef(null);
  const messagesRef = useRef([]);

  const robotRef = useRobotSection({
    id: 'conversation-demo',
    config: {
      position: [-4.5, 0, -1], // Far left
      rotation: [0, 0.4, 0],
      scale: 0.9
    }
  });

  useEffect(() => {
    if (!containerRef.current || !pinRef.current) return;

    const ctx = gsap.context(() => {
      // Pin the section and scrub through the messages
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=200%',
          pin: pinRef.current,
          scrub: 1, // Smooth scrub for Lenis
        }
      });

      // We will reveal each message one by one and move the container up
      messagesRef.current.forEach((msg, i) => {
        if (!msg) return;
        
        // Fade and slide the message in
        tl.fromTo(msg, 
          { opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' },
          { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', ease: 'power2.out', duration: 1 }
        );

        // If it's not the last message, push the whole chat stack up slightly to make room
        if (i < messagesRef.current.length - 1) {
          tl.to('.chat-stack', {
            y: `-=${100}`, // Move up by approx height of a message
            ease: 'power2.inOut',
            duration: 1
          }, "+=0.5"); // Small pause before next message
        }
      });
      
    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={(el) => {
        containerRef.current = el;
        robotRef.current = el;
      }} 
      className="relative w-full bg-bg-primary"
    >
      <div ref={pinRef} className="h-screen w-full flex flex-col items-center justify-center overflow-hidden relative">
        
        {/* Dynamic Background Shader / Aurora Effect */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30 dark:opacity-20">
          <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 blur-[100px] mix-blend-screen animate-pulse duration-[10s]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-[100px] mix-blend-screen animate-pulse duration-[15s]" />
          
          {/* Noise overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
          />
        </div>

        {/* Header */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 text-center w-full px-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="h-6 mb-4"></div>
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-text-primary">
              How it feels.
            </h2>
          </motion.div>
        </div>

        {/* Chat UI Container */}
        <div 
          className="relative z-10 w-full max-w-3xl mx-auto px-6 md:px-12 h-[65vh] flex items-center justify-center overflow-hidden mt-32"
          style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)', maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)' }}
        >
          
          <div className="chat-stack w-full flex flex-col gap-8 md:gap-12 relative z-10 pt-[20vh]">
            {conversation.map((msg, i) => (
              <div 
                key={i} 
                ref={el => messagesRef.current[i] = el}
                className={cn(
                  "flex w-full will-change-transform",
                  msg.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {msg.sender === 'user' ? (
                  /* User Message: Glassmorphic Shader Bubble */
                  <div className="relative max-w-[85%] md:max-w-[75%] p-6 md:p-8 rounded-3xl rounded-br-sm border border-border/50 text-lg md:text-xl font-light leading-relaxed text-text-primary overflow-hidden shadow-2xl backdrop-blur-xl">
                    {/* Inner shader gradient that rotates slowly */}
                    <motion.div 
                      className="absolute inset-[-100%] z-[-1] opacity-30"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      style={{
                        background: 'conic-gradient(from 0deg, transparent 0%, color-mix(in oklch, var(--color-text-primary) 10%, transparent) 25%, transparent 50%, color-mix(in oklch, var(--color-text-primary) 5%, transparent) 75%, transparent 100%)'
                      }}
                    />
                    {/* Glass background fill */}
                    <div className="absolute inset-0 bg-bg-secondary/40 z-[-1] backdrop-blur-md" />
                    
                    <span className="relative z-10">{msg.text}</span>
                  </div>
                ) : (
                  /* Mitra Message: Clean, typograph-focused, no borders */
                  <div className="max-w-[85%] md:max-w-[80%] py-4 text-xl md:text-2xl font-normal leading-relaxed text-text-secondary drop-shadow-sm pl-4 md:pl-8 border-l-2 border-amber-600/30 dark:border-[#E8BA35]/30">
                    <span className="text-text-primary bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary">
                      {msg.text}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
