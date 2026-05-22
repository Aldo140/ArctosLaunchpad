/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

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

  return (
    <section className={`relative preserve-3d ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(94,106,210,0.15),transparent_50%)] pointer-events-none" />
      <div className="mb-14 max-w-2xl relative z-10">
        <div className="flex items-center gap-3 mb-4">
           <div className="w-1.5 h-1.5 bg-[var(--accent-glow)] rounded-full animate-pulse" />
           <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--accent-glow)]">Intelligence Brief</p>
        </div>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-white md:text-5xl">{heading}</h2>
        <p className="mt-4 text-slate-400 md:text-lg font-light leading-relaxed">{subheading}</p>
      </div>
      
      <div className="space-y-4 relative z-10 perspective-[1000px]">
        {items.map((item, i) => {
          const open = openIndex === i;
          return (
            <motion.div 
              key={item.q} 
              className={`glass-panel border rounded-2xl overflow-hidden transition-all duration-500 ${open ? 'border-[var(--accent-glow)]/40 shadow-[0_10px_30px_rgba(0,240,255,0.1)]' : 'border-white/10 hover:border-white/20'}`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-white/[0.02]"
                aria-expanded={open}
              >
                <span className={`font-bold transition-colors duration-300 ${open ? 'text-white' : 'text-slate-300'} md:text-lg tracking-wide`}>{item.q}</span>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-500 ${open ? 'bg-[var(--accent-glow)] border-[var(--accent-glow)] text-black rotate-45' : 'border-white/20 text-[var(--accent-glow)] bg-black/50'}`}>
                  <Plus className="h-4 w-4 shrink-0" />
                </div>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="px-6 pb-6 pr-12 text-base leading-relaxed text-slate-400 font-light border-t border-white/5 pt-4">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default FaqSection;
