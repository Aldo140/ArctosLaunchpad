/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate, useMotionValue, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, Code, Layers, Layout, Smartphone, Lock, Globe, Zap, Menu, X, ChevronRight, Star, Search } from 'lucide-react';
import FluidBackground from './components/FluidBackground';
import ContactForm from './components/ContactForm';
import CustomCursor from './components/CustomCursor';
import AIChat from './components/AIChat';
import { Project, ViewState } from './types';

// Data
const PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Rio Alto',
    type: 'Restaurant Experience',
    url: 'rioalto.ca',
    description: 'Custom static site. 99/100 Google Lighthouse score. Zero monthly fees.',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '2',
    name: "Khoi's Creation",
    type: 'E-Commerce Brand',
    url: 'khoiscreation.ca',
    description: 'Wix integration for client self-management. Clean, brand-focused design.',
    image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'MRU Hacks',
    type: 'University Event',
    url: 'mruhacks.ca',
    description: 'High-traffic registration portal. Scalable architecture for 500+ users.',
    image: 'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?q=80&w=1000&auto=format&fit=crop'
  }
];

const HERO_IMAGE = `${import.meta.env.BASE_URL}calgs.jpg`;

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const menuVariants = {
  closed: { opacity: 0, x: "100%" },
  open: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
};

