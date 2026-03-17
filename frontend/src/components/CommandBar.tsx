"use client";

import { useState, useEffect } from "react";
import { Github, LayoutDashboard, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

export function CommandBar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasKey = !!localStorage.getItem("ADMIN_KEY");
    setIsAdmin(hasKey);

    if (hasKey) {
      api.getGmailStatus()
        .then(setGmailConnected)
        .catch(() => setGmailConnected(false));
    }
  }, []);

  const handleConnectGmail = () => {
    window.open(api.getGmailAuthUrl(), "_blank");
  };

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-4 flex justify-between items-center pointer-events-none">
      {/* Left: System Status */}
      <div className="noir-pill bg-obsidian/40 backdrop-blur-md px-6 py-3 pointer-events-auto flex items-center gap-3">
        <div className="relative flex items-center justify-center w-2 h-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald"></span>
        </div>
        <span className="font-mono text-xs text-silver/80 tracking-widest uppercase">System: Operational</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Dashboard link — only if admin key is stored */}
        {isAdmin && (
          <Link
            href="/dashboard"
            className="noir-pill bg-obsidian/40 backdrop-blur-md px-5 py-3 group hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-shadow duration-500 flex items-center gap-2 cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald" />
            <span className="font-mono text-xs text-silver font-semibold tracking-wide">Enter Vault</span>
          </Link>
        )}

        {/* Gmail Connect button — shown to admin; toggles green badge when connected */}
        {isAdmin && (
          gmailConnected ? (
            <div className="noir-pill bg-obsidian/40 backdrop-blur-md px-5 py-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald" />
              <span className="font-mono text-xs text-emerald font-semibold tracking-wide">Gmail: Active</span>
            </div>
          ) : (
            <button
              onClick={handleConnectGmail}
              className="noir-pill bg-obsidian/40 backdrop-blur-md px-5 py-3 group hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-500 flex items-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-silver group-hover:text-emerald transition-colors" />
              <span className="font-mono text-xs text-silver group-hover:text-emerald font-semibold tracking-wide transition-colors">Connect Gmail</span>
            </button>
          )
        )}

        {/* GitHub button — always shown */}
        <button className="noir-pill bg-obsidian/40 backdrop-blur-md px-5 py-3 group hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-shadow duration-500 flex items-center gap-2 cursor-pointer">
          <Github className="w-4 h-4 text-silver group-hover:text-emerald transition-colors" />
          <span className="font-mono text-xs text-silver font-semibold tracking-wide">GitHub</span>
        </button>
      </div>
    </div>
  );
}
