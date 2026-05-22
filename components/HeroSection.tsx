import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { HERO_STATS } from '../lib/siteContent';

interface HeroSectionProps {
  scrollToContact: () => void;
  onViewSystems: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ scrollToContact, onViewSystems }) => {
  return (
    <header className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--surface-0)]">
      {/* Static background: mountains image + gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bakcground-mountains.png"
          alt=""
          aria-hidden
          className="w-full h-full object-cover opacity-[0.18] mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-0)] via-[var(--surface-0)]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--surface-0)] via-transparent to-transparent" />
      </div>

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(rgba(14,165,233,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.035)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_70%_70%_at_60%_40%,#000_30%,transparent_100%)]" />

      {/* Main grid layout */}
      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-6 pt-32 pb-24 grid md:grid-cols-2 gap-12 md:gap-8 items-center">

        {/* LEFT: Text + CTAs */}
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mb-7 inline-flex items-center gap-2.5 self-start rounded-full border border-[var(--glacier)]/30 bg-[var(--surface-2)] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--glacier-glow)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--glacier-glow)] animate-pulse" />
            Enterprise Digital Infrastructure · Canada
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="font-heading text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-[1.02] tracking-tight text-white"
          >
            We build the systems
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--frost)] to-[var(--glacier)] mt-1">
              behind modern businesses.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className="mt-7 max-w-lg text-[15px] leading-relaxed text-slate-400 font-light"
          >
            ARCTOS LAUNCHPAD engineers custom operational platforms, AI workflows, and digital infrastructure for Canadian enterprises. You own everything we build — forever.
          </motion.p>

          {/* CTAs — proper React buttons, no image buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <button
              type="button"
              onClick={scrollToContact}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--glacier)] px-7 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--surface-0)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_32px_rgba(14,165,233,0.45)] active:scale-[0.98]"
            >
              Start Your Infrastructure
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onViewSystems}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-7 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm transition-all duration-200 hover:border-[var(--glacier)]/40 hover:text-[var(--glacier-glow)] active:scale-[0.98]"
            >
              View Our Systems
            </button>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 flex gap-8 border-t border-white/[0.06] pt-8"
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="font-heading text-2xl font-extrabold text-white">{stat.value}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-600 leading-snug max-w-[7rem]">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Logo strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-slate-700 mb-3 font-bold">
              Trusted by elite operations
            </p>
            <img
              src="/logo-strip.png"
              alt="Trusted partners"
              className="h-6 object-contain opacity-40 hover:opacity-70 transition-opacity duration-300"
              loading="eager"
            />
          </motion.div>
        </div>

        {/* RIGHT: Real project screenshot composition */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="relative hidden md:flex items-center justify-center min-h-[480px]"
        >
          {/* Primary screenshot — Starlings desktop */}
          <div className="absolute top-0 right-0 w-[88%] rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_24px_64px_rgba(0,0,0,0.7)] ring-1 ring-white/[0.04]">
            <img
              src="/starlings-landing-desktop.png"
              alt="Starlings — Youth Infrastructure Platform"
              className="w-full h-auto block object-cover"
              loading="eager"
            />
            {/* Label overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-5 py-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--glacier-glow)]">Youth Infrastructure Platform</p>
              <p className="text-white text-sm font-bold mt-0.5">Starlings Support Map</p>
            </div>
          </div>

          {/* Secondary screenshot — Calgary Watch */}
          <motion.div
            className="absolute bottom-0 left-0 w-[52%] rounded-xl overflow-hidden border border-white/[0.1] shadow-[0_16px_48px_rgba(0,0,0,0.8)] ring-1 ring-[var(--glacier)]/10 z-10"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          >
            <img
              src="/calgarywatch-map-desktop.png"
              alt="Calgary Watch — Civic Safety Intelligence System"
              className="w-full h-auto block object-cover"
              loading="eager"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
              <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-[var(--glacier-glow)]">Civic Safety System</p>
              <p className="text-white text-xs font-bold mt-0.5">Calgary Watch</p>
            </div>
          </motion.div>

          {/* Ambient glow behind composition */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-[var(--glacier)]/8 blur-[100px] rounded-full pointer-events-none" />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 hover:opacity-60 transition-opacity cursor-pointer z-20"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[var(--glacier-glow)]">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-[var(--glacier-glow)] to-transparent" />
      </div>
    </header>
  );
};

export default HeroSection;
