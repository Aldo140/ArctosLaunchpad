import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useInView, useReducedMotion } from 'framer-motion';
import { X, Check } from 'lucide-react';

const PAIN_POINTS = [
  { label: 'Squarespace', cost: '$276/yr' },
  { label: 'Zapier', cost: '$588/yr' },
  { label: 'Notion', cost: '$192/yr' },
  { label: 'Hotjar', cost: '$360/yr' },
  { label: 'Support fees', cost: '$384/yr' },
];

const ARCTOS_WINS = [
  {
    statement: 'Own it. Forever.',
    detail: 'No platform fees. No subscriptions. No surprises.',
  },
  {
    statement: 'Built for your operations.',
    detail: 'Not a template. Engineered to your workflow.',
  },
  {
    statement: 'Full source code. Always.',
    detail: 'Every line of code is yours the day we ship.',
  },
  {
    statement: 'Canadian data sovereignty.',
    detail: 'Your data never touches foreign servers.',
  },
];

const AnimatedCount: React.FC = () => {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion() ?? false;
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 28, damping: 14 });

  useEffect(() => {
    if (isInView) mv.set(reduced ? 5400 : 5400);
  }, [isInView, mv, reduced]);

  useEffect(() => {
    if (reduced) return;
    return spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = `$${Math.round(v).toLocaleString()}+/yr`;
    });
  }, [spring, reduced]);

  return (
    <span ref={ref} style={{ color: '#E87060' }}>
      {reduced ? '$5,400+/yr' : '$0/yr'}
    </span>
  );
};

const WhyCustomSection: React.FC = () => {
  const reduced = useReducedMotion() ?? false;

  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

  const leftRef = useRef<HTMLDivElement>(null);
  const leftInView = useInView(leftRef, { once: true, margin: '-60px' });

  const rightRef = useRef<HTMLDivElement>(null);
  const rightInView = useInView(rightRef, { once: true, margin: '-60px' });

  return (
    <section
      className="py-20 md:py-32"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-[1360px] mx-auto px-6 md:px-12">

        {/* ── Section header ── */}
        <motion.div
          ref={headerRef}
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 md:mb-20"
        >
          <p
            className="uppercase tracking-[0.22em] mb-5"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              color: 'var(--ink-2)',
            }}
          >
            THE CASE FOR INFRASTRUCTURE
          </p>
          <h2
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: 'clamp(3rem, 5.5vw, 5.5rem)',
              fontWeight: 300,
              lineHeight: 0.92,
              color: 'var(--ink)',
              letterSpacing: '-0.01em',
            }}
          >
            Fragmented tools are costing you more than money.
          </h2>
        </motion.div>

        {/* ── Two-column grid ── */}
        <div className="grid md:grid-cols-2 gap-0 relative items-stretch">

          {/* Vertical separator — desktop only */}
          <div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 pointer-events-none"
            style={{ width: '1px', background: 'var(--border)' }}
          />

          {/* ── LEFT: The Subscription Trap ── */}
          <motion.div
            ref={leftRef}
            initial={reduced ? false : { opacity: 0, x: -24 }}
            animate={leftInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="p-8 md:p-14 flex flex-col"
            style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between mb-8">
              <span
                className="uppercase tracking-[0.22em]"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '10px',
                  color: 'var(--ink-2)',
                }}
              >
                The Subscription Trap
              </span>
              <X
                size={14}
                strokeWidth={1.5}
                style={{ color: 'rgba(232,112,96,0.5)' }}
              />
            </div>

            {/* Pain point rows */}
            <div className="flex-1">
              {PAIN_POINTS.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={leftInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.4,
                    delay: 0.1 + i * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex justify-between items-baseline py-3"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: '14px',
                      color: 'var(--ink)',
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '13px',
                      color: '#E87060',
                    }}
                  >
                    {item.cost}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Total */}
            <div
              className="mt-8 pt-6"
              style={{ borderTop: '1px solid var(--border-2)' }}
            >
              <p
                className="uppercase tracking-[0.18em] mb-3"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '10px',
                  color: 'var(--ink-2)',
                }}
              >
                Annual burden
              </p>
              <div
                style={{
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontSize: 'clamp(3.5rem, 6vw, 4.5rem)',
                  fontWeight: 600,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                <AnimatedCount />
              </div>
              <p
                className="mt-2"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '10px',
                  color: 'var(--ink-3)',
                }}
              >
                × 3 years = $16,200+ with zero equity
              </p>
            </div>
          </motion.div>

          {/* ── RIGHT: The Arctos Way ── */}
          <motion.div
            ref={rightRef}
            initial={reduced ? false : { opacity: 0, x: 24 }}
            animate={rightInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="p-8 md:p-14 flex flex-col"
            style={{
              background: 'rgba(59,130,246,0.06)',
              border: '1px solid rgba(59,130,246,0.12)',
            }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between mb-8">
              <span
                className="uppercase tracking-[0.22em]"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '10px',
                  color: 'var(--ink-2)',
                }}
              >
                Engineered Infrastructure
              </span>
              <Check
                size={14}
                strokeWidth={2}
                style={{ color: '#3b82f6' }}
              />
            </div>

            {/* Benefit rows */}
            <div className="flex-1">
              {ARCTOS_WINS.map((item, i) => (
                <motion.div
                  key={item.statement}
                  initial={reduced ? false : { opacity: 0, x: 16 }}
                  animate={rightInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.45,
                    delay: 0.15 + i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="py-4"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', system-ui, sans-serif",
                      fontSize: '1.25rem',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      color: 'var(--ink)',
                      lineHeight: 1.2,
                      marginBottom: '4px',
                    }}
                  >
                    {item.statement}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: '12px',
                      color: 'var(--ink-2)',
                      lineHeight: 1.5,
                    }}
                  >
                    {item.detail}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Investment callout */}
            <div
              className="mt-8 pt-6"
              style={{ borderTop: '1px solid rgba(59,130,246,0.12)' }}
            >
              <p
                className="uppercase tracking-[0.18em] mb-3"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '10px',
                  color: 'var(--ink-2)',
                }}
              >
                One-time investment
              </p>
              <div
                style={{
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontSize: 'clamp(3.5rem, 6vw, 4.5rem)',
                  fontWeight: 600,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  color: '#3b82f6',
                }}
              >
                Yours.
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default WhyCustomSection;
