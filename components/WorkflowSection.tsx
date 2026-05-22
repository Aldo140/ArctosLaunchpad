import React from 'react';
import { motion } from 'framer-motion';
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

const WorkflowSection: React.FC = () => (
  <section className="relative py-24 md:py-28 bg-[var(--surface-1)]">
    <div className="max-w-[1280px] mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16"
      >
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--glacier)] mb-3">
          The Process
        </p>
        <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          How we engineer your system.
        </h2>
      </motion.div>

      {/* Desktop: horizontal */}
      <div className="hidden md:grid grid-cols-4 gap-5 relative">
        {/* Connecting line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="absolute top-[2.8rem] left-[12%] right-[12%] h-px bg-gradient-to-r from-[var(--glacier)]/30 via-[var(--glacier-glow)]/50 to-[var(--glacier)]/30 origin-left"
        />
        {STEPS.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center group"
          >
            <div className="relative mb-7">
              <div className="w-[5.5rem] h-[5.5rem] rounded-full border border-[var(--glacier)]/20 bg-[var(--surface-2)] flex items-center justify-center group-hover:border-[var(--glacier)]/50 group-hover:bg-[var(--glacier)]/[0.06] transition-all duration-300">
                <step.Icon className="w-6 h-6 text-[var(--glacier-glow)]" />
              </div>
              <span className="absolute -top-1 -right-1 font-mono text-[8px] font-bold text-[var(--glacier)] bg-[var(--surface-0)] border border-[var(--glacier)]/25 rounded-full flex items-center justify-center w-6 h-6">
                {i + 1}
              </span>
            </div>
            <h3 className="font-heading text-base font-bold text-white mb-2 group-hover:text-[var(--glacier-glow)] transition-colors duration-200">
              {step.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed font-light">{step.body}</p>
          </motion.div>
        ))}
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden space-y-4 relative">
        <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-[var(--glacier)]/40 via-[var(--glacier-glow)]/30 to-transparent" />
        {STEPS.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, x: -16 }}
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

export default WorkflowSection;
