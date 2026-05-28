import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const STEPS = [
  {
    num: '01',
    title: 'Discovery Sprint',
    body: 'Architecture review, user flow mapping, and clear success criteria. Documented before a single line of code.',
  },
  {
    num: '02',
    title: 'System Design',
    body: 'Component architecture, data flows, integration specs, and full written scope with fixed milestones.',
  },
  {
    num: '03',
    title: 'Build & Integrate',
    body: 'Staged delivery with weekly reviews, performance testing, security hardening, and full client visibility.',
  },
  {
    num: '04',
    title: 'Launch & Handoff',
    body: 'Production deployment, full documentation, team training, and complete source code transfer.',
  },
] as const;

const WorkflowSection: React.FC = () => {
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      style={{ background: 'var(--bg-1)' }}
      className="py-20 md:py-32 lg:py-40 overflow-hidden"
    >
      {/* Full-width rule above header area */}
      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* Header */}
      <div className="max-w-[1320px] mx-auto px-6 md:px-12">
        <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
          className="py-10 md:py-14"
        >
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Eyebrow */}
            <p
              className="mb-5"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '10px',
                fontWeight: 400,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--ink-2)',
              }}
            >
              THE PROCESS
            </p>

            {/* Heading — mobile */}
            <h2
              className="md:hidden"
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: 'clamp(2rem, 8vw, 2.75rem)',
                fontWeight: 400,
                lineHeight: 1.0,
                letterSpacing: '-0.03em',
                color: 'var(--ink)',
              }}
            >
              How we engineer
              <br />
              <em style={{ fontStyle: 'italic' }}>your system.</em>
            </h2>

            {/* Heading — desktop */}
            <h2
              className="hidden md:block"
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: 'clamp(3rem, 5vw, 5rem)',
                fontWeight: 400,
                lineHeight: 1.0,
                letterSpacing: '-0.03em',
                color: 'var(--ink)',
              }}
            >
              How we engineer
              <br />
              <em style={{ fontStyle: 'italic' }}>your system.</em>
            </h2>
          </motion.div>
        </div>
      </div>

      {/* ─── DESKTOP: 4-column horizontal timeline ─── */}
      <div className="hidden md:block max-w-[1320px] mx-auto px-6 md:px-12 mt-0 relative">
        {/* Connecting progress line — full-width, behind columns */}
        <div className="relative">
          <motion.div
            initial={reduced ? false : { scaleX: 0 }}
            whileInView={reduced ? undefined : { scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: '4.9rem',
              left: 0,
              right: 0,
              height: '1px',
              background: 'var(--border-2)',
              transformOrigin: 'left center',
              zIndex: 0,
            }}
          />

          {/* 4-column grid */}
          <div
            style={{ borderTop: '1px solid var(--border)' }}
            className="grid grid-cols-4 relative"
          >
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={reduced ? false : { opacity: 0, y: 28 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  borderRight: i < STEPS.length - 1 ? '1px solid var(--border)' : undefined,
                  position: 'relative',
                }}
                className="px-8 py-10 flex flex-col"
              >
                {/* Large step number */}
                <span
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontSize: '5rem',
                    fontWeight: 300,
                    lineHeight: 1,
                    color: 'var(--ink-3)',
                    display: 'block',
                    marginBottom: '0.75rem',
                    userSelect: 'none',
                  }}
                >
                  {step.num}
                </span>

                {/* Acid draw-in line */}
                <div style={{ position: 'relative', height: '2px', marginBottom: '1.25rem' }}>
                  <motion.div
                    initial={reduced ? false : { scaleX: 0 }}
                    whileInView={reduced ? undefined : { scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.3 + i * 0.1,
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'var(--acid)',
                      transformOrigin: 'left center',
                    }}
                  />
                </div>

                {/* Step title */}
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    lineHeight: 1.15,
                    color: 'var(--ink)',
                    marginBottom: '0.75rem',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {step.title}
                </h3>

                {/* Step body */}
                <p
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: '13px',
                    fontWeight: 300,
                    lineHeight: 1.65,
                    color: 'var(--ink-2)',
                  }}
                >
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── MOBILE: vertical timeline ─── */}
      <div className="md:hidden max-w-[1320px] mx-auto px-6 mt-8">
        <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
          {/* Vertical connector line */}
          <div
            style={{
              position: 'absolute',
              left: '19px',
              top: '20px',
              bottom: '20px',
              width: '2px',
              background: 'var(--border)',
            }}
          />

          {STEPS.map((step, i) => {
            const active = i === 0;
            return (
              <motion.div
                key={step.num}
                initial={reduced ? false : { opacity: 0, x: -12 }}
                whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  paddingBottom: i < STEPS.length - 1 ? '2rem' : 0,
                  position: 'relative',
                }}
              >
                {/* Node */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: active ? 'var(--accent)' : 'var(--bg-1)',
                    border: '2px solid',
                    borderColor: active ? 'var(--accent)' : 'var(--border-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '11px',
                      fontWeight: 700,
                      color: active ? '#fff' : 'var(--ink-3)',
                    }}
                  >
                    {step.num}
                  </span>
                </div>

                {/* Content */}
                <div style={{ paddingTop: '0.5rem' }}>
                  <h3
                    style={{
                      fontFamily: "'Space Grotesk', system-ui, sans-serif",
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      color: 'var(--ink)',
                      lineHeight: 1.2,
                    }}
                  >
                    {step.title}
                  </h3>

                  {/* Acid line */}
                  <div
                    style={{
                      height: '2px',
                      width: '2rem',
                      background: 'var(--acid)',
                      margin: '0.5rem 0',
                    }}
                  />

                  <p
                    style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: '13px',
                      color: 'var(--ink-2)',
                      lineHeight: 1.6,
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
