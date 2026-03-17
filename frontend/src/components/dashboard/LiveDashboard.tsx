"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, LogOut, RefreshCw, AlertTriangle, ArrowUpRight, ArrowDownRight, Wallet, Users } from "lucide-react";
import { api } from "@/lib/api";

interface LiveDashboardProps {
  onLogout: () => void;
}

export function LiveDashboard({ onLogout }: LiveDashboardProps) {
  const [data, setData] = useState<{ summary: any; loans: any; transactions: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summary, loans, transactions] = await Promise.all([
        api.getSummary(),
        api.getLoans(),
        api.getTransactions(15),
      ]);
      setData({ summary, loans, transactions });
    } catch (err: any) {
      if (err.message === "UNAUTHORIZED") {
        onLogout();
      } else {
        setError(err.message || "Failed to sync telemetry");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-obsidian text-silver flex flex-col items-center justify-center font-mono text-xs tracking-widest uppercase">
        <RefreshCw className="w-5 h-5 text-emerald animate-spin mb-4" />
        Synchronizing Telemetry...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-obsidian text-silver flex flex-col items-center justify-center font-mono text-xs tracking-widest uppercase">
        <AlertTriangle className="w-5 h-5 mb-4" />
        {error}
        <button onClick={fetchData} className="mt-4 px-4 py-2 border border-red-500/30 hover:bg-red-500/10 text-red-500 transition-colors">
          Retry Sequence
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-obsidian text-silver selection:bg-emerald/30 p-4 md:p-8 font-sans">

      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto flex items-center justify-between py-6 mb-8 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald"></span>
          </div>
          <h1 className="font-mono text-sm tracking-widest uppercase text-slate">Live Auditor</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="text-slate hover:text-emerald transition-colors p-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald' : ''}`} />
          </button>
          <button
            onClick={() => { localStorage.removeItem("ADMIN_KEY"); onLogout(); }}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Terminate
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Metric 1: Total Expense */}
        <motion.div
          className="col-span-1 md:col-span-4 noir-border bg-obsidian/60 p-6 flex flex-col justify-between hover:bg-white/5 transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-slate font-mono text-xs uppercase tracking-widest mb-4">
            <ArrowDownRight className="w-4 h-4 text-red-400" />
            Today's Outflow
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black tracking-tighter text-silver">
              {formatCurrency(data.summary.expense)}
            </div>
            <div className="mt-2 text-xs font-mono text-slate border-t border-white/5 pt-2">
              <span className="text-emerald">+{data.summary.totalTransactions}</span> actions recorded today
            </div>
          </div>
        </motion.div>

        {/* Metric 2: Total Income */}
        <motion.div
          className="col-span-1 md:col-span-4 noir-border bg-obsidian/60 p-6 flex flex-col justify-between hover:bg-white/5 transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 text-slate font-mono text-xs uppercase tracking-widest mb-4">
            <ArrowUpRight className="w-4 h-4 text-emerald" />
            Today's Inflow
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black tracking-tighter text-silver">
              {formatCurrency(data.summary.income)}
            </div>
          </div>
        </motion.div>

        {/* Metric 3: Debt Ratio */}
        <motion.div
          className="col-span-1 md:col-span-4 noir-border bg-obsidian/60 p-6 flex flex-col justify-between hover:bg-white/5 transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 text-slate font-mono text-xs uppercase tracking-widest mb-4">
            <Users className="w-4 h-4 text-emerald" />
            Network Exposure
          </div>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-slate">Owed to Me</span>
              <span className="text-emerald font-bold">{formatCurrency(data.loans.oweMe.reduce((acc: number, cur: any) => acc + cur.amount, 0))}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate">I Owe</span>
              <span className="text-red-400 font-bold">{formatCurrency(data.loans.iOwe.reduce((acc: number, cur: any) => acc + cur.amount, 0))}</span>
            </div>
          </div>
        </motion.div>

        {/* Categories Breakdown */}
        <motion.div
          className="col-span-1 md:col-span-4 noir-border bg-obsidian/60 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 text-slate font-mono text-xs uppercase tracking-widest mb-6 pb-2 border-b border-white/5">
            <Wallet className="w-4 h-4 text-emerald" />
            Category Distribution
          </div>

          <div className="space-y-4">
            {Object.entries(data.summary.expenseCats).length === 0 ? (
              <div className="text-center text-slate font-mono text-xs py-8">No categorical data available.</div>
            ) : Object.entries(data.summary.expenseCats)
              .sort(([, a]: any, [, b]: any) => b - a)
              .map(([cat, amt]: any, i) => (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-silver">{cat}</span>
                    <span className="text-slate">{formatCurrency(amt)}</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald/50"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((amt / data.summary.expense) * 100, 100)}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </motion.div>

        {/* Recent Transactions Feed */}
        <motion.div
          className="col-span-1 md:col-span-8 noir-border bg-obsidian/60 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 text-slate font-mono text-xs uppercase tracking-widest mb-6 pb-2 border-b border-white/5">
            <Activity className="w-4 h-4 text-emerald" />
            Raw Event Log
          </div>

          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs text-left whitespace-nowrap">
              <thead className="text-slate">
                <tr>
                  <th className="pb-4 font-normal uppercase tracking-widest">Type</th>
                  <th className="pb-4 font-normal uppercase tracking-widest">Amount</th>
                  <th className="pb-4 font-normal uppercase tracking-widest">Category</th>
                  <th className="pb-4 font-normal uppercase tracking-widest">Time</th>
                  <th className="pb-4 font-normal uppercase tracking-widest text-right">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.transactions.length === 0 ? (
                  <tr><td colSpan={5} className="py-4 text-center text-slate">Silence inside the vault. No data found.</td></tr>
                ) : data.transactions.map((t: any, i: number) => (
                  <motion.tr
                    key={t.id}
                    className="hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + (i * 0.05) }}
                  >
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-sm border ${t.type === 'INCOME' || t.type === 'REPAYMENT' ? 'border-emerald/30 text-emerald bg-emerald/5' :
                        t.type === 'EXPENSE' ? 'border-red-500/30 text-red-500 bg-red-500/5' :
                          'border-slate/30 text-slate bg-slate/5'
                        }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`py-3 font-bold ${t.type === 'INCOME' || t.type === 'REPAYMENT' ? 'text-emerald' : 'text-silver'}`}>
                      {t.type === 'EXPENSE' || t.type === 'LENT' ? '-' : '+'}{formatCurrency(t.amount)}
                    </td>
                    <td className="py-3 text-slate">{t.category}</td>
                    <td className="py-3 text-slate/60">{new Date(t.transactionDate).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-3 text-right text-slate">{t.relatedEntity || "—"}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
