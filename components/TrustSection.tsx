import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';
import { HERO_STATS } from '../lib/siteContent';

const CountUp: React.FC<{ value: string; label: string }> = ({ value, label }) => {
  const hasNum = /\d/.test(value);
  const numPart = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  const suffix = value.replace(/[0-9.]/g, '');

  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 50, damping: 14 });

  useEffect(() => {
    if (isInView && hasNum) mv.set(numPart);
  }, [isInView, hasNum, mv, numPart]);

  useEffect(() => {
    if (!hasNum) return;
    return spring.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = `${Number.isInteger(numPart) ? Math.round(v) : v.toFixed(1)}${suffix}`;
      }
    });
  }, [spring, hasNum, numPart, suffix]);

  return (
    <div className="flex flex-col items-center text-center gap-3 group">
      <span
        ref={ref}
        className="font-heading text-5xl md:text-6xl font-extrabold text-white group-hover:text-[var(--glacier-glow)] transition-colors duration-400"
      >
        {value}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-slate-600 leading-snug max-w-[9rem]">
        {label}
      </span>
    </div>
  );
};

const TrustSection: React.FC = () => (
  <section className="relative py-24 md:py-32 bg-[var(--surface-0)] overflow-hidden">
    {/* Bear as faint northern identity BG */}
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <img
        src="/bear.png"
        alt=""
        aria-hidden
        className="w-[480px] md:w-[720px] object-contain opacity-[0.03] mix-blend-screen select-none"
        loading="lazy"
      />
    </div>

    <div className="max-w-[1280px] mx-auto px-6 relative z-10">
      {/* Stat blocks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-12 md:gap-16 mb-20"
      >
        {HERO_STATS.map((stat) => (
          <CountUp key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </motion.div>

      {/* Copy block */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        className="max-w-2xl mx-auto text-center"
      >
        <h3 className="font-heading text-3xl md:text-4xl font-extrabold text-white mb-5 tracking-tight">
          Canadian-built.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--glacier-glow)] to-[var(--frost)]">
            Enterprise-proven.
          </span>
        </h3>
        <p className="text-slate-500 text-base leading-relaxed font-light mb-8">
          Every system we ship meets enterprise standards for performance, security, and scalability. Your data stays yours — permanently.
        </p>
        <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--glacier)]/12 bg-[var(--surface-2)]/60 px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.24em] text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--glacier-glow)]" />
          Canada · Remote-first · Data Sovereign
        </div>
      </motion.div>
    </div>
  </section>
);

export default TrustSection;
