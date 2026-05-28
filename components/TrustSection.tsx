import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const BASE = import.meta.env.BASE_URL;

const PROOF_POINTS = [
  { value: '99', suffix: '/100', label: 'Avg Lighthouse score' },
  { value: '3–12', suffix: ' wks', label: 'Delivery timeline' },
  { value: '$0', suffix: '/yr', label: 'Platform fees after launch' },
];

const TrustSection: React.FC = () => {
  const reduced = useReducedMotion() ?? false;

  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>

      {/* ── Full-width CN Tower photographic moment ── */}
      <div style={{ position: 'relative', minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>

        {/* Background: social-post-1.png (Toronto skyline) */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${BASE}social-post-1.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            zIndex: 0,
          }}
        />

        {/* Dark gradient overlay — text reads over image */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(8,10,15,0.45) 0%, rgba(8,10,15,0.65) 50%, rgba(8,10,15,0.96) 100%)',
            zIndex: 1,
          }}
        />

        {/* Content over image */}
        <div
          className="relative mx-auto w-full px-6 md:px-12"
          style={{ maxWidth: '1280px', zIndex: 2, paddingBottom: 'clamp(3rem, 6vw, 6rem)', paddingTop: 'clamp(4rem, 8vw, 8rem)' }}
        >
          {/* Eyebrow */}
          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color: 'var(--ink-2)',
              marginBottom: '1.5rem',
            }}
          >
            05 / Proof
          </motion.p>

          {/* Headline */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: '3rem' }}
          >
            <h2
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(3.5rem, 7vw, 8rem)',
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              Built to scale.
              <br />
              <span style={{ color: 'var(--accent)' }}>Built in Canada.</span>
            </h2>
          </motion.div>

          {/* Proof stats strip */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '2rem' }}
          >
            {PROOF_POINTS.map((pt, i) => (
              <motion.div
                key={pt.label}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: '1rem 0',
                  borderRight: i < PROOF_POINTS.length - 1 ? '1px solid rgba(255,255,255,0.10)' : undefined,
                  paddingRight: i < PROOF_POINTS.length - 1 ? '2rem' : 0,
                  paddingLeft: i > 0 ? '2rem' : 0,
                }}
                className="border-b sm:border-b-0 border-white/10 last:border-b-0"
              >
                <span
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    lineHeight: 1,
                    color: 'var(--accent)',
                    display: 'block',
                  }}
                >
                  {pt.value}
                  <span style={{ fontSize: '0.45em', color: 'var(--ink-3)', letterSpacing: '0.02em' }}>
                    {pt.suffix}
                  </span>
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    color: 'var(--ink-2)',
                    display: 'block',
                    marginTop: '0.5rem',
                  }}
                >
                  {pt.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quote block — below image ── */}
      <div style={{ background: 'var(--bg)' }}>
        <div
          className="mx-auto px-6 md:px-12"
          style={{ maxWidth: '1280px', paddingTop: 'clamp(3rem, 5vw, 5rem)', paddingBottom: 'clamp(3rem, 5vw, 5rem)' }}
        >
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            style={{ borderLeft: '2px solid var(--accent)', paddingLeft: '1.5rem', maxWidth: '42rem' }}
          >
            <p
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                color: 'var(--ink)',
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              "Every system we ship meets enterprise standards for performance,
              security, and scalability. Your data stays yours — permanently."
            </p>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.22em',
                color: 'var(--ink-3)',
                display: 'block',
                marginTop: '1rem',
              }}
            >
              Canada · Remote-first · Data Sovereign
            </span>
          </motion.div>
        </div>
      </div>

    </section>
  );
};

export default TrustSection;
