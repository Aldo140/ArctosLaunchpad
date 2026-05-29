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


      {/* Bear — mobile: absolute background, text sits on top */}
      <img
        src={`${BASE}website-landing.png`}
        alt="" aria-hidden
        className="block sm:hidden"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          height: '72vh',
          width: 'auto',
          zIndex: 2,
          pointerEvents: 'none',
          userSelect: 'none',
          maskImage: 'linear-gradient(to bottom, black 42%, transparent 80%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 42%, transparent 80%)',
        }}
      />

      {/* Bear mascot — desktop */}
      <img
        src={`${BASE}website-landing.png`}
        alt=""
        aria-hidden
        className="hidden sm:block"
        style={{
          position: 'absolute',
          right: '-5vw',
          top: '-10vh',
          height: '160vh',
          width: 'auto',
          maskImage: 'linear-gradient(to bottom, black 30%, transparent 65%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 65%)',
          zIndex: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />

      {/* Main content */}
      <div
        className="relative flex flex-col flex-1 max-w-[1360px] mx-auto w-full px-6 md:px-12 pt-16 pb-0 sm:pt-28 sm:pb-12"
        style={{ zIndex: 10 }}
      >
        {/* Eyebrow — desktop */}
        <motion.div
          {...a({
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0 },
          })}
          className="self-start mb-5 hidden sm:flex"
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

        {/* Eyebrow — mobile: centered pill */}
        <motion.div
          {...a({
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0 },
          })}
          className="flex sm:hidden mb-3"
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '7.5px',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--ink-2)',
              border: '1px solid rgba(37,99,255,0.35)',
              background: 'rgba(37,99,255,0.07)',
              padding: '0.3rem 0.65rem',
              borderRadius: '999px',
            }}
          >
            <span style={{ color: 'var(--accent)', fontSize: '7px' }}>●</span>
            Canada · Digital Infrastructure
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
          <span className="sm:hidden block" style={{ fontSize: 'clamp(2.75rem, 10vw, 3.5rem)' }}>
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

        {/* Subtext — desktop */}
        <motion.p
          {...a({
            initial: { opacity: 0, y: 16 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 },
          })}
          className="hidden sm:block"
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

        {/* Subtext — mobile */}
        <motion.p
          {...a({
            initial: { opacity: 0, y: 16 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 },
          })}
          className="block sm:hidden"
          style={{
            marginTop: '0.65rem',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '13.5px',
            fontWeight: 400,
            lineHeight: 1.55,
            color: 'var(--ink-2)',
            maxWidth: '22rem',
          }}
        >
          Custom platforms, AI workflows, and digital infrastructure for Canadian enterprises. You own everything — forever.
        </motion.p>

        {/* CTAs — desktop */}
        <motion.div
          {...a({
            initial: { opacity: 0, y: 16 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 },
          })}
          className="hidden sm:flex"
          style={{ marginTop: '1.5rem', gap: '0.75rem', flexWrap: 'wrap' }}
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

        {/* CTAs — mobile: stacked, full-width */}
        <motion.div
          {...a({
            initial: { opacity: 0, y: 16 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 },
          })}
          className="flex sm:hidden flex-col"
          style={{ marginTop: '1rem', gap: '0.5rem' }}
        >
          <button
            type="button"
            onClick={scrollToContact}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: 'var(--accent)',
              color: '#fff',
              width: '100%',
              padding: '0 1.5rem',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              opacity: 1,
              minHeight: '52px',
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              color: 'var(--ink)',
              width: '100%',
              padding: '0 1.5rem',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              border: '1px solid var(--border-2)',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              minHeight: '52px',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--ink)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
          >
            View Systems
          </button>

        </motion.div>

      </div>

      {/* Stats strip — desktop */}
      <div className="hidden sm:block relative max-w-[1360px] mx-auto w-full px-6 md:px-12 pb-12" style={{ zIndex: 10 }}>
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

      {/* Stats strip — mobile: 3-across compact pill cards */}
      <div className="block sm:hidden relative w-full px-6 pb-8" style={{ zIndex: 10 }}>
        <motion.div
          {...a({
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.6 },
          })}
        >
          <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {HERO_STATS.map(stat => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.625rem 0.5rem',
                  background: 'rgba(37,99,255,0.06)',
                  border: '1px solid rgba(37,99,255,0.18)',
                  borderRadius: '8px',
                }}
              >
                <div style={{
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(1.4rem, 6vw, 1.75rem)',
                  lineHeight: 1,
                  color: 'var(--accent)',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '7px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: 'var(--ink-2)',
                  textAlign: 'center',
                  lineHeight: 1.3,
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
