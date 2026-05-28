import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { HERO_STATS } from '../lib/siteContent';

const BASE = import.meta.env.BASE_URL;

interface HeroSectionProps {
  scrollToContact: () => void;
  onViewSystems: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ scrollToContact, onViewSystems }) => {
  const prefersReduced = useReducedMotion();

  const a = <T extends object>(props: T): T | object =>
    prefersReduced ? {} : props;

  const lines = ['Less chaos.', 'Better systems.'];

  return (
    <header
      className="relative h-svh flex flex-col justify-between"
      style={{ background: 'var(--bg)', overflow: 'visible', position: 'relative', zIndex: 10 }}
    >
      {/* Mountain background — 7% opacity texture */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${BASE}bakcground-mountains.webp)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.07,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Bear mascot — bold, bottom-right, mix-blend removes white bg */}
      <img
        src={`${BASE}website-landing.png`}
        alt=""
        aria-hidden
        className="hidden sm:block"
        style={{
          position: 'absolute',
          right: 0,
          top: '8vh',
          height: '145vh',
          width: 'auto',
          zIndex: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />

      {/* Main content */}
      <div
        className="relative flex flex-col flex-1 max-w-[1360px] mx-auto w-full px-6 md:px-12 pt-24 pb-12 sm:pt-28"
        style={{ zIndex: 10 }}
      >
        {/* Eyebrow */}
        <motion.div
          {...a({
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0 },
          })}
          className="self-start mb-5"
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--ink-2)',
              border: '1px solid var(--border-2)',
              padding: '0.4rem 0.75rem',
            }}
          >
            <span style={{ color: 'var(--accent)', fontSize: '8px' }}>●</span>
            Enterprise Digital Infrastructure · Canada
          </span>
        </motion.div>

        {/* H1 — desktop */}
        <h1 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 800, lineHeight: 0.92, letterSpacing: '-0.03em', margin: 0 }}>
          <span className="hidden sm:block" style={{ fontSize: 'clamp(3.25rem, 6.5vw, 7.5rem)' }}>
            {lines.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block"
                  style={{ color: i === 1 ? 'var(--accent)' : 'var(--ink)' }}
                  {...a({
                    initial: { y: '110%', opacity: 0 },
                    animate: { y: '0%', opacity: 1 },
                    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.08 },
                  })}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </span>
          {/* H1 — mobile */}
          <span className="sm:hidden block" style={{ fontSize: 'clamp(3rem, 10vw, 4.5rem)' }}>
            {lines.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block"
                  style={{ color: i === 1 ? 'var(--accent)' : 'var(--ink)' }}
                  {...a({
                    initial: { y: '110%', opacity: 0 },
                    animate: { y: '0%', opacity: 1 },
                    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.08 },
                  })}
                >
                  {line}
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
          style={{
            marginTop: '1.25rem',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '15px',
            fontWeight: 400,
            lineHeight: 1.65,
            color: 'var(--ink-2)',
            maxWidth: '26rem',
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
          style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
        >
          <button
            type="button"
            onClick={scrollToContact}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--accent)',
              color: '#fff',
              padding: '1rem 1.75rem',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              opacity: 1,
              minHeight: '48px',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Engineer Your Future
            <ArrowRight style={{ width: '14px', height: '14px', flexShrink: 0 }} />
          </button>

          <button
            type="button"
            onClick={onViewSystems}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'transparent',
              color: 'var(--ink)',
              padding: '1rem 1.75rem',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              border: '1px solid var(--border-2)',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              minHeight: '48px',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--ink)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
          >
            View Systems
          </button>
        </motion.div>
      </div>

      {/* Stats strip */}
      <div className="relative max-w-[1360px] mx-auto w-full px-6 md:px-12 pb-12" style={{ zIndex: 10 }}>
        <motion.div
          {...a({
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.6 },
          })}
        >
          <div style={{ height: '1px', background: 'var(--border)', marginBottom: '2rem' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
            {HERO_STATS.map(stat => (
              <div key={stat.label}>
                <div style={{
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                  lineHeight: 1,
                  color: 'var(--accent)',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: 'var(--ink-2)',
                  marginTop: '0.4rem',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          pointerEvents: 'none',
          zIndex: 20,
          opacity: 0.45,
        }}
      >
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--ink-2)' }}>
          Scroll
        </span>
        <motion.div
          style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, var(--ink-2), transparent)' }}
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
