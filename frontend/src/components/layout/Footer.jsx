import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--color-bg-primary)] border-t border-[var(--color-border)] py-12 px-6 md:px-12 z-10 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="mb-8 md:mb-0">
          <div className="text-xl font-medium tracking-widest uppercase mb-2">
            MITRA <span className="opacity-50">AI</span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            An AI companion for conversations that matter.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 md:gap-16">
          <div className="flex flex-col gap-2">
            <a href="#" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Product</a>
            <a href="#" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">How it works</a>
            <a href="#" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Privacy</a>
          </div>
          <div className="flex flex-col gap-2">
            <a href="#" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Security</a>
            <a href="#" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Terms</a>
            <a href="#" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Contact</a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center text-xs text-[var(--color-text-secondary)]">
        <p>&copy; {new Date().getFullYear()} Mitra AI. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-[var(--color-text-primary)]">X (Twitter)</a>
          <a href="#" className="hover:text-[var(--color-text-primary)]">LinkedIn</a>
        </div>
      </div>
    </footer>
  )
}
