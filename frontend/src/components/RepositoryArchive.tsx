"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function RepositoryArchive() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate scales and opacities for sticky cards
  const scale1 = useTransform(scrollYProgress, [0, 0.33], [1, 0.95]);
  const opacity1 = useTransform(scrollYProgress, [0, 0.33], [1, 0.5]);
  const blur1 = useTransform(scrollYProgress, [0, 0.33], [0, 8]);

  const scale2 = useTransform(scrollYProgress, [0.33, 0.66], [1, 0.95]);
  const opacity2 = useTransform(scrollYProgress, [0.33, 0.66], [1, 0.5]);
  const blur2 = useTransform(scrollYProgress, [0.33, 0.66], [0, 8]);

  return (
    <section ref={containerRef} className="relative w-full h-[300vh] bg-obsidian">

      {/* Sticky Card 1 */}
      <motion.div
        className="sticky top-0 h-screen w-full flex items-center justify-center p-4 md:p-8"
        style={{ scale: scale1, opacity: opacity1, filter: useTransform(blur1, v => `blur(${v}px)`) }}
      >
        <div className="w-full max-w-5xl h-[80vh] noir-border bg-obsidian/80 backdrop-blur-xl p-8 md:p-16 flex flex-col justify-between">
          <div className="font-mono text-emerald uppercase tracking-widest text-sm border-b border-emerald/20 pb-4">
            Module 01 // The Ingestion Engine
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-auto">
            <div>
              <h3 className="text-4xl md:text-6xl font-black text-silver mb-6">
                Event-Driven Architecture
              </h3>
              <p className="text-slate font-mono text-sm leading-relaxed max-w-md">
                Continuous polling via Gmail API. Webhooks trigger Google Cloud Pub/Sub topics. No polling. Zero data loss. Real-time transaction discovery before you even open your phone.
              </p>
            </div>
            <div className="relative border border-white/10 bg-black/50 overflow-hidden flex items-center justify-center group font-mono text-xs">
              <div className="absolute inset-0 bg-emerald/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {/* Pseudo code block */}
              <pre className="text-slate pointer-events-none p-6">
                <span className="text-emerald">func</span> <span className="text-silver">SubscribeToGmail</span>() {'{'}
                client := pubsub.NewClient(ctx, projID)
                sub := client.Subscription(<span className="text-emerald">"moneytrack-sub"</span>)

                <span className="text-emerald">return</span> sub.Receive(ctx, <span className="text-emerald">func</span>(ctx, msg) {'{'}
                ProcessMessage(msg.Data)
                msg.Ack()
                {'}'})
                {'}'}
              </pre>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sticky Card 2 */}
      <motion.div
        className="sticky top-0 h-screen w-full flex items-center justify-center p-4 md:p-8"
        style={{ scale: scale2, opacity: opacity2, filter: useTransform(blur2, v => `blur(${v}px)`) }}
      >
        <div className="w-full max-w-5xl h-[80vh] noir-border bg-obsidian/90 backdrop-blur-xl p-8 md:p-16 flex flex-col justify-between shadow-2xl shadow-obsidian">
          <div className="font-mono text-emerald uppercase tracking-widest text-sm border-b border-emerald/20 pb-4">
            Module 02 // The Reasoning Core
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-auto">
            <div className="order-2 md:order-1 relative border border-white/10 bg-black/50 overflow-hidden flex flex-col justify-center p-6 group font-mono text-xs">
              <div className="absolute inset-0 bg-emerald/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="mb-4">
                <span className="text-emerald">System Prompt:</span><br />
                <span className="text-slate italic">Extract amount, currency, and mapped category strictly from SMS text formatting.</span>
              </div>
              <div className="border-l-2 border-emerald pl-4 my-4 ml-2">
                <div className="text-silver">"Paid ₹850 to Zomato UPI"</div>
              </div>
              <pre className="text-emerald/80 pointer-events-none">
                {`{
  "amount": 850,
  "currency": "INR",
  "category": "FOOD_DINING"
}`}
              </pre>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-4xl md:text-6xl font-black text-silver mb-6">
                Natural Language Processing
              </h3>
              <p className="text-slate font-mono text-sm leading-relaxed max-w-md">
                Unstructured SMS and bank emails fed directly into an LLM parsing pipeline.
                Structured JSON outputs schema-validated instantly via Zod before hitting the persistence layer.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sticky Card 3 */}
      <motion.div
        className="sticky top-0 h-screen w-full flex items-center justify-center p-4 md:p-8"
      >
        <div className="w-full max-w-5xl h-[80vh] noir-border bg-obsidian/95 backdrop-blur-xl p-8 md:p-16 flex flex-col justify-between shadow-2xl shadow-obsidian">
          <div className="font-mono text-emerald uppercase tracking-widest text-sm border-b border-emerald/20 pb-4">
            Module 03 // The Real-Time UI
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-auto">
            <div>
              <h3 className="text-4xl md:text-6xl font-black text-silver mb-6">
                Telemetry & Commands
              </h3>
              <p className="text-slate font-mono text-sm leading-relaxed max-w-md">
                Control the entire auditor sequence via Telegram Bot APIs or this high-performance Next.js 15 quantitative dashboard. Instant cache invalidation patterns via Bun native APIs.
              </p>
            </div>
            <div className="relative border border-white/10 bg-black/50 overflow-hidden flex flex-col justify-center p-6 group font-mono text-xs items-end h-full">
              <div className="absolute inset-0 bg-emerald/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {/* Telegram mock bubble */}
              <div className="bg-emerald/10 border border-emerald/20 rounded-t-xl rounded-bl-xl p-3 max-w-[80%] mb-4 self-end">
                <span className="text-silver">/summary</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-t-xl rounded-br-xl p-3 max-w-[80%] self-start text-left">
                <span className="text-emerald tracking-widest uppercase mb-2 block">System Response</span>
                <span className="text-silver">Today's Volume: ₹4,500</span><br />
                <span className="text-slate">Top Category: Infrastructure</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

    </section>
  );
}
