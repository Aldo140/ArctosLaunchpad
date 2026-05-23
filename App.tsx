/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLenisGsap } from './hooks/useLenisGsap';
import { Menu, X } from 'lucide-react';
import ContactForm from './components/ContactForm';
import AIChat from './components/AIChat';
import FaqSection from './components/FaqSection';
import HeroSection from './components/HeroSection';
import SystemsSection from './components/SystemsSection';
import WhyCustomSection from './components/WhyCustomSection';
import WorkflowSection from './components/WorkflowSection';
import TrustSection from './components/TrustSection';
import { FAQ_ITEMS } from './lib/siteContent';
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
    imageMobile: '/starlings-landing-mobile.webp',
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
    imageMobile: '/calgarywatch-landing-mobile.webp',
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
    image: '/rioalto-landing-page-mobile.webp',
    imageMobile: '/rioalto-photo-desk-mobile.webp',
    mobileOnly: true,
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
    imageMobile: '/mruhacks-landing-mobile.webp',
    tags: ['Events', 'Scale', 'React'],
  },
];

// ─── Text scramble ─────────────────────────────────────────────────────────────

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const useScramble = (text: string) => {
  const [display, setDisplay] = useState(text);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const trigger = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    let step = 0;
    const total = 20;
    timerRef.current = setInterval(() => {
      const progress = step / total;
      setDisplay(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i / text.length < progress) return char;
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join('')
      );
      step++;
      if (step > total) {
        clearInterval(timerRef.current!);
        setDisplay(text);
      }
    }, 36);
  }, [text]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return { display, trigger };
};

// ─── Project Work Card ─────────────────────────────────────────────────────────

