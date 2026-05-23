import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const PROOF_POINTS = [
  { value: '99', suffix: '/100', label: 'Avg Lighthouse score' },
  { value: '3–12', suffix: ' wks', label: 'Delivery timeline' },
  { value: '$0', suffix: '/yr', label: 'Platform fees after launch' },
];

const TrustSection: React.FC = () => {
  const reduced = useReducedMotion() ?? false;

  return (
    <section style={{ background: 'var(--bg)' }} className="relative overflow-hidden">

      {/* Top rule */}
      <div className="w-full h-px" style={{ background: 'var(--border)' }} />

      <div className="mx-auto px-6 md:px-12 py-24 md:py-36" style={{ maxWidth: '1280px' }}>

        {/* ── Eyebrow ── */}
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-mono uppercase tracking-widest mb-8"
          style={{ fontSize: '10px', color: 'var(--ink-2)', letterSpacing: '0.22em' }}
        >
          05 / Proof
        </motion.p>

        {/* ── Large editorial statement ── */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 md:mb-24"
        >
          <h2
            className="font-heading font-light leading-none"
            style={{
              fontSize: 'clamp(3rem, 6.5vw, 7.5rem)',
              letterSpacing: '-0.03em',
              color: 'var(--ink)',
            }}
          >
            Canadian-built.
            <br />
            <em
              className="font-normal"
              style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}
            >
              Enterprise-proven.
            </em>
          </h2>
        </motion.div>

        {/* ── Proof points — 3-column divided strip ── */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 mb-20"
          style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
        >
          {PROOF_POINTS.map((pt, i) => (
            <motion.div
              key={pt.label}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative py-10 px-8 md:px-10 flex flex-col gap-3"
              style={{
                borderRight: i < PROOF_POINTS.length - 1 ? '1px solid var(--border)' : undefined,
                borderBottom: i < PROOF_POINTS.length - 1 ? undefined : undefined,
              }}
            >
              {/* Mobile divider */}
              {i > 0 && (
                <div
                  className="md:hidden absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'var(--border)' }}
                />
              )}
              <span
                className="font-heading font-semibold leading-none"
                style={{ fontSize: 'clamp(3.5rem, 6vw, 5.5rem)', color: 'var(--acid)' }}
              >
                {pt.value}
                <span style={{ fontSize: '0.45em', color: 'var(--ink-3)', letterSpacing: '0.02em' }}>
                  {pt.suffix}
                </span>
              </span>
              <span
                className="font-mono uppercase tracking-widest"
                style={{ fontSize: '10px', color: 'var(--ink-2)', letterSpacing: '0.2em' }}
              >
                {pt.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* ── Quote block ── */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="flex flex-col gap-5 max-w-2xl"
          style={{ borderLeft: '2px solid var(--acid)', paddingLeft: '1.5rem' }}
        >
          <p
            className="font-heading italic font-normal leading-relaxed"
            style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: 'var(--ink)' }}
          >
            "Every system we ship meets enterprise standards for performance,
            security, and scalability. Your data stays yours — permanently."
          </p>
          <span
            className="font-mono uppercase tracking-widest"
            style={{ fontSize: '9px', color: 'var(--ink-3)', letterSpacing: '0.22em' }}
          >
            Canada · Remote-first · Data Sovereign
          </span>
        </motion.div>

      </div>

      {/* Bottom rule */}
      <div className="w-full h-px" style={{ background: 'var(--border)' }} />
    </section>
  );
};

export default TrustSection;
