/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface FluidBackgroundProps {
  reduceMotion?: boolean;
}

const FluidBackground: React.FC<FluidBackgroundProps> = ({ reduceMotion = false }) => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 500]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 90]);

  if (reduceMotion) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[var(--surface-0)]">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#020204] to-[#0a0a0f]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[var(--surface-0)] preserve-3d perspective-[2000px]">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.08] mix-blend-overlay pointer-events-none z-10" />

      {/* Grid Floor */}
      <motion.div 
        className="absolute bottom-[-50%] left-[-50%] w-[200%] h-[150%] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'rotateX(75deg) translateZ(-200px)',
          y: y1
        }}
      />

      {/* Primary Orb */}
      <motion.div
        className="absolute top-[-10%] left-[10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[100px] opacity-[0.25]"
        style={{ 
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          rotate: rotate1
        }}
        animate={{
          x: [0, 100, -50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Secondary Orb */}
      <motion.div
        className="absolute top-[40%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.2]"
        style={{ 
          background: 'radial-gradient(circle, var(--accent-warm) 0%, transparent 70%)',
          y: y2
        }}
        animate={{
          x: [0, -80, 40, 0],
          y: [0, -40, -80, 0],
          scale: [1, 1.1, 1.05, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Tertiary Orb */}
      <motion.div
        className="absolute bottom-[-20%] left-[30%] w-[40vw] h-[40vw] rounded-full mix-blend-screen filter blur-[90px] opacity-[0.15]"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
        animate={{
          rotate: [0, 180, 360],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export default FluidBackground;
