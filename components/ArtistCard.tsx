/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';
import { Project } from '../types';
import { ExternalLink, ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <motion.a
      href={`https://${project.url}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 transition-all duration-500 hover:-translate-y-2"
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 -z-10 blur-xl" />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-hover:ring-cyan-500/50 transition-all duration-500 z-20 pointer-events-none" />

      {/* Image Container */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-950 relative">
        <img 
          src={project.image} 
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-90" />
        
        {/* URL Badge */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
          {project.url} <ArrowUpRight className="w-3 h-3 inline ml-1" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 relative z-10 -mt-20">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">{project.type}</p>
        <h3 className="font-heading text-2xl font-bold text-white mb-3 group-hover:text-cyan-200 transition-colors">{project.name}</h3>
        <p className="text-slate-300 text-sm leading-relaxed border-l-2 border-slate-700 pl-4 group-hover:border-cyan-500 transition-colors">
          {project.description}
        </p>
      </div>
    </motion.a>
  );
};

export default ProjectCard;