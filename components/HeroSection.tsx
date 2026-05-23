import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { HERO_STATS } from '../lib/siteContent';

interface HeroSectionProps {
  scrollToContact: () => void;
  onViewSystems: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ scrollToContact, onViewSystems }) => {
  const prefersReduced = useReducedMotion();

  // Helper: return animation props or empty object if reduced motion
  const a = <T extends object>(props: T): T | object =>
    prefersReduced ? {} : props;

  const headingLines = [
    { text: 'We build the systems', weight: 'font-light', italic: false },
    { text: 'behind modern', weight: 'font-light', italic: false },
    { text: 'businesses.', weight: 'font-normal', italic: true },
  ];

  return (
    <header
      className="relative min-h-screen flex flex-col justify-between overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* ── Dot grid texture ──────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(59, 130, 246, 0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.4,
        }}
      />

      {/* ── Decorative outlined circle ────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-0 w-[600px] h-[600px] rounded-full"
        style={{
          right: '-200px',
          top: '50%',
          transform: 'translateY(-50%)',
          border: '1px solid rgba(59, 130, 246, 0.05)',
        }}
      />

      {/* ── Main content ──────────────────────────────────── */}
      <div className="relative z-10 flex flex-col flex-1 max-w-[1360px] mx-auto w-full px-6 md:px-12 pt-28 pb-16 sm:pt-32">

        {/* Eyebrow */}
        <motion.div
          {...a({
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0 },
          })}
          className="self-start mb-10 sm:mb-12"
        >
          <span
            className="font-mono text-[9px] uppercase tracking-[0.22em] inline-flex items-center gap-2"
            style={{
              color: 'var(--ink-2)',
              border: '1px solid var(--border-2)',
              padding: '0.4rem 0.75rem',
            }}
          >
            <span style={{ color: 'var(--acid)', fontSize: '8px' }}>●</span>
            Enterprise Digital Infrastructure · Canada
          </span>
        </motion.div>

        {/* H1 heading */}
        <h1
          className="leading-[0.92] tracking-[-0.02em]"
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 'clamp(3.2rem, 10vw, 5rem)',
            color: 'var(--ink)',
          }}
        >
          {/* Desktop: larger clamp */}
          <span
            className="hidden sm:block"
            style={{ fontSize: 'clamp(4.5rem, 11vw, 11rem)' }}
          >
            {headingLines.map((line, i) => (
              <span key={line.text} className="block overflow-hidden">
                <motion.span
                  className={`block ${line.weight}`}
                  style={line.italic ? { fontStyle: 'italic' } : {}}
                  {...a({
                    initial: { y: '110%', opacity: 0 },
                    animate: { y: '0%', opacity: 1 },
                    transition: {
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.2 + i * 0.08,
                    },
                  })}
                >
                  {line.text}
                </motion.span>
              </span>
            ))}
          </span>
          {/* Mobile: smaller clamp */}
          <span
            className="sm:hidden block"
            style={{ fontSize: 'clamp(3rem, 10vw, 4.5rem)' }}
          >
            {headingLines.map((line, i) => (
              <span key={line.text} className="block overflow-hidden">
                <motion.span
                  className={`block ${line.weight}`}
                  style={line.italic ? { fontStyle: 'italic' } : {}}
                  {...a({
                    initial: { y: '110%', opacity: 0 },
                    animate: { y: '0%', opacity: 1 },
                    transition: {
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.2 + i * 0.08,
                    },
                  })}
                >
                  {line.text}
                </motion.span>
              </span>
            ))}
          </span>
        </h1>

        {/* Subtext */}
        <motion.p
          {...a({
            initial: { opacity: 0, y: 16 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 },
          })}
          className="mt-8 sm:mt-10 font-light leading-relaxed max-w-md"
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '16px',
            color: 'var(--ink-2)',
          }}
        >
          ARCTOS LAUNCHPAD engineers custom operational platforms, AI workflows, and digital
          infrastructure for Canadian enterprises. You own everything we build — forever.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...a({
            initial: { opacity: 0, y: 16 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 },
          })}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3"
        >
          <button
            type="button"
            onClick={scrollToContact}
            className="inline-flex items-center justify-center gap-2.5 transition-opacity duration-200 hover:opacity-85 active:opacity-70 min-h-[48px]"
            style={{
              background: 'var(--acid)',
              color: '#09090A',
              padding: '1rem 1.75rem',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}
          >
            Engineer Your Future
            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
          </button>

          <button
            type="button"
            onClick={onViewSystems}
            className="inline-flex items-center justify-center gap-2 transition-colors duration-200 min-h-[48px] group"
            style={{
              border: '1px solid var(--border-2)',
              color: 'var(--ink)',
              padding: '1rem 1.75rem',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = 'var(--ink)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = 'var(--border-2)')
            }
          >
            View Systems
          </button>
        </motion.div>

      </div>

      {/* ── Stats strip — pinned to bottom ────────────────── */}
      <div className="relative z-10 max-w-[1360px] mx-auto w-full px-6 md:px-12 pb-12">
        <motion.div
          {...a({
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.6 },
          })}
        >
          {/* Divider */}
          <div
            className="w-full mb-8"
            style={{ height: '1px', background: 'var(--border)' }}
          />

          {/* Stats row */}
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <div
                  className="font-semibold leading-none"
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontWeight: 600,
                    fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                    color: 'var(--acid)',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  className="mt-1.5 font-mono uppercase tracking-widest"
                  style={{ fontSize: '10px', color: 'var(--ink-2)' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Scroll indicator ──────────────────────────────── */}
      <div
        aria-hidden
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-20"
        style={{ opacity: 0.45 }}
      >
        <span
          className="font-mono uppercase tracking-widest"
          style={{ fontSize: '8px', color: 'var(--ink-2)' }}
        >
          Scroll
        </span>
        <motion.div
          className="w-px"
          style={{
            height: '40px',
            background: 'linear-gradient(to bottom, var(--ink-2), transparent)',
          }}
          {...a({
            animate: { y: [0, 8, 0] },
            transition: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' },
          })}
        />
      </div>

    </header>
  );
};

export default HeroSection;
