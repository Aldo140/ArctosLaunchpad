/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export type FaqItem = { q: string; a: string };

interface FaqSectionProps {
  items: FaqItem[];
  heading?: string;
  subheading?: string;
  className?: string;
}

const FaqSection: React.FC<FaqSectionProps> = ({
  items,
  heading = 'Questions, answered',
  subheading = 'Straight answers before you initiate contact.',
  className = '',
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const prefersReduced = useReducedMotion();

  return (
    <section
      className={className}
      style={{ background: 'var(--bg-1)' }}
    >
      <div
        className="mx-auto px-6 md:px-12 py-24 md:py-32"
        style={{ maxWidth: '840px' }}
      >
        {/* ── MOBILE header (hidden on md+) ── */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 md:hidden"
          style={{ paddingTop: 'clamp(0rem, 1vw, 0.5rem)' }}
        >
          {/* Eyebrow */}
          <p
            className="font-mono uppercase"
            style={{
              fontSize: '9px',
              letterSpacing: '0.12em',
              color: 'var(--ink-3)',
              marginBottom: '1rem',
            }}
          >
            06 / FAQ
          </p>

          {/* H2 — line 1 normal, line 2 italic + accent */}
          <h2
            className="font-heading leading-none mb-4"
            style={{
              fontSize: 'clamp(2.25rem, 9vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--ink)',
            }}
          >
            Questions,{' '}
            <span
              style={{
                display: 'block',
                fontStyle: 'italic',
                color: 'var(--accent)',
              }}
            >
              answered.
            </span>
          </h2>

          {/* Subheading */}
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '14px',
              fontWeight: 300,
              color: 'var(--ink-2)',
              lineHeight: 1.6,
              maxWidth: '28rem',
            }}
          >
            {subheading}
          </p>
        </motion.div>

        {/* ── DESKTOP header (hidden on <md) ── */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 hidden md:block"
        >
          <p
            className="font-mono uppercase tracking-widest mb-5"
            style={{ fontSize: '10px', color: 'var(--ink-2)', letterSpacing: '0.22em' }}
          >
            06 / FAQ
          </p>
          <h2
            className="font-heading font-normal leading-none mb-5"
            style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', color: 'var(--ink)' }}
          >
            {heading}
          </h2>
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '15px',
              fontWeight: 300,
              color: 'var(--ink-2)',
              lineHeight: 1.6,
            }}
          >
            {subheading}
          </p>
        </motion.div>

        {/* Accordion */}
        <div>
          {items.map((item, i) => {
            const open = openIndex === i;
            const isLast = i === items.length - 1;
            const questionNumber = `0${i + 1}`;

            return (
              <motion.div
                key={item.q}
                initial={prefersReduced ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.05,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {/* Top rule — changes color when open */}
                <div
                  style={{
                    height: '1px',
                    background: open
                      ? 'rgba(37,99,255,0.25)'
                      : 'var(--border)',
                    transition: 'background 0.3s ease',
                  }}
                />

                {/* Question row */}
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-start justify-between gap-6 text-left"
                  style={{
                    paddingTop: 'clamp(1.25rem, 3vw, 1.5rem)',
                    paddingBottom: open ? '0.75rem' : 'clamp(1.25rem, 3vw, 1.5rem)',
                    cursor: 'pointer',
                  }}
                  aria-expanded={open}
                >
                  {/* Left content: number (mobile) + question text */}
                  <span className="flex items-start min-w-0">
                    {/* Question number — visible on mobile only */}
                    <span
                      className="md:hidden"
                      aria-hidden
                      style={{
                        fontSize: '10px',
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: 'var(--ink-3)',
                        marginRight: '0.75rem',
                        flexShrink: 0,
                        paddingTop: '0.2rem',
                        lineHeight: 1,
                      }}
                    >
                      {questionNumber}
                    </span>

                    {/* Question text */}
                    <span
                      className="font-heading font-normal leading-snug transition-colors duration-300"
                      style={{
                        fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                        color: open ? 'var(--accent)' : 'var(--ink)',
                      }}
                    >
                      {item.q}
                    </span>
                  </span>

                  {/* Toggle icon */}
                  <span
                    className="font-mono shrink-0 transition-colors duration-300"
                    style={{
                      fontSize: '1.25rem',
                      lineHeight: 1,
                      marginTop: '0.15rem',
                      color: open ? 'var(--accent)' : 'var(--ink-2)',
                    }}
                    aria-hidden
                  >
                    {open ? '−' : '+'}
                  </span>
                </button>

                {/* Answer — animated height */}
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p
                        style={{
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontSize: 'clamp(13px, 2vw, 14px)',
                          fontWeight: 300,
                          color: 'var(--ink-2)',
                          lineHeight: 1.75,
                          paddingBottom: '1.5rem',
                          maxWidth: '42rem',
                        }}
                      >
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom rule — only on last item */}
                {isLast && (
                  <div
                    style={{
                      height: '1px',
                      background: open
                        ? 'rgba(37,99,255,0.25)'
                        : 'var(--border)',
                      transition: 'background 0.3s ease',
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
