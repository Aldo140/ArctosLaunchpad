/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

const ContactForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Logic to send data would go here
  };

  if (submitted) {
    return (
      <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-8 text-center backdrop-blur-sm">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-emerald-400" />
        </div>
        <h3 className="text-2xl font-heading font-bold text-emerald-100 mb-2">Message Received</h3>
        <p className="text-emerald-200/80">I'll get back to you shortly.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-bold text-emerald-400 hover:text-emerald-300 underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  // Architectural Input Styles
  const inputClasses = "w-full px-0 py-3 bg-transparent border-b border-slate-700 focus:border-cyan-500 focus:outline-none transition-colors text-white placeholder-slate-600 text-lg font-light";
  const labelClasses = "block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1";

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="group">
          <label className={labelClasses}>Owner Name</label>
          <input required type="text" className={inputClasses} placeholder="Jane Doe" />
        </div>
        <div className="group">
          <label className={labelClasses}>Business Name</label>
          <input required type="text" className={inputClasses} placeholder="Company Ltd." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="group">
          <label className={labelClasses}>Email Address</label>
          <input required type="email" className={inputClasses} placeholder="jane@example.com" />
        </div>
        <div className="group">
          <label className={labelClasses}>Instagram (Optional)</label>
          <input type="text" className={inputClasses} placeholder="@yourbusiness" />
        </div>
      </div>
      
      <div className="mb-12 group">
        <label className={labelClasses}>How can I help?</label>
        <textarea required rows={4} className={inputClasses + " resize-none"} placeholder="Tell me a bit about what you're looking for..."></textarea>
      </div>

      <button type="submit" className="group w-full md:w-auto px-10 py-5 bg-white text-black font-bold text-sm uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-3">
        Send Message <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </form>
  );
};

export default ContactForm;