// --- Spotlight Card Component ---
const SpotlightCard = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-slate-800 bg-slate-900 overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(6,182,212,0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

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
  const [view, setView] = useState<ViewState>('home');
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion() || isMobile;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      return;
    }
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMenuOpen]);

  const navigateTo = (newView: ViewState) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView(newView);
    setIsMenuOpen(false);
  };

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900 overflow-x-hidden">
      <FluidBackground reduceMotion={reduceMotion} />
      <CustomCursor enabled={!reduceMotion} />
      {!isMobile && <AIChat />}
      
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-indigo-600 z-[60] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 py-3 md:py-4 shadow-2xl' : 'bg-transparent py-6 md:py-8'}`}>
        <div className={`${scrolled ? 'w-full px-6 md:px-10' : 'max-w-7xl mx-auto px-6'} flex items-center justify-between`}>
          <div 
            onClick={() => navigateTo('home')} 
            className="font-heading text-xl md:text-2xl font-bold tracking-tighter text-white cursor-pointer flex items-center gap-3 group relative z-50 transition-transform duration-500"
          >
            <div className="w-9 h-9 bg-white text-black flex items-center justify-center rounded-sm shadow-lg group-hover:scale-105 transition-all duration-300">
              <Layers className="w-5 h-5" />
            </div>
            <span className="tracking-widest mix-blend-difference font-mono text-xs md:text-sm">BASE<span className="text-cyan-400">LAYER</span></span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-8 text-xs font-bold tracking-widest uppercase">
              <button onClick={() => navigateTo('home')} className={`relative hover:text-cyan-400 transition-colors ${view === 'home' ? 'text-cyan-400' : 'text-slate-400'}`}>
                Work
                {view === 'home' && <motion.div layoutId="navIndicator" className="absolute -bottom-2 left-0 right-0 h-0.5 bg-cyan-400" />}
              </button>
              <button onClick={() => navigateTo('services')} className={`relative hover:text-cyan-400 transition-colors ${view === 'services' ? 'text-cyan-400' : 'text-slate-400'}`}>
                Services
                {view === 'services' && <motion.div layoutId="navIndicator" className="absolute -bottom-2 left-0 right-0 h-0.5 bg-cyan-400" />}
              </button>
            </div>
            <button 
              onClick={scrollToContact}
              className="bg-white text-slate-900 px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-cyan-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Start Project
            </button>
          </div>

          {/* Mobile Nav Toggle */}
          <button 
            className="md:hidden relative z-50 text-white p-2 hover:text-cyan-400 transition-colors"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

      </nav>

      {/* Mobile Full Screen Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed left-0 top-0 w-screen h-[100dvh] z-[100] bg-[#0b1220]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(8,12,22,0.92) 0%, rgba(10,15,26,0.96) 55%, rgba(11,18,32,1) 100%), url(${HERO_IMAGE})`,
                }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(60,90,150,0.18),transparent_45%),radial-gradient(circle_at_90%_0%,rgba(95,140,170,0.12),transparent_40%)] pointer-events-none"></div>
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 pointer-events-none"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="fixed left-0 top-0 w-screen h-[100dvh] z-[110] flex flex-col p-6 overflow-y-auto"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white font-bold text-lg">
                  <div className="w-9 h-9 bg-white text-black flex items-center justify-center rounded-sm">
                    <Layers className="w-5 h-5" />
                  </div>
                  BaseLayer
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full border border-white/15 w-12 h-12 flex items-center justify-center text-white hover:text-slate-200 hover:border-white/40 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative z-10 mt-12 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-slate-200/70">Navigation</div>
                  <div className="flex flex-col gap-3">
                    <button onClick={() => navigateTo('home')} className="w-full text-left text-4xl font-heading font-bold text-white hover:text-slate-200 transition-colors">
                      Work
                    </button>
                    <button onClick={() => navigateTo('services')} className="w-full text-left text-4xl font-heading font-bold text-white hover:text-slate-200 transition-colors">
                      Services
                    </button>
                    <button onClick={scrollToContact} className="w-full text-left text-4xl font-heading font-bold text-white hover:text-slate-200 transition-colors">
                      Contact
                    </button>
                  </div>
                </div>

                <div className="mt-10 rounded-3xl border border-white/10 bg-[#0f172a]/80 p-5">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-slate-300/70">Signature</div>
                  <div className="text-white font-bold text-lg mt-2">BaseLayer Studio</div>
                  <p className="text-slate-300 text-sm mt-2">Custom-built digital assets for founders who care about ownership.</p>
                  <div className="mt-4 text-[11px] uppercase tracking-[0.3em] text-slate-300/60">Calgary · Remote</div>
                </div>

                <button 
                  onClick={scrollToContact}
                  className="mt-6 bg-slate-200 text-slate-950 px-10 py-5 rounded-full text-lg font-bold uppercase tracking-widest w-full shadow-[0_0_40px_rgba(148,163,184,0.2)]"
                >
                  Start Project
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="overflow-x-hidden">
        <AnimatePresence mode="wait">
          {view === 'home' ? (
            isMobile ? (
              <MobileLandingPage
                key="mobile-landing"
                onLearnMore={() => navigateTo('services')}
                scrollToContact={scrollToContact}
              />
            ) : (
              <LandingPage
                key="landing"
                onLearnMore={() => navigateTo('services')}
                scrollToContact={scrollToContact}
                reduceMotion={reduceMotion}
                isMobile={isMobile}
              />
            )
          ) : (
            <ServicesPage key="services" scrollToContact={scrollToContact} />
          )}
        </AnimatePresence>

        {/* Global Contact Section */}
        <section id="contact" className="relative py-20 md:py-32 bg-slate-950 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%)]" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start"
            >
              <div className="relative">
                <h2 className="text-4xl sm:text-5xl md:text-8xl font-heading font-bold mb-8 text-white leading-[0.85] tracking-tight">
                  LET'S <br/><span className="text-cyan-400">BUILD.</span>
                </h2>
                <p className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed max-w-md">
                  No sales scripts. Just a developer who knows how to make you look good online.
                </p>
                
                <div className="inline-flex items-center gap-4 bg-slate-900/50 p-2 pr-6 rounded-full border border-slate-800 backdrop-blur-md">
                  <div className="flex -space-x-3">
                     {[1,2,3].map(i => (
                       <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[10px] text-slate-500 font-bold">Client</div>
                     ))}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">Trusted by 20+ Clients</span>
                    <span className="text-cyan-400 text-xs">Calgary & Remote</span>
                  </div>
                </div>
              </div>
              <ContactForm />
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-20 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center md:items-end gap-10 text-center md:text-left text-slate-500 text-xs uppercase tracking-widest relative z-10">
          <div className="flex flex-col gap-4 items-center md:items-start">
            <div className="flex items-center gap-3 font-bold text-white text-2xl">
              <Layers className="w-8 h-8 text-cyan-500" />
              BaseLayer Studio
            </div>
            <p className="max-w-xs text-slate-400 normal-case leading-relaxed">
              Premium digital assets for businesses that value ownership and performance.
            </p>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-4 items-center md:items-start">
               <span className="text-white font-bold">Socials</span>
               <a href="#" className="hover:text-cyan-400 transition-colors">Instagram</a>
               <a href="#" className="hover:text-cyan-400 transition-colors">LinkedIn</a>
            </div>
            <div className="flex flex-col gap-4 items-center md:items-start">
               <span className="text-white font-bold">Legal</span>
               <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
               <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-900 text-center md:text-left text-slate-700">
           © {new Date().getFullYear()} BaseLayer Studio. Made in Calgary.
        </div>
      </footer>
    </div>
  );
};

