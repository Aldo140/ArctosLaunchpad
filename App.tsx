/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValue, useMotionTemplate } from 'framer-motion';
import { useLenisGsap } from './hooks/useLenisGsap';
import { ArrowRight, Menu, X, Star } from 'lucide-react';
import ContactForm from './components/ContactForm';
import CustomCursor from './components/CustomCursor';
import AIChat from './components/AIChat';
import FaqSection from './components/FaqSection';
import HeroSection from './components/HeroSection';
import SystemsSection from './components/SystemsSection';
import WhyCustomSection from './components/WhyCustomSection';
import WorkflowSection from './components/WorkflowSection';
import TrustSection from './components/TrustSection';
import { FAQ_ITEMS, HERO_STATS } from './lib/siteContent';
import { Project } from './types';

const POLAR_BEAR_LOGO =
  'https://www.image2url.com/r2/default/images/1779334554589-8e1c8308-a058-4149-84d1-42e881122291.png';

const projectHref = (p: Project): string => {
  if (p.href?.trim()) return p.href.trim();
  const u = p.url.trim().replace(/^https?:\/\//i, '');
  return `https://${u}`;
};

const PROJECTS: Project[] = [
  {
    id: 'starlings',
    name: 'Starlings Support Map',
    type: 'Youth Infrastructure Platform',
    url: 'aldo140.github.io/Starlings',
    href: 'https://aldo140.github.io/Starlings/',
    description:
      'Anonymous support map for youth impacted by family substance use. Real-time resource discovery, community notes, and vetted Canadian support services — built with React 19, Leaflet, and Google Apps Script moderation.',
    image: '/starlings-landing-desktop.webp',
    tags: ['React 19', 'Leaflet', 'Firebase'],
    featured: true,
  },
  {
    id: 'calgary-watch',
    name: 'Calgary Watch',
    type: 'Civic Safety Intelligence System',
    url: 'calgarywatch.ca',
    href: 'https://calgarywatch.ca/',
    description:
      'Canadian non-profit safety intelligence platform: community incident reports, 511 Alberta traffic, Environment Canada alerts, and crime choropleths. Firebase Firestore, react-leaflet, GitHub Actions ingest.',
    image: '/calgarywatch-landing-desktop.webp',
    tags: ['Firebase', 'Leaflet', 'GitHub Actions'],
    featured: true,
  },
  {
    id: 'rio-alto',
    name: 'Rio Alto',
    type: 'Hospitality Digital Platform',
    url: 'rioalto.ca',
    description:
      'Custom static site for a premium Calgary restaurant. 99/100 Lighthouse. Zero monthly platform fees — the client owns the build permanently.',
    image: '/rioalto-dish.webp',
    tags: ['Static', 'SEO', 'Performance'],
  },
  {
    id: 'mru-hacks',
    name: 'MRU Hacks',
    type: 'High-Traffic Event Platform',
    url: 'mruhacks.ca',
    description:
      'Hackathon registration portal engineered for 500+ concurrent users with real-time capacity management and smooth onboarding flows.',
    image: '/mruhacks-landing-desktop.webp',
    tags: ['Events', 'Scale', 'React'],
  },
];

// ─── Project Work Card ────────────────────────────────────────────────────────

const ProjectWorkCard: React.FC<{ project: Project; className?: string }> = ({
  project,
  className = '',
}) => {
  const href = projectHref(project);
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[var(--surface-2)] transition-all duration-300 hover:border-[var(--glacier)]/20 hover:shadow-[0_0_40px_rgba(14,165,233,0.08)] ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
      <img
        src={project.image}
        alt={project.name}
        className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-700 ease-out group-hover:scale-[1.06] group-hover:opacity-75"
        loading="lazy"
      />
      <div className="relative z-20 mt-auto flex flex-col p-7 md:p-9">
        <div className="mb-3 flex flex-wrap gap-2">
          {project.tags?.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/15 bg-black/40 backdrop-blur-sm px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-white/70"
            >
              {t}
            </span>
          ))}
        </div>
        <p className="font-mono text-[9px] font-extrabold uppercase tracking-[0.28em] text-[var(--glacier-glow)]">
          {project.type}
        </p>
        <h3 className="mt-1.5 font-heading text-2xl font-extrabold tracking-tight text-white md:text-3xl leading-tight">
          {project.name}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-400 line-clamp-2 font-light">
          {project.description}
        </p>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--glacier)]/30 bg-black/40 px-5 py-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.2em] text-[var(--glacier-glow)] backdrop-blur-sm transition-all duration-200 hover:border-[var(--glacier)] hover:bg-[var(--glacier)]/15 hover:text-white group/btn"
        >
          View System <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </motion.article>
  );
};

