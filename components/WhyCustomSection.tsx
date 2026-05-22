import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';
import { X, Check } from 'lucide-react';

const PAIN_POINTS = [
  { label: 'Squarespace', cost: '$276/yr' },
  { label: 'Zapier', cost: '$588/yr' },
  { label: 'Notion', cost: '$192/yr' },
  { label: 'Hotjar + Analytics', cost: '$360/yr' },
  { label: 'Plugin & Support Fees', cost: '$384/yr' },
];

const ARCTOS_WINS = [
  'One-time build. You own it forever.',
  'No monthly fees. No vendor lock-in.',
  'Built specifically for your operations.',
  'Full source code. Full data sovereignty.',
];

const AnimatedCost: React.FC = () => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 55, damping: 18 });

  useEffect(() => {
    if (isInView) mv.set(5400);
  }, [isInView, mv]);

  useEffect(() => {
    return spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = `$${Math.round(v).toLocaleString()}+/yr`;
    });
  }, [spring]);

  return <span ref={ref}>$0/yr</span>;
};

const WhyCustomSection: React.FC = () => (
  <section className="relative py-24 md:py-28 bg-[var(--surface-0)]">
    <div className="max-w-[1280px] mx-auto px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-14"
      >
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--glacier)] mb-3">
          The Case for Infrastructure
        </p>
        <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Fragmented tools cost you more than money.
        </h2>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Left: Subscription trap */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-red-950/50 bg-[#0d0808] p-8 relative overflow-hidden"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-red-900/40 bg-red-950/30 px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.24em] text-red-400 mb-7">
            <X className="w-3 h-3" /> The Subscription Trap
          </div>
          <div className="space-y-2.5 mb-7">
            {PAIN_POINTS.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="flex items-center justify-between rounded-lg border border-red-900/15 bg-red-950/10 px-4 py-3"
              >
                <span className="text-slate-300 text-sm">{item.label}</span>
                <span className="font-mono text-sm text-red-400">{item.cost}</span>
              </motion.div>
            ))}
            <div className="flex items-center justify-between rounded-lg border border-red-900/10 bg-red-950/10 px-4 py-3">
              <span className="text-slate-600 text-sm">+ more integrations...</span>
              <span className="font-mono text-sm text-red-700">???</span>
            </div>
          </div>
          <div className="border-t border-red-900/25 pt-7">
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-slate-700 mb-2">Annual cost</p>
            <p className="font-heading text-4xl font-extrabold text-red-400">
              <AnimatedCost />
            </p>
            <p className="text-red-600/60 text-sm mt-2.5">Zero ownership · Vendor dependency</p>
          </div>
        </motion.div>

        {/* Right: The Arctos Way */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-[var(--glacier)]/15 bg-[var(--surface-2)] p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.05),transparent_60%)] pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--glacier)]/25 bg-[var(--glacier)]/8 px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.24em] text-[var(--glacier-glow)] mb-7">
              <Check className="w-3 h-3" /> The Arctos Way
            </div>
            <div className="space-y-2.5 mb-7">
              {ARCTOS_WINS.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="flex items-center gap-3 rounded-lg border border-[var(--glacier)]/10 bg-[var(--glacier)]/[0.04] px-4 py-3.5"
                >
                  <Check className="w-3.5 h-3.5 text-[var(--glacier-glow)] flex-shrink-0" />
                  <span className="text-white text-sm font-medium">{item}</span>
                </motion.div>
              ))}
            </div>
            <div className="border-t border-[var(--glacier)]/12 pt-7">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-slate-600 mb-2">Investment type</p>
              <p className="font-heading text-4xl font-extrabold text-[var(--glacier-glow)]">One-Time</p>
              <p className="text-[var(--glacier-glow)]/50 text-sm mt-2.5">Permanent asset · Full ownership</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default WhyCustomSection;
