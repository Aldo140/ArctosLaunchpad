/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
}

const GlitchText: React.FC<GlitchTextProps> = ({ text, className = "" }) => {
  return (
    <div className={`relative inline-block group ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-cyan-400 opacity-0 group-hover:opacity-70 animate-pulse translate-x-[2px] skew-x-12">
        {text}
      </span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-pink-500 opacity-0 group-hover:opacity-70 animate-pulse -translate-x-[2px] -skew-x-12 delay-75">
        {text}
      </span>
    </div>
  );
};

export default GlitchText;