// ─── Marquee ─────────────────────────────────────────────────────────────────

const MARQUEE_ITEMS = [
  'AI Automation',
  'Custom Infrastructure',
  'Enterprise Systems',
  'Data Sovereignty',
  'Operational Platforms',
  'Canadian Technology',
];

const Marquee: React.FC = () => (
  <div className="relative overflow-x-hidden border-y border-white/[0.05] bg-[var(--surface-1)] py-5">
    <div className="absolute inset-0 z-10 bg-gradient-to-r from-[var(--surface-1)] via-transparent to-[var(--surface-1)] pointer-events-none" />
    <motion.div
      className="flex gap-20 whitespace-nowrap items-center"
      animate={{ x: [0, -1200] }}
      transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
    >
      {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
        <span
          key={i}
          className="text-xl md:text-3xl font-heading font-semibold text-slate-600 uppercase tracking-widest flex items-center gap-6"
        >
          {item}
          <Star className="w-3 h-3 md:w-4 md:h-4 text-[var(--glacier)]/40 fill-[var(--glacier)]/40 flex-shrink-0" />
        </span>
      ))}
    </motion.div>
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return isMobile;
};

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const isMobile = useIsMobile();

  useLenisGsap(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = isMenuOpen ? 'hidden' : '';
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const scrollToContact = () => scrollTo('contact');

  const featuredProjects = PROJECTS.filter((p) => p.featured);
  const otherProjects = PROJECTS.filter((p) => !p.featured);

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-[var(--glacier)] selection:text-[var(--surface-0)] overflow-x-hidden bg-[var(--surface-0)]">
      {/* Simple static background — no scroll-linked animations for performance */}
      <div className="fixed inset-0 -z-10 bg-[var(--surface-0)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_10%,rgba(14,165,233,0.06),transparent_60%),radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(14,165,233,0.04),transparent_60%)]" />
      </div>

      {!isMobile && <AIChat />}
      <CustomCursor enabled={!isMobile} />

      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left bg-gradient-to-r from-[var(--glacier)] to-[var(--frost)]"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ── Nav ── */}
      <nav className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 md:px-6 md:pt-5 pointer-events-none">
        <div
          className={`pointer-events-auto mx-auto flex max-w-[1280px] items-center justify-between gap-4 rounded-full px-4 py-2.5 md:px-5 md:py-3 transition-all duration-300 ${
            scrolled
              ? 'bg-[var(--surface-0)]/80 backdrop-blur-xl border border-white/[0.07] shadow-lg shadow-black/30'
              : 'bg-transparent border border-transparent'
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={POLAR_BEAR_LOGO} alt="Arctos Launchpad" className="h-8 w-8 object-contain" />
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-white hidden sm:block">
              ARCTOS <span className="text-[var(--glacier-glow)]">LAUNCHPAD</span>
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7 text-[11px] font-bold uppercase tracking-[0.18em]">
            <button
              onClick={() => scrollTo('systems')}
              className="text-slate-400 hover:text-white transition-colors duration-150"
            >
              Systems
            </button>
            <button
              onClick={() => scrollTo('work')}
              className="text-slate-400 hover:text-white transition-colors duration-150"
            >
              Work
            </button>
            <button
              onClick={scrollToContact}
              className="text-slate-400 hover:text-white transition-colors duration-150"
            >
              Contact
            </button>
          </div>

          {/* Desktop CTA */}
          <button
            onClick={scrollToContact}
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-[var(--glacier)] px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--surface-0)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_24px_rgba(14,165,233,0.4)] active:scale-[0.98]"
          >
            Start Your Infrastructure
          </button>

          {/* Mobile hamburger */}
          <button
            className="pointer-events-auto md:hidden rounded-full border border-white/10 p-2 text-white transition-colors hover:border-[var(--glacier)]/40 hover:text-[var(--glacier-glow)]"
            onClick={() => setIsMenuOpen((o) => !o)}
            type="button"
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Full-Screen Menu ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] flex flex-col bg-[var(--surface-0)] px-6 pt-6 pb-10 overflow-y-auto"
          >
            {/* Menu header */}
            <div className="flex items-center justify-between mb-14">
              <div className="flex items-center gap-2.5">
                <img src={POLAR_BEAR_LOGO} alt="Arctos Launchpad" className="h-8 w-8 object-contain" />
                <span className="font-sans text-sm font-bold uppercase tracking-[0.2em] text-white">
                  ARCTOS <span className="text-[var(--glacier-glow)]">LAUNCHPAD</span>
                </span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="rounded-full border border-white/10 p-2.5 text-white hover:border-[var(--glacier)]/40 hover:text-[var(--glacier-glow)] transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu links */}
            <div className="flex flex-col gap-2 flex-1">
              {[
                { label: 'Systems', id: 'systems' },
                { label: 'Work', id: 'work' },
                { label: 'Contact', id: 'contact' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="w-full text-left py-5 text-4xl font-heading font-bold text-white border-b border-white/[0.06] hover:text-[var(--glacier-glow)] transition-colors duration-150"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Menu card */}
            <div className="mt-10 rounded-2xl border border-white/[0.07] bg-[var(--surface-2)] p-5">
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-500 mb-1">
                Digital Infrastructure
              </div>
              <div className="text-white font-bold text-lg">ARCTOS LAUNCHPAD</div>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed font-light">
                Operational systems engineered for scale. Custom infrastructure. Full ownership.
              </p>
            </div>

            <button
              onClick={scrollToContact}
              className="mt-5 w-full rounded-full bg-[var(--glacier)] py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--surface-0)] hover:brightness-110 transition-all active:scale-[0.98]"
            >
              Start Your Infrastructure
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <main>
        <HeroSection scrollToContact={scrollToContact} onViewSystems={() => scrollTo('systems')} />

        <Marquee />

        <SystemsSection scrollToContact={scrollToContact} />

        <WhyCustomSection />

        <WorkflowSection />

        {/* ── Selected Systems / Arsenal ── */}
        <section id="work" className="relative w-full overflow-hidden border-t border-white/[0.05] bg-[var(--surface-1)] py-24 md:py-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(14,165,233,0.06),transparent)]" />

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mx-auto max-w-[1280px] px-6 mb-14"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-[var(--glacier-glow)]" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--glacier-glow)]">
                Showcase
              </span>
            </div>
            <h2 className="font-heading text-5xl font-extrabold tracking-[-0.04em] text-white md:text-7xl leading-none">
              <span className="text-slate-500">The</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--glacier-glow)] via-white to-[var(--frost)]">
                Arsenal
              </span>
            </h2>
            <p className="mt-6 max-w-xl font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500 font-bold border-l-2 border-[var(--glacier)] pl-4">
              Live systems — civic infrastructure, youth platforms, and flagship digital brands deployed in the wild.
            </p>
          </motion.div>

          <div className="relative z-10 mx-auto max-w-[1280px] px-4 md:px-6">
            <div className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-12">
              {featuredProjects[0] && (
                <ProjectWorkCard
                  project={featuredProjects[0]}
                  className="lg:col-span-7 min-h-[420px]"
                />
              )}
              {featuredProjects[1] && (
                <ProjectWorkCard
                  project={featuredProjects[1]}
                  className="lg:col-span-5 min-h-[420px]"
                />
              )}
              {otherProjects.map((p) => (
                <ProjectWorkCard key={p.id} project={p} className="lg:col-span-6 min-h-[340px]" />
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-16 text-center">
            <button
              type="button"
              onClick={scrollToContact}
              className="group inline-flex items-center gap-3 border border-white/12 bg-black/30 backdrop-blur-sm px-8 py-4 rounded-full font-mono text-[10px] uppercase tracking-[0.28em] text-white transition-all duration-200 hover:border-[var(--glacier)]/40 hover:bg-[var(--glacier)]/[0.06] hover:text-[var(--glacier-glow)]"
            >
              Request Full Case Studies
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        <TrustSection />

        {/* ── FAQ ── */}
        <section className="mx-auto max-w-[760px] px-6 py-20 md:py-24">
          <FaqSection items={FAQ_ITEMS} />
        </section>
      </main>

      {/* ── Global Contact Section ── */}
      <section
        id="contact"
        className="relative overflow-hidden border-t border-white/[0.05] bg-[var(--surface-1)] py-20 md:py-28"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(14,165,233,0.08),transparent)]" />
        <div className="max-w-[1280px] mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-[var(--glacier)]" />
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--glacier)]">Start here</p>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold text-white leading-[0.95] tracking-tight">
                Engineer your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--glacier-glow)] to-[var(--frost)]">
                  operational future.
                </span>
              </h2>
              <p className="mt-6 text-slate-400 text-base md:text-lg leading-relaxed max-w-md font-light">
                Book a free architecture discovery call. We'll map your operational needs, discuss
                system strategy, and confirm if ARCTOS is the right fit — no sales pitch, just
                expertise.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={scrollToContact}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--glacier)] px-6 py-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--surface-0)] transition-all hover:brightness-110 hover:shadow-[0_0_28px_rgba(14,165,233,0.35)] active:scale-[0.98]"
                >
                  Start Your Infrastructure <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo('systems')}
                  className="inline-flex items-center rounded-full border border-white/12 px-6 py-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 transition-all hover:border-[var(--glacier)]/30 hover:text-[var(--glacier-glow)]"
                >
                  View Our Systems
                </button>
              </div>

              <div className="mt-10 inline-flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-black/30 p-3 pr-6 backdrop-blur-sm">
                <div className="flex -space-x-2.5">
                  {[
                    'bg-[var(--glacier)]',
                    'bg-[var(--frost)]/60',
                    'bg-[var(--glacier-glow)]',
                  ].map((color, i) => (
                    <div key={i} className={`w-9 h-9 rounded-full ${color} border-2 border-[var(--surface-1)] opacity-80`} />
                  ))}
                </div>
                <div>
                  <span className="text-white font-bold text-sm block">Trusted by 50+ teams</span>
                  <span className="text-[var(--glacier-glow)] text-[10px] font-mono uppercase tracking-wider">
                    Canadian · Enterprise-Backed
                  </span>
                </div>
              </div>
            </div>

            <ContactForm />
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative border-t border-white/[0.06] bg-[var(--surface-0)] py-16 overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[var(--glacier)]/20 to-transparent" />
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-10 relative z-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img src={POLAR_BEAR_LOGO} alt="Arctos Launchpad" className="h-9 w-9 object-contain" />
              <span className="font-sans font-bold text-white text-lg uppercase tracking-[0.18em]">
                ARCTOS LAUNCHPAD
              </span>
            </div>
            <p className="max-w-xs text-slate-600 text-sm leading-relaxed font-light">
              Custom operational systems. Enterprise dashboards. AI automation. Digital infrastructure
              engineered for scale — owned by you.
            </p>
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-slate-700">
              Built in Canada
            </span>
          </div>

          <div className="flex gap-12 text-xs uppercase tracking-widest text-slate-600">
            <div className="flex flex-col gap-3">
              <span className="text-white font-bold text-[11px]">Navigate</span>
              <button onClick={() => scrollTo('systems')} className="text-left hover:text-[var(--glacier-glow)] transition-colors">Systems</button>
              <button onClick={() => scrollTo('work')} className="text-left hover:text-[var(--glacier-glow)] transition-colors">Work</button>
              <button onClick={scrollToContact} className="text-left hover:text-[var(--glacier-glow)] transition-colors">Contact</button>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-white font-bold text-[11px]">Socials</span>
              <a href="#" className="hover:text-[var(--glacier-glow)] transition-colors">Instagram</a>
              <a href="#" className="hover:text-[var(--glacier-glow)] transition-colors">LinkedIn</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-white font-bold text-[11px]">Legal</span>
              <a href="#" className="hover:text-[var(--glacier-glow)] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[var(--glacier-glow)] transition-colors">Terms</a>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-6 mt-12 pt-6 border-t border-white/[0.05] text-slate-700 font-mono text-[10px] uppercase tracking-[0.24em]">
          © {new Date().getFullYear()} ARCTOS LAUNCHPAD · Canadian Digital Infrastructure
        </div>
      </footer>
    </div>
  );
};

export default App;
