/**
 * SystemsSection — Metalab-inspired editorial capabilities list
 * Design: numbered row format, Space Grotesk / Inter / JetBrains Mono
 */

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// ─── Design tokens ──────────────────────────────────────────────────────────
const T = {
  bg1:     '#0C0F18',
  ink:     '#F5F7FF',
  ink2:    '#8B9CB8',
  ink3:    '#3D5275',
  accent:  '#2563FF',
  border:  'rgba(255, 255, 255, 0.06)',
  border2: 'rgba(255, 255, 255, 0.11)',
} as const;

// ─── Service data ────────────────────────────────────────────────────────────
interface Service {
  num:        string;
  title:      string;
  descriptor: string;
  tags:       string[];
}

const SERVICES: Service[] = [
  {
    num:        '01',
    title:      'Custom Operational Systems',
    descriptor: 'Hand-built React/Next.js infrastructure. Zero platform rent. Full source ownership.',
    tags:       ['React', 'Next.js', 'TypeScript'],
  },
  {
    num:        '02',
    title:      'Platform Hybrid',
    descriptor: 'Wix Studio / Webflow for teams needing daily content control without sacrificing craft.',
    tags:       ['Wix Studio', 'Webflow', 'CMS'],
  },
  {
    num:        '03',
    title:      'Application Systems',
    descriptor: 'Dashboards, booking engines, AI pipelines, civic intelligence platforms, and APIs.',
    tags:       ['Full-Stack', 'AI', 'Infrastructure'],
  },
];

// ─── Props ───────────────────────────────────────────────────────────────────
interface SystemsSectionProps {
  scrollToContact: () => void;
}

// ─── Animation variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 },
  }),
};

const headerFade = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// ─── ServiceRow ──────────────────────────────────────────────────────────────
const ServiceRow: React.FC<{ service: Service; index: number; reduceMotion: boolean }> = ({
  service,
  index,
  reduceMotion,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      custom={index}
      variants={reduceMotion ? undefined : fadeUp}
      initial={reduceMotion ? undefined : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={{ once: true, margin: '-60px' }}
    >
      {/* Top rule */}
      <div style={{ height: 1, background: T.border }} />

      {/* Row */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          backgroundColor: hovered ? T.bg1 : 'transparent',
          transition: 'background-color 0.3s ease',
          cursor: 'default',
          paddingTop: '2rem',
          paddingBottom: '2rem',
          paddingLeft: '0',
          paddingRight: '0',
        }}
      >
        {/* Acid bottom border on hover */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: T.accent,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Grid: number | content | tags */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            alignItems: 'center',
            gap: '2rem',
          }}
          className="gap-x-8 md:gap-x-12"
        >
          {/* Number */}
          <div
            style={{
              fontFamily: "'Syne', system-ui, sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(3.5rem, 6vw, 5rem)',
              lineHeight: 1,
              color: hovered ? T.accent : T.ink3,
              transition: 'color 0.3s ease',
              userSelect: 'none',
              minWidth: '4.5rem',
            }}
          >
            {service.num}
          </div>

          {/* Title + descriptor */}
          <motion.div
            animate={reduceMotion ? undefined : { x: hovered ? 8 : 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ minWidth: 0 }}
          >
            <div
              style={{
                fontFamily: "'Syne', system-ui, sans-serif",
                fontWeight: 500,
                fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)',
                color: T.ink,
                lineHeight: 1.15,
                marginBottom: '0.4rem',
                letterSpacing: '-0.01em',
              }}
            >
              {service.title}
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: 13,
                color: T.ink2,
                lineHeight: 1.5,
                fontWeight: 400,
              }}
            >
              {service.descriptor}
            </div>
          </motion.div>

          {/* Tags — hidden on mobile via inline media approach */}
          <div
            className="hidden md:flex"
            style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}
          >
            {service.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: T.ink3,
                  border: `1px solid ${T.border2}`,
                  padding: '0.2rem 0.55rem',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.6,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── CTARow ──────────────────────────────────────────────────────────────────
const CTARow: React.FC<{ scrollToContact: () => void; reduceMotion: boolean }> = ({
  scrollToContact,
  reduceMotion,
}) => {
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <motion.div
      custom={SERVICES.length}
      variants={reduceMotion ? undefined : fadeUp}
      initial={reduceMotion ? undefined : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={{ once: true, margin: '-60px' }}
    >
      {/* Top rule */}
      <div style={{ height: 1, background: T.border2 }} />

      {/* CTA content */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          padding: '2rem 0',
          backgroundColor: hovered ? T.bg1 : 'transparent',
          transition: 'background-color 0.3s ease',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            fontFamily: "'Syne', system-ui, sans-serif",
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 24,
            color: T.ink,
            letterSpacing: '-0.01em',
          }}
        >
          Ready to engineer your infrastructure?
        </div>

        <button
          onClick={scrollToContact}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            backgroundColor: btnHovered ? '#4D7FFF' : T.accent,
            color: '#ffffff',
            border: 'none',
            padding: '0.85rem 2rem',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}
        >
          Start Your Infrastructure →
        </button>
      </div>

      {/* Bottom rule */}
      <div style={{ height: 1, background: T.border }} />
    </motion.div>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────
const SystemsSection: React.FC<SystemsSectionProps> = ({ scrollToContact }) => {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <section
      style={{
        backgroundColor: T.bg1,
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'clamp(5rem, 10vw, 10rem) clamp(1.25rem, 5vw, 3.5rem)',
        }}
      >
        {/* ── Section header ── */}
        <motion.div
          variants={reduceVariants(headerFade, prefersReducedMotion)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ marginBottom: 'clamp(3.5rem, 6vw, 5rem)' }}
        >
          {/* Eyebrow */}
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: T.ink2,
              marginBottom: '1.5rem',
            }}
          >
            01 / Capabilities
          </div>

          {/* Heading */}
          <h2
            style={{
              fontFamily: "'Syne', system-ui, sans-serif",
              fontSize: 'clamp(3rem, 5vw, 5rem)',
              fontWeight: 500,
              color: T.ink,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Built for the way
            <br />
            modern operations run.
          </h2>
        </motion.div>

        {/* ── Service rows ── */}
        <div>
          {SERVICES.map((service, i) => (
            <ServiceRow
              key={service.num}
              service={service}
              index={i}
              reduceMotion={prefersReducedMotion}
            />
          ))}

          {/* ── CTA row ── */}
          <CTARow scrollToContact={scrollToContact} reduceMotion={prefersReducedMotion} />
        </div>
      </div>
    </section>
  );
};

// Helper: strip motion variants when reduced motion is preferred
function reduceVariants<T extends object>(variants: T, reduce: boolean): T | undefined {
  return reduce ? undefined : variants;
}

export default SystemsSection;