// --- Marquee Component ---
const Marquee: React.FC<{ reduceMotion?: boolean }> = ({ reduceMotion = false }) => {
  if (reduceMotion) {
    return (
      <div className="relative flex overflow-x-hidden bg-slate-950 border-y border-slate-900 py-6 md:py-8 my-16">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 z-10 pointer-events-none" />
        <div className="flex gap-10 md:gap-16 whitespace-nowrap items-center px-6">
          <span className="text-xl md:text-4xl font-heading font-bold text-slate-800 uppercase tracking-widest flex items-center gap-4">
            Strategy <Star className="w-4 h-4 md:w-6 md:h-6 text-cyan-900 fill-cyan-900" />
          </span>
          <span className="text-xl md:text-4xl font-heading font-bold text-slate-700 uppercase tracking-widest flex items-center gap-4">
            Design <Star className="w-4 h-4 md:w-6 md:h-6 text-cyan-900 fill-cyan-900" />
          </span>
          <span className="text-xl md:text-4xl font-heading font-bold text-white uppercase tracking-widest flex items-center gap-4">
            Development <Star className="w-4 h-4 md:w-6 md:h-6 text-cyan-500 fill-cyan-500" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex overflow-x-hidden bg-slate-950 border-y border-slate-900 py-6 md:py-8 my-20">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 z-10 pointer-events-none" />
      <motion.div 
        className="flex gap-16 md:gap-32 whitespace-nowrap items-center"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      >
        {[1,2,3,4,5,6,7,8].map((_, i) => (
          <React.Fragment key={i}>
            <span className="text-2xl md:text-5xl font-heading font-bold text-slate-800 uppercase tracking-widest flex items-center gap-8">
              Strategy <Star className="w-4 h-4 md:w-8 md:h-8 text-cyan-900 fill-cyan-900" />
            </span>
            <span className="text-2xl md:text-5xl font-heading font-bold text-slate-700 uppercase tracking-widest flex items-center gap-8">
              Design <Star className="w-4 h-4 md:w-8 md:h-8 text-cyan-900 fill-cyan-900" />
            </span>
             <span className="text-2xl md:text-5xl font-heading font-bold text-white uppercase tracking-widest flex items-center gap-8">
              Development <Star className="w-4 h-4 md:w-8 md:h-8 text-cyan-500 fill-cyan-500" />
            </span>
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  )
}

// --- Sub-Views ---

const MobileLandingPage: React.FC<{ onLearnMore: () => void, scrollToContact: () => void }> = ({
  onLearnMore,
  scrollToContact,
}) => {
  const projects = PROJECTS.slice(0, 2);

  return (
    <div className="w-full bg-[#0a0f1e] text-slate-100">
      {/* Mobile Hero */}
      <section className="relative min-h-[82vh] pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Calgary Tower skyline at sunset"
            className="w-full h-full object-cover opacity-40"
            loading="eager"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,22,0.45)_0%,rgba(9,14,25,0.88)_55%,rgba(10,15,26,1)_100%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(66,85,140,0.18),transparent_55%),radial-gradient(circle_at_85%_0%,rgba(120,170,210,0.08),transparent_45%)]"></div>
        </div>
        <div className="absolute -top-10 -right-12 w-64 h-64 rounded-full bg-slate-400/10 blur-[100px] mobile-orbit"></div>
        <div className="absolute bottom-10 -left-12 w-52 h-52 rounded-full bg-indigo-300/10 blur-[110px] mobile-orbit"></div>
        <div className="absolute inset-0 opacity-20 mobile-pulse bg-[radial-gradient(circle_at_70%_30%,rgba(56,92,150,0.22),transparent_40%)]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#0a0f1e]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#0a0f1e]"></div>

        <div className="relative z-10 px-6">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-slate-300/20 bg-white/5 backdrop-blur-md text-[11px] font-bold uppercase tracking-[0.28em] text-slate-200 shadow-[0_0_18px_rgba(148,163,184,0.15)]">
            <span className="w-2 h-2 bg-slate-200 rounded-full shadow-[0_0_10px_rgba(148,163,184,0.6)]" />
            Mobile‑First Studio
          </div>

          <h1 className="text-4xl leading-tight font-heading font-bold text-white tracking-tight">
            DIGITAL ASSETS
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-white to-slate-200">
              BUILT TO OWN
            </span>
          </h1>

          <p className="mt-4 text-base text-slate-300 leading-relaxed max-w-md">
            High-performance websites that load fast, rank well, and stay yours forever.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={scrollToContact}
              className="w-full px-6 py-4 bg-slate-200 text-slate-950 text-sm font-bold uppercase tracking-widest rounded-full shadow-[0_10px_24px_rgba(148,163,184,0.2)]"
            >
              Start a Project
            </button>
            <button
              onClick={onLearnMore}
              className="w-full px-6 py-4 border border-white/15 text-white text-sm font-bold uppercase tracking-widest rounded-full bg-white/5"
            >
              View Services
            </button>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Speed", value: "99/100" },
              { label: "Clients", value: "20+" },
              { label: "Launch", value: "2-3 wks" }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/8 to-white/5 backdrop-blur-md py-3">
                <div className="text-white font-bold text-sm">{item.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-slate-300/70">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-[#0f172a]/70 p-4 backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-[0.35em] text-slate-300/70">Signal Stack</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Performance", "SEO", "Conversion", "Design System", "Ownership"].map((pill) => (
                <span key={pill} className="text-[11px] uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 text-slate-200/90 bg-white/5">
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Logic Strip */}
      <section className="px-6 py-12 bg-gradient-to-b from-[#0a0f1e] via-[#0c1833] to-[#0a0f1e] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(125,211,252,0.08),transparent_50%)]"></div>
        <h2 className="text-2xl font-heading font-bold text-white mb-4">Why it hits.</h2>
        <div className="grid grid-cols-1 gap-4 relative">
          {[
            { title: "Instant load", text: "Static delivery + minimal bloat = speed on any network." },
            { title: "Own the asset", text: "No platforms, no monthly lock-in, no surprises." },
            { title: "Conversion first", text: "Clear hierarchy and CTA placement built for mobile." }
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-[#0f172a]/80 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.4)]">
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-300/70">Edge</div>
              <h3 className="text-white font-bold text-base mt-2">{item.title}</h3>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile Showcase Rail */}
      <section className="px-6 py-12 bg-[#0b1324]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-heading font-bold text-white">The Feel</h2>
          <span className="text-[10px] uppercase tracking-[0.3em] text-sky-200/60">Swipe</span>
        </div>
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [-webkit-overflow-scrolling:touch]">
          {[
            { title: "Cinematic Hero", text: "Depth, contrast, and clarity." },
            { title: "Glass UI", text: "Layered cards with subtle glow." },
            { title: "Fast by Default", text: "No heavy motion on mobile." }
          ].map((item) => (
            <div key={item.title} className="min-w-[70%] snap-center rounded-3xl border border-white/10 bg-[#0f1a31]/80 p-5 mobile-sheen bg-[linear-gradient(120deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02),rgba(255,255,255,0.06))]">
              <div className="text-[11px] uppercase tracking-[0.3em] text-sky-200/70">Module</div>
              <div className="text-white font-bold text-lg mt-2">{item.title}</div>
              <div className="text-slate-300 text-sm mt-2">{item.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile Work */}
      <section className="px-6 py-12 bg-[#0b1324]">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-3xl font-heading font-bold text-white">Selected Work</h2>
        </div>
        <div className="flex flex-col gap-6">
          {projects.map((project) => (
            <div key={project.id} className="rounded-3xl border border-sky-400/15 overflow-hidden bg-[#0d1b33]/70 shadow-[0_18px_40px_rgba(59,130,246,0.12)]">
              <div className="relative">
                <img
                  src={project.image.replace('w=1000', 'w=800')}
                  alt={project.name}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071329]/85 via-[#071329]/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="text-[11px] uppercase tracking-widest text-sky-200 font-mono">
                    {project.type}
                  </div>
                  <div className="text-xl font-heading font-bold text-white">{project.name}</div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-300 leading-relaxed">{project.description}</p>
                <a
                  href={`https://${project.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-200"
                >
                  Visit site <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile Process */}
      <section className="px-6 py-12 bg-gradient-to-b from-[#0b1324] via-[#0c1730] to-[#0b1324]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-heading font-bold text-white">Process</h2>
          <span className="text-[10px] uppercase tracking-[0.3em] text-sky-200/60">4 Steps</span>
        </div>
        <div className="grid gap-4">
          {[
            { step: "01", title: "Strategy Sprint", text: "Clear goals, user flows, and quick wins." },
            { step: "02", title: "Design System", text: "Mobile-first layout, typography, and rhythm." },
            { step: "03", title: "Build + Optimize", text: "Fast code, SEO, and performance polish." },
            { step: "04", title: "Launch + Handoff", text: "Ship, train, and support if needed." }
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-white/10 bg-[#0d1a32]/80 p-5 flex gap-4">
              <div className="text-sky-200/60 text-xs font-mono tracking-[0.3em]">{item.step}</div>
              <div>
                <div className="text-white font-bold text-base">{item.title}</div>
                <div className="text-slate-300 text-sm mt-2">{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile Services */}
      <section className="px-6 py-12 bg-gradient-to-b from-[#0b1324] via-[#0e1b36] to-[#0b1324]">
        <h2 className="text-3xl font-heading font-bold text-white mb-6">Services</h2>
        <div className="grid gap-4">
          {[
            { title: "Custom Static Site", desc: "Fast, secure, and fully owned. The flagship." },
            { title: "Wix / Editor X", desc: "Editable by you. We design, you manage." },
            { title: "Web App", desc: "Dashboards, portals, booking systems, and APIs." }
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-sky-400/15 bg-[#0d1b33]/70 p-5 shadow-[0_12px_24px_rgba(59,130,246,0.12)]">
              <div className="text-white font-bold text-base">{item.title}</div>
              <div className="text-slate-300 text-sm mt-2">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile Proof */}
      <section className="px-6 py-12 bg-[#0b1324]">
        <div className="rounded-3xl border border-white/10 bg-[#0f1a31]/80 p-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-sky-200/70">Proof</div>
          <h3 className="text-2xl font-heading font-bold text-white mt-2">Trusted by founders who care about speed.</h3>
          <div className="mt-4 flex items-center gap-3">
            {[1,2,3].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-[#1a2743] border border-white/10"></div>
            ))}
            <div className="text-slate-300 text-sm">20+ clients · Calgary + Remote</div>
          </div>
        </div>
      </section>

      {/* Mobile CTA */}
      <section className="px-6 py-16 bg-[#0b1324]">
        <div className="rounded-[28px] border border-sky-300/30 bg-gradient-to-br from-[#1a2b4a] via-[#0d1b33] to-[#0b1324] p-6 shadow-[0_18px_50px_rgba(59,130,246,0.16)]">
          <div className="text-sm uppercase tracking-widest text-sky-200 font-mono">Let’s build</div>
          <h3 className="text-3xl font-heading font-bold text-white mt-2">
            Your next site should feel premium on every screen.
          </h3>
          <button
            onClick={scrollToContact}
            className="mt-6 w-full px-6 py-4 bg-sky-200 text-slate-950 text-sm font-bold uppercase tracking-widest rounded-full shadow-[0_12px_30px_rgba(125,211,252,0.25)]"
          >
            Book a Build Call
          </button>
        </div>
      </section>
    </div>
  );
};

const LandingPage: React.FC<{ onLearnMore: () => void, scrollToContact: () => void, reduceMotion?: boolean, isMobile?: boolean }> = ({
  onLearnMore,
  scrollToContact,
  reduceMotion = false,
  isMobile = false,
}) => {
  const { scrollY } = useScroll();
  // Parallax: background moves slower than scroll
  const backgroundY = useTransform(scrollY, [0, 500], [0, reduceMotion ? 0 : 200]);
  const textY = useTransform(scrollY, [0, 300], [0, reduceMotion ? 0 : 50]);
  const workTrackRef = useRef<HTMLDivElement>(null);
  const [workDragBounds, setWorkDragBounds] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!workTrackRef.current || !workTrackRef.current.parentElement) return;
      const track = workTrackRef.current;
      const container = track.parentElement;
      setWorkDragBounds(Math.max(track.scrollWidth - container.clientWidth, 0));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      {/* Hero Section - Full Screen Cinematic */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden pb-40">
        {/* Background Image with Parallax */}
        <motion.div className="absolute inset-0 z-0 hero-vignette" style={{ y: backgroundY }}>
          <picture>
            <source srcSet={HERO_IMAGE} />
            <img 
              src={HERO_IMAGE}
              alt="Calgary Tower skyline at sunset"
              className="w-full h-[130%] object-cover object-center md:object-[48%_42%] opacity-50"
              loading="eager"
            />
          </picture>
        </motion.div>
         {/* Overlays don't parallax to keep effect grounded */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/88 to-[#0a0a0c]/30 z-0 pointer-events-none" />
        {!reduceMotion && <div className="absolute inset-0 hero-kinetic pointer-events-none" />}
        {!reduceMotion && <div className="absolute inset-0 hero-mesh pointer-events-none" />}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0 pointer-events-none" />

        <motion.div style={{ y: textY }} className="relative z-10 max-w-7xl mx-auto px-6 text-center mt-20">
           <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 shadow-lg"
           >
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#22d3ee]"/>
              Available for New Projects
           </motion.div>

           <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-7xl md:text-9xl font-heading font-bold text-white leading-[0.9] tracking-tighter mb-10 mix-blend-overlay"
           >
              DIGITAL <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">ASSETS.</span>
           </motion.h1>

           <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-lg md:text-2xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-12"
           >
              We don't build generic websites. We engineer high-performance platforms that you <span className="text-white font-medium border-b border-cyan-500">actually own</span>.
           </motion.p>

           <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
           >
              <button onClick={scrollToContact} className="w-full sm:w-auto group relative px-10 py-5 bg-white text-black font-bold text-sm uppercase tracking-widest overflow-hidden rounded-sm hover:scale-105 transition-transform duration-300">
                 <span className="relative z-10 flex items-center justify-center gap-2">Start Project <ArrowRight className="w-4 h-4"/></span>
                 <div className="absolute inset-0 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 z-0"/>
              </button>
              <button onClick={onLearnMore} className="w-full sm:w-auto px-10 py-5 bg-transparent border border-white/20 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-colors rounded-sm backdrop-blur-sm">
                 View Services
              </button>
           </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
           style={{ x: "-50%" }}
           animate={reduceMotion ? { y: 0 } : { y: [0, 10, 0] }}
           transition={reduceMotion ? { duration: 0 } : { repeat: Infinity, duration: 2 }}
           className="absolute bottom-10 left-1/2 text-slate-500 flex flex-col items-center gap-2 opacity-50"
        >
           <span className="text-[10px] uppercase tracking-widest">Scroll</span>
           <div className="w-[1px] h-12 bg-gradient-to-b from-slate-500 to-transparent"></div>
        </motion.div>
      </header>

      <Marquee reduceMotion={reduceMotion} />

      {/* Bento Grid - "The Logic" */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
           <motion.div initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }}>
              <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">THE <span className="text-cyan-400">LOGIC</span></h2>
              <p className="text-slate-400 max-w-md text-lg">Why custom code beats drag-and-drop every time.</p>
           </motion.div>
        </div>

        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[300px]"
        >
          {/* Large Text Block */}
          <motion.div variants={fadeInScale} className="md:col-span-2 row-span-1 md:row-span-1 bg-gradient-to-br from-slate-900 to-black border border-slate-800 rounded-2xl p-8 md:p-12 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col justify-center h-full">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Plain English. <br/>Zero Bloat.</h3>
              <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                Most agencies oversell complexity. We strip it back. Instant load times, perfect SEO scores, and <strong className="text-cyan-400">no monthly platform fees</strong>.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-cyan-500/20 transition-colors duration-700" />
            <Code className="absolute top-8 right-8 w-12 h-12 text-slate-800 group-hover:text-cyan-900 transition-colors" />
          </motion.div>

          {/* Visual Block - Tech */}
          <motion.div variants={fadeInScale} className="md:col-span-1 bg-black rounded-2xl overflow-hidden border border-slate-800 relative group">
            <img 
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop" 
              alt="Code" 
              className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-700 scale-110 group-hover:scale-100 transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-white font-bold text-xl">React + Vite</h4>
                  <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Architecture</p>
                </div>
                <Zap className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </motion.div>

          {/* Visual Block - Studio */}
          <motion.div variants={fadeInScale} className="md:col-span-1 bg-black rounded-2xl overflow-hidden border border-slate-800 relative group">
             <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop" 
              alt="Office" 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h4 className="text-white font-bold text-xl">Strategy First</h4>
              <p className="text-slate-400 text-sm">Design is just the tool.</p>
            </div>
          </motion.div>

           {/* Features List */}
          <motion.div variants={fadeInScale} className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12 flex flex-col justify-center">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: "Mobile First", icon: Smartphone },
                  { label: "SEO Native", icon: Search },
                  { label: "Own Your Data", icon: Lock },
                  { label: "Global CDN", icon: Globe }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-all duration-300">
                      <item.icon className="w-5 h-5 text-slate-300 group-hover:text-black" />
                    </div>
                    <span className="text-sm font-bold text-slate-300">{item.label}</span>
                  </div>
                ))}
             </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Portfolio Section - Wide & Immersive */}
      <section className="w-full py-20 md:py-28 bg-slate-950 border-t border-slate-900 section-divider backdrop-soft relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 mb-12 relative z-10">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-8xl font-heading font-bold text-white mb-3"
            >
              SELECTED <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-indigo-500">WORK</span>
            </motion.h2>
            <p className="text-slate-400 font-mono text-xs tracking-[0.3em] uppercase">Drag sideways · Magnetic hover · Snap ready</p>
        </div>
        
        <div className="max-w-[1920px] mx-auto px-4 md:px-10 relative">
          <div className="carousel-fade left" />
          <div className="carousel-fade right" />
          <div className="overflow-hidden rounded-2xl border border-slate-900/60 bg-slate-950/60 backdrop-blur-md relative">
            <motion.div
              ref={workTrackRef}
              className="flex gap-6 md:gap-10 px-4 md:px-8 py-6 cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: -workDragBounds, right: 0 }}
              whileTap={{ scale: 0.995 }}
            >
              {PROJECTS.map((p, index) => (
                <motion.div
                  key={p.id}
                  className="group relative min-w-[90vw] sm:min-w-[70vw] md:min-w-[55vw] lg:min-w-[45vw] xl:min-w-[40vw]"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.08, duration: 0.6 }}
                  whileHover={{ y: -6 }}
                  onMouseMove={isMobile ? undefined : (e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
                    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
                    card.style.transform = `rotateX(${y}deg) rotateY(${x}deg) translateY(-6px)`;
                  }}
                  onMouseLeave={isMobile ? undefined : (e) => { e.currentTarget.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0px)'; }}
                >
                  <div className="relative aspect-[4/3] md:aspect-[21/9] w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-cyan-500/5 transition-all duration-700">
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700" />
                    <img 
                      src={p.image} 
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Floating Info Card */}
                    <div className="absolute bottom-5 left-5 md:bottom-10 md:left-10 z-20 space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-mono uppercase tracking-[0.2em] text-white">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        {p.type}
                      </div>
                      <h3 className="text-3xl md:text-5xl font-heading font-bold text-white leading-tight drop-shadow-lg">{p.name}</h3>
                      <p className="text-slate-200 max-w-xl hidden md:block">{p.description}</p>
                    </div>

                    {/* View Project Button (Mobile & Desktop) */}
                    <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20">
                      <a 
                        href={`https://${p.url}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="group/button relative inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white text-slate-900 font-bold uppercase text-[11px] tracking-[0.22em] overflow-hidden"
                      >
                        <span className="relative z-10">View</span>
                        <ArrowRight className="w-4 h-4 relative z-10" />
                        <span className="absolute inset-0 bg-cyan-400 scale-x-0 group-hover/button:scale-x-100 origin-left transition-transform duration-300 z-0"></span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
        
        <div className="text-center mt-16 relative z-10">
          <button onClick={scrollToContact} className="text-slate-400 hover:text-white transition-colors border-b border-slate-800 hover:border-white pb-1 uppercase tracking-[0.3em] text-xs md:text-sm font-mono">
             View All Projects
          </button>
        </div>
      </section>

    </motion.div>
  );
};

const ServicesPage: React.FC<{ scrollToContact: () => void }> = ({ scrollToContact }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="max-w-7xl mx-auto px-6 py-20"
  >
    <div className="text-center mb-24 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      <h1 className="text-5xl md:text-8xl font-heading font-bold mb-8 text-white relative z-10">SERVICES</h1>
      <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
        Transparent pricing based on value. <br/> No hourly billing nonsense.
      </p>
    </div>

    <div className="grid lg:grid-cols-3 gap-8 mb-24">
      {/* Service 1 */}
      <SpotlightCard className="rounded-3xl p-10 flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
        
        <div className="flex justify-between items-start mb-10">
          <div className="w-16 h-16 bg-slate-800 text-cyan-400 rounded-2xl flex items-center justify-center border border-cyan-500/30">
            <Code className="w-8 h-8" />
          </div>
          <div className="bg-cyan-500 text-slate-950 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Best Value
          </div>
        </div>

        <h3 className="text-3xl font-bold mb-4 text-white">Custom Static Site</h3>
        <p className="text-slate-400 mb-10 text-base leading-relaxed">
          The gold standard. A bespoke website built with React. Ultra-fast, unhackable, and 100% yours.
        </p>
        
        <div className="mt-auto">
          <div className="text-4xl font-bold text-white mb-8 tracking-tight flex items-baseline gap-2">
            One-Time <span className="text-sm text-slate-500 font-normal uppercase tracking-widest">/ Flat Fee</span>
          </div>
          <ul className="space-y-4 mb-10 border-t border-slate-800 pt-8">
            <li className="flex items-center gap-3 text-sm font-bold text-white"><Check className="w-4 h-4 text-cyan-400"/> No Monthly Fees</li>
            <li className="flex items-center gap-3 text-sm font-medium text-slate-300"><Check className="w-4 h-4 text-cyan-400"/> Perfect Google Score</li>
            <li className="flex items-center gap-3 text-sm font-medium text-slate-300"><Check className="w-4 h-4 text-cyan-400"/> SEO & Copywriting</li>
          </ul>
          <button onClick={scrollToContact} className="w-full py-5 rounded-lg bg-cyan-500 text-slate-950 text-sm font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg hover:shadow-cyan-500/20 flex items-center justify-center gap-2">
            Get Proposal <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </SpotlightCard>

      {/* Service 2 */}
      <SpotlightCard className="rounded-3xl p-10 flex flex-col">
        <div className="w-16 h-16 bg-slate-900 text-slate-300 rounded-2xl flex items-center justify-center mb-10 border border-slate-800">
          <Layout className="w-8 h-8" />
        </div>
        <h3 className="text-3xl font-bold mb-4 text-white">Wix / Editor X</h3>
        <p className="text-slate-400 mb-10 text-base leading-relaxed">
          Need to change content daily? We'll build a professional foundation on a builder platform for you to manage.
        </p>
        
        <div className="mt-auto">
          <div className="text-4xl font-bold text-white mb-8 tracking-tight flex items-baseline gap-2">
            Setup <span className="text-sm text-slate-500 font-normal uppercase tracking-widest">/ Fee</span>
          </div>
          <ul className="space-y-4 mb-10 border-t border-slate-800 pt-8">
            <li className="flex items-center gap-3 text-sm font-bold text-white"><Check className="w-4 h-4 text-slate-500"/> Professional Design</li>
            <li className="flex items-center gap-3 text-sm font-medium text-slate-400"><Check className="w-4 h-4 text-slate-500"/> Drag & Drop Ready</li>
            <li className="flex items-center gap-3 text-sm font-medium text-slate-400"><Check className="w-4 h-4 text-slate-500"/> Training Included</li>
          </ul>
          <button onClick={scrollToContact} className="w-full py-5 rounded-lg bg-slate-800 text-white text-sm font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors border border-slate-700">
            Select This
          </button>
        </div>
      </SpotlightCard>

      {/* Service 3 */}
      <SpotlightCard className="rounded-3xl p-10 flex flex-col">
        <div className="w-16 h-16 bg-slate-900 text-purple-400 rounded-2xl flex items-center justify-center mb-10 border border-slate-800">
          <Globe className="w-8 h-8" />
        </div>
        <h3 className="text-3xl font-bold mb-4 text-white">Web App</h3>
        <p className="text-slate-400 mb-10 text-base leading-relaxed">
          Custom software. Booking engines, user dashboards, databases, and API integrations.
        </p>
        
        <div className="mt-auto">
          <div className="text-4xl font-bold text-white mb-8 tracking-tight flex items-baseline gap-2">
            Custom <span className="text-sm text-slate-500 font-normal uppercase tracking-widest">/ Quote</span>
          </div>
          <ul className="space-y-4 mb-10 border-t border-slate-800 pt-8">
            <li className="flex items-center gap-3 text-sm font-bold text-white"><Check className="w-4 h-4 text-purple-500"/> Full Stack Dev</li>
            <li className="flex items-center gap-3 text-sm font-medium text-slate-400"><Check className="w-4 h-4 text-purple-500"/> Auth & Database</li>
            <li className="flex items-center gap-3 text-sm font-medium text-slate-400"><Check className="w-4 h-4 text-purple-500"/> Scalable & Secure</li>
          </ul>
          <button onClick={scrollToContact} className="w-full py-5 rounded-lg bg-slate-800 text-white text-sm font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors border border-slate-700">
            Let's Discuss
          </button>
        </div>
      </SpotlightCard>
    </div>
  </motion.div>
);

export default App;
