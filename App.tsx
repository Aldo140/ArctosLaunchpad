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

const BASE = import.meta.env.BASE_URL;
const POLAR_BEAR_LOGO = `${BASE}logo-no-text-2.png`;

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
    image: `${BASE}starlings-landing-desktop.webp`,
    imageMobile: `${BASE}starlings-landing-mobile.webp`,
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
    image: `${BASE}calgarywatch-landing-desktop.webp`,
    imageMobile: `${BASE}calgarywatch-landing-mobile.webp`,
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
    image: `${BASE}rioalto-landing-page-mobile.webp`,
    imageMobile: `${BASE}rioalto-photo-desk-mobile.webp`,
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
    image: `${BASE}mruhacks-landing-desktop.webp`,
    imageMobile: `${BASE}mruhacks-landing-mobile.webp`,
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
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden min-h-[260px] md:min-h-[320px] ${className}`}
      style={{
        backgroundImage: `url(${project.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(8,10,15,0.72)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.35s ease',
          zIndex: 1,
        }}
      />

      {/* Description — slides up on hover, sits above strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: '88px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '1.5rem',
          zIndex: 2,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
        }}
      >
        <p style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: '13px',
          lineHeight: 1.65,
          color: 'rgba(245,247,255,0.82)',
          fontWeight: 300,
          marginBottom: '0.75rem',
        }}>
          {project.description}
        </p>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {project.tags?.map(tag => (
            <span key={tag} style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ink-3)',
              border: '1px solid var(--border-2)',
              padding: '2px 6px',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Persistent bottom strip — always visible */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '88px',
          background: 'rgba(8,10,15,0.84)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '0 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '0.25rem',
          zIndex: 3,
        }}
      >
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          color: 'var(--ink-3)',
          margin: 0,
        }}>
          {project.type}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
            color: 'var(--ink)',
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}>
            {project.name}
          </h3>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--ink-2)',
              textDecoration: 'none',
              flexShrink: 0,
              transition: 'color 0.2s ease',
              marginLeft: '1rem',
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-2)')}
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
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              color: 'var(--ink-3)',
              flexShrink: 0,
            }}
          >
            {item}
          </span>
          <span
            className="flex-shrink-0"
            style={{ fontSize: 'clamp(1.25rem, 2vw, 2rem)', color: 'var(--accent)' }}
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
            className="h-9 w-auto object-contain"
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
                <img src={POLAR_BEAR_LOGO} alt="Arctos Launchpad" className="h-9 w-auto object-contain" />
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
                    key={featuredProjects[0].id}
                    project={featuredProjects[0]}
                    className="lg:col-span-7"
                  />
                )}
                {featuredProjects[1] && (
                  <ProjectWorkCard
                    key={featuredProjects[1].id}
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
          aria-labelledby="contact-heading"
          className="border-t border-[var(--border)]"
          style={{
            position: 'relative',
            backgroundImage: `url(${BASE}header-for-socials.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark gradient overlay */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(8,10,15,0.55) 0%, rgba(8,10,15,0.75) 60%, rgba(8,10,15,0.95) 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* 2-column grid — heading left, form right */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              maxWidth: 1280,
              margin: '0 auto',
              padding: 'clamp(5rem, 10vw, 8rem) clamp(1.25rem, 5vw, 3.5rem) clamp(5rem, 10vw, 8rem)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* Left column — eyebrow + heading + copy + CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--ink-2)] mb-4">
                  08 / Start here
                </p>
                <h2
                  id="contact-heading"
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontWeight: 300,
                    fontSize: 'clamp(3.5rem,6vw,7rem)',
                    lineHeight: 0.95,
                    letterSpacing: '-0.02em',
                    color: 'var(--ink)',
                    margin: 0,
                  }}
                >
                  Engineer your
                  <span
                    style={{
                      display: 'block',
                      fontStyle: 'italic',
                      color: 'var(--acid)',
                    }}
                  >
                    operational future.
                  </span>
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
              </motion.div>

              {/* Right column — contact form */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <ContactForm />
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg)] py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <img src={POLAR_BEAR_LOGO} alt="Arctos Launchpad" className="h-12 w-auto object-contain" />
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
