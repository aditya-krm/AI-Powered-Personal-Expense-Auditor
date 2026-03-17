"use client";

import { useState, useEffect } from "react";

export function Footer() {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const formatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setTimeStr(formatter.format(new Date()) + " IST");
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full border-t border-white/10 bg-obsidian py-8 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between font-mono text-xs text-slate uppercase tracking-widest">
      <div className="mb-4 md:mb-0">
        Designed for High-Performance Finance.<br />
        © 2026 Aditya Karmakar.
      </div>

      <div className="flex items-center gap-3 bg-white/5 px-4 py-2 noir-border">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse"></div>
        <span>AHMEDABAD (IST) — {timeStr || "00:00:00 IST"}</span>
      </div>
    </footer>
  );
}