const ProjectWorkCard: React.FC<{ project: Project; className?: string }> = ({
  project,
  className = '',
}) => {
  const href = projectHref(project);
  const hasDesktop = project.imageMobile && project.image !== project.imageMobile;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className={`group flex flex-col overflow-hidden border border-[var(--border)] bg-[var(--bg-1)] ${className}`}
    >
      {/* ── Screenshot area ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: '#080809', minHeight: '240px' }}
      >
        {project.mobileOnly ? (
          /* Mobile-only layout: two portrait screens side by side */
          <div className="flex items-end justify-center gap-4 px-8 pt-6 h-full" style={{ minHeight: '240px' }}>
            <div className="overflow-hidden shadow-xl transition-transform duration-700 ease-out group-hover:scale-[1.02]" style={{ width: '38%', maxWidth: '140px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <img src={project.image} alt={`${project.name} screen 1`} className="w-full h-auto block" loading="lazy" />
            </div>
            {project.imageMobile && (
              <div className="overflow-hidden shadow-xl transition-transform duration-700 ease-out group-hover:scale-[1.02]" style={{ width: '38%', maxWidth: '140px', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '1rem' }}>
                <img src={project.imageMobile} alt={`${project.name} screen 2`} className="w-full h-auto block" loading="lazy" />
              </div>
            )}
          </div>
        ) : (
          /* Desktop + mobile layout: full-width desktop with portrait overlay */
          <div className="relative flex items-center justify-center" style={{ padding: '1.5rem 1.5rem 0' }}>
            <img
              src={project.image}
              alt={`${project.name} desktop`}
              className="w-full h-auto object-contain block transition-transform duration-700 ease-out group-hover:scale-[1.015]"
              style={{ maxHeight: '260px', objectPosition: 'top center' }}
              loading="lazy"
            />
            {project.imageMobile && (
              <div
                className="absolute bottom-0 right-5 overflow-hidden shadow-[0_-8px_28px_rgba(0,0,0,0.7)]"
                style={{ width: '76px', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <img src={project.imageMobile} alt={`${project.name} mobile`} className="w-full h-auto block" loading="lazy" />
              </div>
            )}
          </div>
        )}

        {/* Device label pills */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {project.mobileOnly ? (
            <span
              className="font-mono text-[8px] uppercase tracking-[0.14em] px-1.5 py-0.5"
              style={{ background: 'rgba(237,232,223,0.04)', border: '1px solid rgba(237,232,223,0.1)', color: 'var(--ink-3)' }}
            >
              Mobile
            </span>
          ) : (
            <>
              <span
                className="font-mono text-[8px] uppercase tracking-[0.14em] px-1.5 py-0.5"
                style={{ background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.2)', color: 'var(--acid)' }}
              >
                Desktop
              </span>
              {project.imageMobile && (
                <span
                  className="font-mono text-[8px] uppercase tracking-[0.14em] px-1.5 py-0.5"
                  style={{ background: 'rgba(237,232,223,0.04)', border: '1px solid rgba(237,232,223,0.1)', color: 'var(--ink-3)' }}
                >
                  Mobile
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Project info ── */}
      <div className="flex flex-col p-6 md:p-7 flex-1">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-2)]">
          {project.type}
        </p>
        <h3
          className="mt-2 font-heading font-normal text-[var(--ink)] leading-tight"
          style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}
        >
          {project.name}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-2)] line-clamp-2 font-light flex-1">
          {project.description}
        </p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {project.tags?.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[8px] uppercase tracking-[0.12em]"
                style={{
                  color: 'var(--ink-3)',
                  border: '1px solid var(--border-2)',
                  padding: '2px 6px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-2)] hover:text-[var(--acid)] transition-colors duration-200 whitespace-nowrap"
          >
            View →
          </a>
        </div>
      </div>
    </motion.article>
  );
};

// ─── Marquee ──────────────────────────────────────────────────────────────────

const MARQUEE_ITEMS = [
  'Custom Infrastructure',
  'AI Automation',
  'Data Sovereignty',
  'Enterprise Systems',
  'Canadian Technology',
  'Full Ownership',
];

const Marquee: React.FC = () => (
  <div className="relative overflow-x-hidden border-y border-[var(--border)] bg-[var(--bg-1)] py-6 md:py-8">
    <div className="absolute inset-0 z-10 bg-gradient-to-r from-[var(--bg-1)] via-transparent to-[var(--bg-1)] pointer-events-none" />
    <motion.div
      className="flex whitespace-nowrap items-center"
      style={{ gap: '4rem' }}
      animate={{ x: [0, -2400] }}
      transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
    >
      {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
        <React.Fragment key={i}>
          <span
            className="font-heading italic font-normal flex-shrink-0"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', color: 'var(--ink-3)' }}
          >
            {item}
          </span>
          <span
            className="flex-shrink-0"
            style={{ fontSize: 'clamp(1.25rem, 2vw, 2rem)', color: 'var(--acid)' }}
          >
            ·
          </span>
        </React.Fragment>
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
  const [chapter, setChapter] = useState('');
  const isMobile = useIsMobile();
  const { display: logoText, trigger: scrambleLogo } = useScramble('ARCTOS LAUNCHPAD');

  useLenisGsap(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scramble logo text whenever the nav state flips
  useEffect(() => { scrambleLogo(); }, [scrolled]);

  useEffect(() => {
    document.documentElement.style.overflow = isMenuOpen ? 'hidden' : '';
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Section chapter indicator
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-chapter]');
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setChapter(entry.target.getAttribute('data-chapter') ?? '');
            break;
          }
        }
      },
      { threshold: 0.25 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const scrollToContact = () => scrollTo('contact');
  const featuredProjects = PROJECTS.filter((p) => p.featured);
  const otherProjects = PROJECTS.filter((p) => !p.featured);

  return (
    <div className="min-h-screen text-[var(--ink)] font-sans selection:bg-[var(--acid)] selection:text-white overflow-x-hidden bg-[var(--bg)]">
      <div className="fixed inset-0 -z-10 bg-[var(--bg)]" />

      {!isMobile && <AIChat />}

      {/* ── Section chapter indicator — bottom-left ── */}
      <AnimatePresence mode="wait">
        {chapter && (
          <motion.div
            key={chapter}
            initial={{ opacity: 0, filter: 'blur(6px)', y: 6 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            exit={{ opacity: 0, filter: 'blur(6px)', y: -6 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-7 left-7 z-40 pointer-events-none hidden md:block"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--ink-3)',
            }}
          >
            {chapter}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Nav ── */}
      <nav className="fixed left-0 right-0 top-0 z-50 flex h-16 md:h-20 items-center justify-between px-6 md:px-10">

        {/* Dark frosted-glass panel */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: scrolled ? 1 : 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: 'rgba(15, 20, 25, 0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', transformOrigin: 'top' }}
        />

        {/* Bottom border — appears with white panel */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: scrolled ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          style={{ background: 'rgba(255, 255, 255, 0.08)' }}
        />

        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer relative z-10"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          onMouseEnter={scrambleLogo}
        >
          <img
            src={POLAR_BEAR_LOGO}
            alt="Arctos Launchpad"
            className="h-16 w-16 object-contain"
            style={{
              filter: 'none',
              transition: 'filter 0.4s ease',
            }}
          />
          <span
            className="font-mono text-[10px] uppercase hidden sm:block"
            style={{
              letterSpacing: '0.2em',
              color: 'var(--ink)',
              transition: 'color 0.4s ease',
            }}
          >
            {logoText}
          </span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 relative z-10">
          {[
            { label: 'Systems', id: 'systems' },
            { label: 'Work', id: 'work' },
            { label: 'Contact', id: 'contact' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="font-mono text-[10px] uppercase tracking-[0.14em]"
              style={{
                color: 'var(--ink-2)',
                transition: 'color 0.4s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <button
          onClick={scrollToContact}
          className="hidden md:inline-flex items-center px-5 py-2.5 rounded-none font-mono text-[10px] font-medium uppercase tracking-[0.14em] relative z-10 hover:opacity-85"
          style={{
            backgroundColor: 'var(--acid)',
            color: '#ffffff',
            transition: 'background-color 0.4s ease, color 0.4s ease',
          }}
        >
          Start Your Infrastructure
        </button>

        {/* Mobile hamburger */}
        <button
          className="md:hidden relative z-10"
          style={{
            color: 'var(--ink-2)',
            transition: 'color 0.4s ease',
          }}
          onClick={() => setIsMenuOpen((o) => !o)}
          type="button"
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>

      {/* ── Mobile Full-Screen Menu ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex flex-col bg-[var(--bg)] px-6 pt-6 pb-10 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <img src={POLAR_BEAR_LOGO} alt="Arctos Launchpad" className="h-16 w-16 object-contain" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink)]">
                  ARCTOS LAUNCHPAD
                </span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col flex-1">
              {[
                { label: 'Systems', id: 'systems' },
                { label: 'Work', id: 'work' },
                { label: 'Contact', id: 'contact' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="w-full text-left py-5 font-heading font-normal text-[var(--ink)] border-b border-[var(--border)] hover:text-[var(--acid)] transition-colors duration-150"
                  style={{ fontSize: 'clamp(3rem,10vw,5rem)' }}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-10">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink-3)] mb-5">
                Custom infrastructure. AI automation. Full ownership.
              </p>
              <button
                onClick={scrollToContact}
                className="w-full bg-[var(--acid)] py-4 rounded-none font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#09090A] hover:opacity-85 transition-opacity"
              >
                Start Your Infrastructure
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <main>
        <div data-chapter="§ 01 / HERO">
          <HeroSection scrollToContact={scrollToContact} onViewSystems={() => scrollTo('systems')} />
        </div>

        <Marquee />

        <div data-chapter="§ 02 / SYSTEMS" id="systems">
          <SystemsSection scrollToContact={scrollToContact} />
        </div>

        <div data-chapter="§ 03 / THE CASE">
          <WhyCustomSection />
        </div>

        <div data-chapter="§ 04 / PROCESS">
          <WorkflowSection />
        </div>

        {/* ── Selected Work / Arsenal ── */}
        <div data-chapter="§ 05 / WORK">
          <section id="work" className="w-full border-t border-[var(--border)] bg-[var(--bg-1)] py-24 md:py-28">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto max-w-[1280px] px-6 mb-14"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--ink-2)] mb-4">
                04 / Selected Work
              </p>
              <h2
                className="font-heading font-light text-[var(--ink)] leading-none"
                style={{ fontSize: 'clamp(3rem,6vw,6rem)' }}
              >
                <span className="text-[var(--ink-3)]">The</span>{' '}
                <span>Arsenal</span>
              </h2>
            </motion.div>

            <div className="mx-auto max-w-[1280px] px-4 md:px-6">
              <div className="grid grid-cols-1 gap-px lg:grid-cols-12" style={{ background: 'var(--border)' }}>
                {featuredProjects[0] && (
                  <ProjectWorkCard
                    project={featuredProjects[0]}
                    className="lg:col-span-7"
                  />
                )}
                {featuredProjects[1] && (
                  <ProjectWorkCard
                    project={featuredProjects[1]}
                    className="lg:col-span-5"
                  />
                )}
                {otherProjects.map((p) => (
                  <ProjectWorkCard
                    key={p.id}
                    project={p}
                    className="lg:col-span-6"
                  />
                ))}
              </div>
            </div>

            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={scrollToContact}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors duration-200"
              >
                See all case studies →
              </button>
            </div>
          </section>
        </div>

        <div data-chapter="§ 06 / PROOF">
          <TrustSection />
        </div>

        <div data-chapter="§ 07 / FAQ">
          <FaqSection items={FAQ_ITEMS} />
        </div>
      </main>

      {/* ── Contact ── */}
      <div data-chapter="§ 08 / CONTACT">
        <section
          id="contact"
          className="border-t border-[var(--border)] bg-[var(--bg)] py-20 md:py-28"
        >
          <div className="max-w-[1280px] mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start"
            >
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--ink-2)] mb-4">
                  08 / Start here
                </p>
                <h2
                  className="font-heading font-light text-[var(--ink)]"
                  style={{ fontSize: 'clamp(3.5rem,6vw,7rem)', lineHeight: 0.95, letterSpacing: '-0.02em' }}
                >
                  Engineer your
                  <span className="block italic" style={{ color: 'var(--acid)' }}>operational future.</span>
                </h2>
                <p className="mt-6 text-[15px] text-[var(--ink-2)] leading-relaxed max-w-md font-light">
                  Book a free architecture discovery call. We'll map your operational needs, discuss
                  system strategy, and confirm if ARCTOS is the right fit — no sales pitch, just
                  expertise.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={scrollToContact}
                    className="inline-flex items-center gap-2 rounded-none bg-[var(--acid)] px-6 py-3.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#09090A] transition-opacity hover:opacity-85"
                  >
                    Start Your Infrastructure
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollTo('systems')}
                    className="inline-flex items-center rounded-none border border-[var(--border-2)] px-6 py-3.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]"
                  >
                    View Our Systems
                  </button>
                </div>
                <div className="mt-10">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink-3)]">
                    <span className="text-[var(--acid)]">●</span>
                    {' '}Trusted by 50+ Canadian enterprises
                  </span>
                </div>
              </div>
              <ContactForm />
            </motion.div>
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg)] py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <img src={POLAR_BEAR_LOGO} alt="Arctos Launchpad" className="h-16 w-16 object-contain" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink)]">
                  ARCTOS LAUNCHPAD
                </span>
              </div>
              <p className="max-w-xs text-[13px] text-[var(--ink-2)] leading-relaxed font-light">
                Custom operational systems. Enterprise dashboards. AI automation. Digital infrastructure
                engineered for scale — owned by you.
              </p>
            </div>

            <div className="flex gap-12 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-2)]">
              <div className="flex flex-col gap-3">
                <span className="text-[var(--ink)] text-[10px] font-medium">Navigate</span>
                <button onClick={() => scrollTo('systems')} className="text-left hover:text-[var(--ink)] transition-colors">Systems</button>
                <button onClick={() => scrollTo('work')} className="text-left hover:text-[var(--ink)] transition-colors">Work</button>
                <button onClick={scrollToContact} className="text-left hover:text-[var(--ink)] transition-colors">Contact</button>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[var(--ink)] text-[10px] font-medium">Social</span>
                <a href="#" className="hover:text-[var(--ink)] transition-colors">Instagram</a>
                <a href="#" className="hover:text-[var(--ink)] transition-colors">LinkedIn</a>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[var(--ink)] text-[10px] font-medium">Legal</span>
                <a href="#" className="hover:text-[var(--ink)] transition-colors">Privacy</a>
                <a href="#" className="hover:text-[var(--ink)] transition-colors">Terms</a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-[var(--ink-3)]">
              © {new Date().getFullYear()} ARCTOS LAUNCHPAD
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-[var(--ink-3)]">
              Built in Canada
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
