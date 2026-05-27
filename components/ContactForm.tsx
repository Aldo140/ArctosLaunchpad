/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Send, CheckCircle, Fingerprint } from 'lucide-react';

const ContactForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Logic to send data would go here
  };

  if (submitted) {
    return (
      <div className="glass-panel border border-emerald-500/30 rounded-3xl p-12 text-center backdrop-blur-xl transform transition-all duration-500 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-3xl" />
        <div className="flex justify-center mb-6 relative z-10">
          <CheckCircle className="w-16 h-16 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]" />
        </div>
        <h3 className="text-3xl font-heading font-extrabold text-white mb-3 relative z-10">Transmission Secured</h3>
        <p className="text-slate-300 font-light text-lg mb-8 relative z-10">Our architects have received your briefing. Expect contact shortly.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="relative z-10 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          Initialize Another Sequence
        </button>
      </div>
    );
  }

  // Architectural Input Styles
  const inputClasses =
    "w-full px-4 py-4 bg-black/40 border border-white/10 rounded-xl focus:border-[var(--accent-glow)] focus:bg-black/60 focus:outline-none transition-all duration-300 text-white placeholder-slate-600 text-base font-light shadow-inner";
  const labelClasses = "block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-glow)] mb-2 ml-1";

  return (
    <form onSubmit={handleSubmit} className="relative glass-panel p-8 md:p-10 rounded-3xl preserve-3d">
      <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
         <Fingerprint className="w-24 h-24 text-[var(--accent-glow)]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
        <div className="group">
          <label className={labelClasses}>Commander / Owner</label>
          <input required type="text" className={inputClasses} placeholder="Jane Doe" />
        </div>
        <div className="group">
          <label className={labelClasses}>Organization / Brand</label>
          <input required type="text" className={inputClasses} placeholder="Company Ltd." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
        <div className="group">
          <label className={labelClasses}>Comms Channel (Email)</label>
          <input required type="email" className={inputClasses} placeholder="jane@example.com" />
        </div>
        <div className="group">
          <label className={labelClasses}>Social Recon (Optional)</label>
          <input type="text" className={inputClasses} placeholder="@yourbusiness" />
        </div>
      </div>
      
      <div className="mb-8 group relative z-10">
        <label className={labelClasses}>Mission Parameters</label>
        <textarea required rows={5} className={inputClasses + " resize-none"} placeholder="Detail your objective, timeline, and required outcomes..."></textarea>
      </div>

      <button
        type="submit"
        className="group relative w-full md:w-auto px-12 py-5 bg-gradient-to-r from-[var(--accent-glow)] to-white text-black font-extrabold text-[11px] uppercase tracking-[0.3em] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] z-10"
      >
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity rounded-xl" />
        Deploy Briefing <Send className="w-4 h-4 group-hover:translate-x-2 transition-transform drop-shadow-md" />
      </button>
    </form>
  );
};

export default ContactForm;