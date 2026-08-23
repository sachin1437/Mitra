import React, { Suspense } from 'react'
import LazySection from '@/lib/performance/LazySection'
import Hero from '@/components/hero/Hero'

// TIER 2 & 3 UI - Lazy load sections
const ProblemSection = React.lazy(() => import('@/components/sections/ProblemSection'))
const AboutSection = React.lazy(() => import('@/components/sections/AboutSection'))
const HowItWorks = React.lazy(() => import('@/components/sections/HowItWorks'))
const FeaturesSection = React.lazy(() => import('@/components/sections/FeaturesSection'))
const ConversationDemo = React.lazy(() => import('@/components/sections/ConversationDemo'))
const PrivacySection = React.lazy(() => import('@/components/sections/PrivacySection'))
const ScrollStack = React.lazy(() => import('@/components/sections/ScrollStack'))
const HumanConversation = React.lazy(() => import('@/components/sections/HumanConversation'))
const TechnologySection = React.lazy(() => import('@/components/sections/TechnologySection'))
const FinalCTA = React.lazy(() => import('@/components/sections/FinalCTA'))

export default function Home() {
  return (
    <main className="w-full grow z-10 relative">
      <Hero />
      <LazySection minHeight="80vh"><ProblemSection /></LazySection>
      <LazySection id="about" minHeight="100vh"><AboutSection /></LazySection>
      <LazySection id="main" minHeight="100vh"><HowItWorks /></LazySection>
      <LazySection minHeight="100vh"><FeaturesSection /></LazySection>
      <LazySection minHeight="100vh"><ConversationDemo /></LazySection>
      <LazySection id="privacy" minHeight="100vh"><PrivacySection /></LazySection>
      <LazySection minHeight="100vh"><ScrollStack /></LazySection>
      <LazySection minHeight="100vh"><HumanConversation /></LazySection>
      <LazySection id="technology" minHeight="100vh"><TechnologySection /></LazySection>
      <LazySection minHeight="60vh"><FinalCTA /></LazySection>
    </main>
  )
}
