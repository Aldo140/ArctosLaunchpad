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
    <section style={{ position: 'relative', background: 'var(--bg)' }}>

      {/* ── Image — standalone full-width visual, no text ── */}
      <div style={{ position: 'relative', height: '75vh', overflow: 'hidden' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${BASE}social-post-1.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%',
          }}
        />
        {/* Fade into bg at bottom */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '45%',
            background: 'linear-gradient(to bottom, transparent, var(--bg))',
          }}
        />
      </div>

      {/* ── Text content — clean dark section below the image ── */}
      <div style={{ background: 'var(--bg)' }}>
        <div
          className="mx-auto px-6 md:px-12"
          style={{ maxWidth: '1280px', paddingTop: 'clamp(1rem, 2vw, 2rem)', paddingBottom: 'clamp(3rem, 6vw, 6rem)' }}
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
              letterSpacing: '0.12em',
              color: 'var(--ink-2)',
              marginBottom: '1.25rem',
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
            style={{ marginBottom: '2.5rem' }}
          >
            <h2 style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(2.75rem, 6vw, 7rem)',
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              color: 'var(--ink)',
              margin: 0,
            }}>
              Built to scale.
              <br />
              <span style={{ color: 'var(--accent)' }}>Built in Canada.</span>
            </h2>
          </motion.div>

          {/* Stats */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3"
            style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', marginBottom: '3rem' }}
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
                  borderRight: i < PROOF_POINTS.length - 1 ? '1px solid var(--border)' : undefined,
                  paddingRight: i < PROOF_POINTS.length - 1 ? '2rem' : 0,
                  paddingLeft: i > 0 ? '2rem' : 0,
                }}
                className="border-b sm:border-b-0 border-[var(--border)] last:border-b-0"
              >
                <span style={{
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  lineHeight: 1,
                  color: 'var(--accent)',
                  display: 'block',
                }}>
                  {pt.value}
                  <span style={{ fontSize: '0.45em', color: 'var(--ink-3)', letterSpacing: '0.02em' }}>
                    {pt.suffix}
                  </span>
                </span>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--ink-2)',
                  display: 'block',
                  marginTop: '0.5rem',
                }}>
                  {pt.label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Quote */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            style={{ borderLeft: '2px solid var(--accent)', paddingLeft: '1.5rem', maxWidth: '42rem' }}
          >
            <p style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
              color: 'var(--ink)',
              lineHeight: 1.55,
              margin: 0,
            }}>
              "Every system we ship meets enterprise standards for performance,
              security, and scalability. Your data stays yours — permanently."
            </p>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--ink-3)',
              display: 'block',
              marginTop: '1rem',
            }}>
              Canada · Remote-first · Data Sovereign
            </span>
          </motion.div>
        </div>
      </div>

    </section>
  );
};

export default TrustSection;
