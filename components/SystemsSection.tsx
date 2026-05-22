import React from 'react';
import { motion, useMotionValue, useMotionTemplate, useReducedMotion } from 'framer-motion';
import { Code, Layout, Zap, Check, ArrowRight } from 'lucide-react';

const SpotlightCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const bg = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(14,165,233,0.08), transparent 80%)`;

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div className={`group relative overflow-hidden ${className}`} onMouseMove={handleMouseMove}>
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{ background: bg }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

interface CardProps {
  icon: React.ReactNode;
  badge?: string;
  title: string;
  body: string;
  features: string[];
  pricing: string;
  pricingSub: string;
  cta: string;
  accentVar: string;
  accentBar: string;
  index: number;
  flagship?: boolean;
  onCta: () => void;
  reducedMotion: boolean;
}

const Card: React.FC<CardProps> = ({
  icon,
  badge,
  title,
  body,
  features,
  pricing,
  pricingSub,
  cta,
  accentVar,
  accentBar,
  index,
  flagship,
  onCta,
  reducedMotion,
}) => (
  <motion.div
    initial={reducedMotion ? false : { opacity: 0, y: 28 }}
    whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={reducedMotion ? undefined : { delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="h-full"
  >
    <SpotlightCard
      className={`h-full rounded-2xl border bg-gradient-to-b from-[var(--surface-2)] to-[#080e18] p-8 flex flex-col group transition-colors duration-300 ${
        flagship
          ? 'border-[var(--glacier)]/20 hover:border-[var(--glacier)]/35'
          : 'border-white/[0.07] hover:border-[var(--glacier)]/20'
      }`}
    >
      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r"
        style={{ backgroundImage: accentBar }}
      />

      <div className="flex items-start justify-between mb-10">
        <div
          className={`w-14 h-14 rounded-xl border border-white/[0.08] bg-[var(--surface-1)] flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
            flagship ? 'group-hover:shadow-[0_0_20px_rgba(14,165,233,0.2)]' : ''
          }`}
          style={{ color: accentVar }}
        >
          {icon}
        </div>
        {badge && (
          <span className="rounded-full bg-[var(--glacier)] text-[var(--surface-0)] px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-widest">
            {badge}
          </span>
        )}
      </div>

      <h3 className="text-xl font-heading font-extrabold text-white mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-8 font-light flex-1">{body}</p>

      <div className="mt-auto">
        <div className="flex items-baseline gap-2.5 mb-6 pb-6 border-b border-white/[0.06]">
          <span className="font-heading text-3xl font-bold text-white">{pricing}</span>
          <span className="text-slate-700" aria-hidden>●</span>
          <span className="font-mono text-[10px] text-slate-600 uppercase tracking-wider">{pricingSub}</span>
        </div>
        <ul className="space-y-2.5 mb-8">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-slate-400">
              <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accentVar }} />
              {f}
            </li>
          ))}
        </ul>
        <button
          onClick={onCta}
          className="w-full py-4 rounded-xl font-mono text-[10px] font-extrabold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] group/btn"
          style={{ background: accentVar, color: 'var(--surface-0)' }}
        >
          {cta}
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </SpotlightCard>
  </motion.div>
);

interface SystemsSectionProps {
  scrollToContact: () => void;
}

const SystemsSection: React.FC<SystemsSectionProps> = ({ scrollToContact }) => {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <section id="systems" className="relative py-24 md:py-28 bg-[var(--surface-1)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(14,165,233,0.06),transparent)]" />
      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reducedMotion ? undefined : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[var(--glacier)]" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--glacier)]">
              Operational Systems
            </p>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Built for the way modern businesses run.
          </h2>
          <p className="text-slate-500 text-base max-w-xl font-light leading-relaxed">
            Three deployment models. All engineered for performance, security, and full ownership.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-5">
          <Card
            index={0}
            icon={<Code className="w-6 h-6" />}
            badge="Flagship"
            flagship
            title="Custom Operational Systems"
            body="Hand-built React/Next.js infrastructure for maximum performance and complete operational control. Zero platform rent. Full source ownership."
            features={['Zero Platform Rent', '100/100 Core Web Vitals', 'Full Source Ownership']}
            pricing="One-Time"
            pricingSub="/ Fixed"
            cta="Initiate"
            accentVar="var(--glacier)"
            accentBar="linear-gradient(to right, var(--glacier), transparent)"
            onCta={scrollToContact}
            reducedMotion={reducedMotion}
          />
          <Card
            index={1}
            icon={<Layout className="w-6 h-6" />}
            title="Platform Hybrid"
            body="Visually engineered on modern visual builders (Wix Studio / Webflow) for teams that need daily content control without sacrificing craft."
            features={['Premium UI/UX Design', 'Seamless Handoff', 'Operational Training']}
            pricing="Build"
            pricingSub="/ Flat Rate"
            cta="Configure This"
            accentVar="var(--frost)"
            accentBar="linear-gradient(to right, rgba(186,230,253,0.6), transparent)"
            onCta={scrollToContact}
            reducedMotion={reducedMotion}
          />
          <Card
            index={2}
            icon={<Zap className="w-6 h-6" />}
            title="Application Systems"
            body="Complex data-intensive software — dashboards, booking engines, civic intelligence platforms, AI pipelines, and robust API integrations."
            features={['Full-Stack Engineering', 'Identity & Security', 'Scalable Infrastructure']}
            pricing="Scope"
            pricingSub="/ Evaluated"
            cta="Consult With Us"
            accentVar="var(--glacier-glow)"
            accentBar="linear-gradient(to right, var(--glacier-glow), transparent)"
            onCta={scrollToContact}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>
    </section>
  );
};

export default SystemsSection;
