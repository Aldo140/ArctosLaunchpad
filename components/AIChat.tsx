/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Cpu } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "System initialized. State your objective or inquire about architectural specs, capabilities, or engagement models.", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await sendMessageToGemini(input);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: responseText, sender: 'ai' };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} preserve-3d`}
        style={{ background: 'linear-gradient(135deg, var(--accent-glow), var(--accent))' }}
        whileHover={{ scale: 1.1, rotateY: 15 }}
      >
        <MessageCircle className="w-6 h-6 text-black drop-shadow-md" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, rotateX: -10 }}
            className="fixed bottom-6 right-6 z-50 w-[90vw] md:w-96 h-[500px] glass-panel border border-[var(--accent-glow)]/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transform-gpu"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-0)]/90 to-[var(--surface-1)]/90 backdrop-blur-xl -z-10" />
            
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-glow)]/10 flex items-center justify-center border border-[var(--accent-glow)]/30">
                  <Cpu className="w-4 h-4 text-[var(--accent-glow)] animate-pulse" />
                </div>
                <div>
                  <span className="font-heading font-bold text-white text-sm block">PolarOps Core</span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--accent-glow)] block">Online</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-[var(--accent-warm)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 relative z-10 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-white to-gray-200 text-black rounded-br-none font-medium' 
                      : 'glass-panel border border-[var(--accent-glow)]/20 text-slate-200 rounded-bl-none font-light'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="glass-panel border border-white/10 p-4 rounded-2xl rounded-bl-none">
                    <div className="flex gap-2 items-center h-4">
                      <span className="w-1.5 h-1.5 bg-[var(--accent-glow)] rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-[var(--accent-glow)] rounded-full animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 bg-[var(--accent-glow)] rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 relative z-10 bg-black/40">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Input command..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-[var(--accent-glow)] focus:bg-white/10 outline-none transition-all font-light text-sm"
                />
                <button 
                  onClick={handleSend}
                  className="bg-gradient-to-br from-[var(--accent-glow)] to-[var(--accent)] text-black p-3 rounded-xl hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                >
                  <Send className="w-5 h-5 drop-shadow-md" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}