"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardPage from "./dashboard/page";
import { motion } from "framer-motion";

export default function App() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiry = payload.exp * 1000;
      return Date.now() > expiry;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const check = () => {
      const token = localStorage.getItem("access");

      if (!token || isTokenExpired(token)) {
        localStorage.removeItem("access");
        router.push("/auth/login");
        return;
      }

      setAuthenticated(true);
      setLoading(false);
    };

    check();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-purple-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!authenticated) return null;

  return <DashboardPage />;
}
