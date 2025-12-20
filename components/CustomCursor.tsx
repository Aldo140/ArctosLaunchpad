/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CustomCursorProps {
  enabled?: boolean;
}

const CustomCursor: React.FC<CustomCursorProps> = ({ enabled = true }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [trailPosition, setTrailPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const mouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'A' || (e.target as HTMLElement).closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let raf: number;
    const animateTrail = () => {
      setTrailPosition(prev => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.12,
        y: prev.y + (mousePosition.y - prev.y) * 0.12
      }));
      raf = requestAnimationFrame(animateTrail);
    };
    raf = requestAnimationFrame(animateTrail);
    return () => cancelAnimationFrame(raf);
  }, [enabled, mousePosition.x, mousePosition.y]);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white mix-blend-difference pointer-events-none z-[9999] hidden md:block"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 2.4 : 1,
          backgroundColor: isHovering ? 'rgba(255,255,255,0.1)' : 'transparent',
        }}
        transition={{
          type: 'spring',
          stiffness: 520,
          damping: 30,
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-cyan-300 mix-blend-screen pointer-events-none z-[9998] hidden md:block"
        animate={{
          x: trailPosition.x - 4,
          y: trailPosition.y - 4,
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 18,
        }}
      />
    </>
  );
};

export default CustomCursor;
