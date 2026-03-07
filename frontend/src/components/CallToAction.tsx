"use client";

import { useState } from "react";
import { Check, Copy, TerminalSquare } from "lucide-react";
import { motion } from "framer-motion";

export function CallToAction() {
  const [copied, setCopied] = useState(false);
  const cloneCommand = "git clone https://github.com/aditya-krm/moneyTrack.git";

  const handleCopy = () => {
    navigator.clipboard.writeText(cloneCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative w-full py-32 bg-obsidian flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(16,185,129,0.05)_0%,transparent_50%)] pointer-events-none"></div>

      <motion.div
        className="max-w-3xl w-full text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-6xl font-black text-silver mb-4 tracking-tighter">
          Deploy Autonomy
        </h2>
        <p className="text-slate font-mono text-sm uppercase tracking-widest">
          Fork the repository. Own your data.
        </p>
      </motion.div>

      <motion.div
        className="w-full max-w-2xl noir-border bg-black/80 backdrop-blur-md p-1"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-slate/20"></div>
            <div className="w-3 h-3 rounded-full bg-slate/20"></div>
            <div className="w-3 h-3 rounded-full bg-slate/20"></div>
          </div>
          <div className="flex items-center gap-2 text-slate font-mono text-xs">
            <TerminalSquare className="w-3 h-3" />
            zsh — 80x24
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <code className="text-silver font-mono text-sm md:text-base selection:bg-emerald/30 break-all">
            <span className="text-emerald mr-2">❯</span>
            {cloneCommand}
          </code>

          <button
            onClick={handleCopy}
            className="flex-shrink-0 noir-border bg-white/5 hover:bg-white/10 text-silver hover:text-emerald px-4 py-2 font-mono text-xs uppercase tracking-widest flex items-center gap-2 transition-colors group"
          >
            {copied ? <Check className="w-4 h-4 text-emerald" /> : <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </motion.div>
    </section>
  );
}
