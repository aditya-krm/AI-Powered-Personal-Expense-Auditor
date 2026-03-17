"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface AuthVaultProps {
  onAuthorized: () => void;
}

export function AuthVault({ onAuthorized }: AuthVaultProps) {
  const [key, setKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;

    setIsVerifying(true);
    setError(false);

    try {
      const isValid = await api.verifyKey(key);
      if (isValid) {
        localStorage.setItem("ADMIN_KEY", key);
        onAuthorized();
      } else {
        setError(true);
        setKey("");
      }
    } catch (err) {
      setError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <section className="relative w-full h-dvh bg-obsidian flex items-center justify-center p-4 selection:bg-emerald/30 overflow-hidden">
      {/* Background styling to match the site aesthetic */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[24px_24px]"></div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8 text-center">
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-6 bg-white/5">
            <Lock className="w-5 h-5 text-emerald" />
          </div>
          <h1 className="text-2xl font-sans font-black tracking-tight text-silver mb-2">
            Restricted Access
          </h1>
          <p className="font-mono text-xs text-slate uppercase tracking-widest">
            Enter Vault Authorization Key
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="relative"
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="relative noir-border bg-black/50 p-1 flex items-center">
            <input
              type="password"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setError(false);
              }}
              disabled={isVerifying}
              placeholder="Admin Key..."
              className="w-full bg-transparent border-none text-silver font-mono text-sm px-4 py-3 focus:outline-none placeholder:text-white/20"
              autoFocus
            />
            <button
              type="submit"
              disabled={!key.trim() || isVerifying}
              className="px-4 py-2 mr-1 bg-white/10 hover:bg-emerald/20 disabled:hover:bg-white/10 text-emerald transition-colors disabled:opacity-50"
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-8 left-0 right-0 text-center text-[10px] font-mono text-red-500 uppercase tracking-widest"
            >
              Authorization Denied
            </motion.div>
          )}
        </motion.form>
      </motion.div>
    </section>
  );
}
