"use client";

import { motion } from "framer-motion";

export function SchemaVisualizer() {
  return (
    <section className="relative w-full min-h-screen bg-[#020202] flex items-center justify-center overflow-hidden py-32">
      {/* Huge Parallax Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] overflow-hidden select-none">
        <motion.h2
          className="text-[12rem] whitespace-nowrap font-sans font-black text-silver blur-xs"
          initial={{ x: "-10%" }}
          whileInView={{ x: "10%" }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        >
          GO • BUN • PRISMA • POSTGRES
        </motion.h2>
      </div>

      <div className="relative z-10 max-w-5xl w-full px-4 md:px-8">
        <div className="mb-16">
          <h3 className="text-3xl md:text-5xl font-sans font-black tracking-tighter text-silver">
            Relational Architecture
          </h3>
          <p className="font-mono text-sm text-slate mt-2 uppercase tracking-widest">
            Immutable single source of truth
          </p>
        </div>

        <div className="relative w-full md:aspect-[21/9] aspect-video border border-white/5 bg-obsidian/40 backdrop-blur-md flex items-center justify-center">

          {/* Schema Background Grid */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[24px_24px]"></div>

          {/* SVG Canvas for drawing paths */}
          <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" preserveAspectRatio="none">
            {/* Connection path from User to Transaction */}
            <motion.path
              d="M 25% 50% L 75% 50%"
              stroke="rgba(16, 185, 129, 0.4)"
              strokeWidth="2"
              strokeDasharray="4 4"
              fill="transparent"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 2, delay: 0.5 }}
            />

            {/* Additional connector lines */}
            <motion.path
              d="M 75% 50% L 75% 25% L 85% 25%"
              stroke="rgba(148, 163, 184, 0.3)"
              strokeWidth="2"
              fill="transparent"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 2, delay: 0.5 }}
            />
            <motion.path
              d="M 75% 50% L 75% 75% L 85% 75%"
              stroke="rgba(148, 163, 184, 0.3)"
              strokeWidth="2"
              fill="transparent"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 2, delay: 0.5 }}
            />
          </svg>

          {/* The Data Models (HTML Overlays) */}
          <div className="absolute inset-0 w-full h-full z-20 pointer-events-none data-models-container">
            {/* Model 1: User */}
            <motion.div
              className="absolute left-[15%] top-1/2 -translate-y-1/2 bg-obsidian border border-emerald/30 p-4 font-mono text-xs w-48 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-emerald font-bold border-b border-emerald/20 pb-2 mb-2">model User</div>
              <div className="text-silver/60 flex justify-between"><span>id</span> <span className="text-slate">Int @id</span></div>
              <div className="text-silver/60 flex justify-between"><span>telegramId</span> <span className="text-slate">String @unique</span></div>
              <div className="text-silver/60 flex justify-between"><span>createdAt</span> <span className="text-slate">DateTime</span></div>
            </motion.div>

            {/* Model 2: Transaction */}
            <motion.div
              className="absolute left-[75%] top-1/2 -translate-y-1/2 -translate-x-1/2 bg-obsidian border border-slate/30 p-4 font-mono text-xs w-56"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 1 }}
            >
              <div className="text-silver font-bold border-b border-slate/20 pb-2 mb-2">model Transaction</div>
              <div className="text-silver/60 flex justify-between"><span>id</span> <span className="text-slate">Int @id</span></div>
              <div className="text-silver/60 flex justify-between"><span>amount</span> <span className="text-emerald">Decimal</span></div>
              <div className="text-silver/60 flex justify-between"><span>type</span> <span className="text-slate">TxType</span></div>
              <div className="text-silver/60 flex justify-between"><span>userId</span> <span className="text-slate">Int</span></div>
            </motion.div>

            {/* Model 3: Category */}
            <motion.div
              className="absolute left-[85%] top-[25%] -translate-y-1/2 bg-obsidian border border-slate/20 p-3 font-mono text-[10px] w-40 opacity-70"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 1.5 }}
            >
              <div className="text-silver/80 font-bold mb-1">enum Category</div>
              <div className="text-slate">FOOD_DINING</div>
              <div className="text-slate">TRANSPORT</div>
              <div className="text-slate">...</div>
            </motion.div>

            {/* Model 4: PaymentHistory */}
            <motion.div
              className="absolute left-[85%] top-[75%] -translate-y-1/2 bg-obsidian border border-slate/20 p-3 font-mono text-[10px] w-48 opacity-70"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 1.7 }}
            >
              <div className="text-silver/80 font-bold mb-1">model FailedTransaction</div>
              <div className="text-slate flex justify-between"><span>rawText</span><span>String</span></div>
              <div className="text-slate flex justify-between"><span>errorReason</span><span>String</span></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
