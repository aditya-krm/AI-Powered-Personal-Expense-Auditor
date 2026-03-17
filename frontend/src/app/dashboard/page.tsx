"use client";

import { useState, useEffect } from "react";
import { AuthVault } from "@/components/dashboard/AuthVault";
import { LiveDashboard } from "@/components/dashboard/LiveDashboard";

export default function DashboardPage() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if key exists on initial mount
    const key = localStorage.getItem("ADMIN_KEY");
    setIsAuthorized(!!key);
  }, []);

  if (isAuthorized === null) {
    // Return empty black screen while checking localStorage to prevent auth-flicker
    return <div className="min-h-screen bg-obsidian"></div>;
  }

  if (!isAuthorized) {
    return <AuthVault onAuthorized={() => setIsAuthorized(true)} />;
  }

  return <LiveDashboard onLogout={() => setIsAuthorized(false)} />;
}
