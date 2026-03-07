"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Activity, BarChart4 } from "lucide-react";

function NLPParserArtifact() {
  const fullText = "Spent 4500 on AWS and 200 for coffee.";
  const [typedText, setTypedText] = useState("");
  const [jsonVisible, setJsonVisible] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        setJsonVisible(true);
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-4">
      <div className="flex-1 noir-border p-4 bg-obsidian/60 flex flex-col h-full font-mono text-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
          <Terminal className="w-4 h-4 text-emerald" />
          <span className="text-slate text-xs uppercase tracking-widest">Input Stream</span>
        </div>
        <div className="text-silver">
          <span className="text-emerald mr-2">&gt;</span>
          {typedText}
          <span className="animate-pulse bg-emerald w-2 h-4 inline-block ml-1 align-middle"></span>
        </div>
      </div>

      <div className="flex-1 noir-border p-4 bg-obsidian/60 flex flex-col h-full font-mono text-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
          <Activity className="w-4 h-4 text-emerald" />
          <span className="text-slate text-xs uppercase tracking-widest">Parsed Output</span>
        </div>
        <AnimatePresence>
          {jsonVisible && (
            <motion.pre
              className="text-emerald/80 mt-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
            >
              {`{
  "intent": "LOG_EXPENSE",
  "entities": [
    {
      "category": "Infrastructure",
      "amount": 4500,
      "currency": "INR"
    },
    {
      "category": "Food & Dining",
      "amount": 200,
      "currency": "INR"
    }
  ]
}`}
            </motion.pre>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PubSubPulseArtifact() {
  const [toasts, setToasts] = useState<number[]>([]);

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      const id = Date.now();
      setToasts(prev => [...prev.slice(-2), id]); // keep max 3 toasts
    }, 4000);
    return () => clearInterval(pulseInterval);
  }, []);

  return (
    <div className="h-full w-full noir-border p-4 bg-obsidian/60 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Radar Center */}
      <div className="relative w-12 h-12 flex items-center justify-center z-10">
        <div className="w-3 h-3 bg-emerald rounded-full"></div>
        <motion.div
          className="absolute inset-0 rounded-full border border-emerald/50"
          animate={{ scale: [1, 4], opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border border-emerald/30"
          animate={{ scale: [1, 6], opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeOut", delay: 1 }}
        />
      </div>

      {/* Floating Toasts */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <AnimatePresence>
          {toasts.map((id) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="px-3 py-1.5 noir-border bg-obsidian border border-emerald/20 text-emerald text-xs font-mono flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 bg-emerald rounded-full"></div>
              Gmail Sync: +1 Transaction
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-4 font-mono text-xs text-slate uppercase tracking-widest">
        Pub/Sub Heartbeat
      </div>
    </div>
  );
}

function DebtLedgerArtifact() {
  const data = [
    { label: "Owe Me", value: 85, color: "bg-emerald" },
    { label: "I Owe", value: 30, color: "bg-emerald/40" },
    { label: "Settled", value: 65, color: "bg-slate/40" },
  ];

  return (
    <div className="h-full w-full noir-border p-4 bg-obsidian/60 flex flex-col justify-end relative">
      <div className="absolute top-4 left-4 font-mono text-xs text-slate uppercase tracking-widest flex items-center gap-2">
        <BarChart4 className="w-4 h-4 text-emerald" />
        Ledger State
      </div>

      <div className="flex items-end justify-around h-32 mt-12 border-b border-white/5 pb-2">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2 w-1/3">
            <motion.div
              className={`w-8 ${item.color} rounded-t-sm`}
              initial={{ height: 0 }}
              whileInView={{ height: `${item.value}%` }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: i * 0.1 + 0.5
              }}
            />
            <span className="font-mono text-[10px] text-slate uppercase">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardArtifacts() {
  return (
    <section className="relative w-full min-h-screen py-24 px-4 md:px-8 max-w-7xl mx-auto flex flex-col justify-center">
      <div className="mb-12">
        <h3 className="text-3xl md:text-4xl font-sans tracking-tight text-silver font-bold">
          The Intelligence Grid
        </h3>
        <p className="font-mono text-sm text-slate mt-2 uppercase tracking-widest">
          Artifacts of automation
        </p>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">

        {/* Artifact 1: NLP Parser spans 2 columns on md */}
        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <NLPParserArtifact />
        </motion.div>

        {/* Artifact 2: Pub/Sub Pulse */}
        <motion.div
          className="md:col-span-1"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <PubSubPulseArtifact />
        </motion.div>

        {/* Artifact 3: Debt Ledger (also spans 1 col) */}
        <motion.div
          className="md:col-span-1"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <DebtLedgerArtifact />
        </motion.div>

        {/* Optional Filler / Summary stat box */}
        <motion.div
          className="md:col-span-2 noir-border p-6 bg-obsidian/60 flex items-center justify-between"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div>
            <div className="font-mono text-xs text-slate uppercase tracking-widest mb-1">Total Processed Vol.</div>
            <div className="text-4xl font-sans font-bold text-silver">₹142,500.00</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs text-slate uppercase tracking-widest mb-1">System Load</div>
            <div className="text-emerald font-mono flex items-center gap-2 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald"></span>
              2.4ms Latency
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
