"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const columns = Math.ceil(width / 20);
    const drops = Array(columns).fill(0).map(() => Math.random() * -100);

    const draw = () => {
      ctx.fillStyle = "rgba(5, 5, 5, 0.1)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
      ctx.font = "14px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = Math.floor(Math.random() * 16777215).toString(16).padEnd(6, '0');
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const textVariants = {
    hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: "easeOut"
      },
    }),
  };

  const line1 = "FINANCIAL CLARITY".split(" ");
  const line2 = "THROUGH AUTONOMY".split(" ");

  return (
    <section className="relative w-full h-dvh overflow-hidden bg-obsidian flex flex-col items-center justify-center perspective-[1000px]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0 opacity-40 pointer-events-none"
      />
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20">
        <div
          className="w-[200vw] h-[200vh] border-t border-emerald/20"
          style={{
            backgroundImage: "linear-gradient(rgba(16, 185, 129, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.2) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            transform: "rotateX(60deg) translateY(200px) translateZ(-200px)",
            transformOrigin: "center center"
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center mt-[-10dvh]">
        <div className="overflow-hidden mb-2">
          <motion.div
            className="text-6xl md:text-8xl font-black tracking-tighter text-silver flex flex-wrap justify-center"
            initial="hidden"
            animate="visible"
          >
            {line1.map((word, i) => (
              <motion.span
                key={i}
                custom={i}
                // variants={textVariants}
                className="inline-block mr-[0.2em]"
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
        </div>

        <div className="overflow-hidden">
          <motion.div
            className="text-4xl md:text-6xl font-mono italic tracking-wide text-emerald flex flex-wrap justify-center font-light"
            style={{ textShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
            initial="hidden"
            animate="visible"
          >
            {line2.map((word, i) => (
              <motion.span
                key={i}
                custom={i + line1.length}
                // variants={textVariants}
                className="inline-block mr-[0.3em]"
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-16 text-slate font-mono text-sm max-w-md text-center leading-relaxed"
        >
          <p>
            An autonomous agent auditing expenditures with quantitative precision.
            Bridging natural language to immutable ledgers via <span className="text-silver">Go</span>, <span className="text-silver">Bun</span>, and <span className="text-silver">PostgreSQL</span>.
          </p>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="font-mono text-xs text-slate uppercase tracking-widest">Initialize sequence</span>
        <div className="w-px h-12 bg-linear-to-b from-emerald/50 to-transparent relative overflow-hidden">
          <motion.div
            className="w-full h-4 bg-emerald"
            animate={{ top: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            style={{ position: "absolute" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
