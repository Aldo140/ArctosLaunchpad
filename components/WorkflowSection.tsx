import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Search, Layers, Code, Rocket } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    title: 'Discovery Sprint',
    body: 'Architecture review, user flow mapping, and clear success criteria. Documented before writing a line of code.',
    Icon: Search,
  },
  {
    num: '02',
    title: 'System Design',
    body: 'Component architecture, data flows, integration specs, and full written scope with fixed milestones.',
    Icon: Layers,
  },
  {
    num: '03',
    title: 'Build & Integrate',
    body: 'Staged delivery with weekly reviews, performance testing, security hardening, and full client visibility.',
    Icon: Code,
  },
  {
    num: '04',
    title: 'Launch & Handoff',
    body: 'Production deployment, full documentation, team training, and complete source code handoff.',
    Icon: Rocket,
  },
] as const;

const WorkflowSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative py-24 md:py-28 bg-[var(--surface-1)] overflow-hidden">
      {/* Subtle bottom glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_50%_100%,rgba(14,165,233,0.04),transparent)]" />

      <div className="relative max-w-[1280px] mx-auto px-6">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          {/* Eyebrow with line prefix */}
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-px bg-[var(--glacier)]" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--glacier)]">
              The Process
            </p>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            How we engineer your system.
          </h2>
        </motion.div>

        {/* Desktop: horizontal */}
        <div className="hidden md:grid grid-cols-4 gap-5 relative">
          {/* Connecting line — primary layer */}
          <motion.div
            initial={shouldReduceMotion ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="absolute top-[2.8rem] left-[12%] right-[12%] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--glacier-glow)]/60 to-transparent origin-left"
          />
          {/* Connecting line — secondary thinner layer */}
          <motion.div
            initial={shouldReduceMotion ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="absolute top-[calc(2.8rem+2px)] left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-[var(--glacier-glow)]/30 to-transparent origin-left opacity-30"
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center group"
            >
              <div className="relative mb-7">
                {/* Large faded watermark number */}
                <span className="absolute -top-3 -left-3 font-heading text-[5rem] font-extrabold text-white/[0.04] leading-none select-none pointer-events-none">
                  {step.num}
                </span>
                {/* Outer ring — appears on hover */}
                <div
                  className="w-[5.5rem] h-[5.5rem] rounded-full border border-[var(--glacier)]/20 bg-[var(--surface-2)] flex items-center justify-center
                    ring-2 ring-[var(--glacier)]/0
                    group-hover:ring-[var(--glacier)]/20
                    group-hover:border-[var(--glacier)]/50
                    group-hover:bg-[var(--glacier)]/[0.06]
                    group-hover:shadow-[0_0_40px_rgba(14,165,233,0.15)]
                    transition-all duration-500"
                >
                  <step.Icon className="w-6 h-6 text-[var(--glacier-glow)]" />
                </div>
              </div>
              <h3 className="font-heading text-base font-bold text-white mb-2 group-hover:text-[var(--glacier-glow)] transition-colors duration-200">
                {step.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-light">{step.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Mobile: vertical */}
        <div className="md:hidden space-y-4 relative">
          <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-[var(--glacier)]/40 via-[var(--glacier-glow)]/30 to-transparent" />
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={shouldReduceMotion ? false : { opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex gap-4 pl-12 relative"
            >
              <div className="absolute left-0 w-10 h-10 rounded-full border border-[var(--glacier)]/25 bg-[var(--surface-2)] flex items-center justify-center">
                <step.Icon className="w-4 h-4 text-[var(--glacier-glow)]" />
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[var(--surface-2)] p-5 flex-1">
                <span className="font-mono text-[9px] text-[var(--glacier)] uppercase tracking-[0.28em]">{step.num}</span>
                <h3 className="font-heading text-base font-bold text-white mt-1.5 mb-1.5">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-light">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
