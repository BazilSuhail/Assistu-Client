"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FaGoogle } from "react-icons/fa"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("b@gmail.com")
  const [password, setPassword] = useState("112233")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {

      const apiUrl = process.env.NEXT_PUBLIC_SERVER_API_URL

      if (!apiUrl) {
        throw new Error("API URL not configured")
      }

      const response = await fetch(`${apiUrl}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Store JWT access token in localStorage
      if (data.access) {
        localStorage.setItem("access", data.access)
      }

      // Optionally store refresh token
      if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh)
      }

      // Optionally store user data
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user))
      }

      // Redirect to dashboard or home page
      router.push("/dashboard")
    } catch (err) {
      setError(err.message || "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10"
      >

        <div className="hidden md:flex flex-col justify-center items-center order-1 p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Welcome Back</h2>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm">
            Sign in to your student account and access your dashboard.
          </p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
              VA
            </div>
            <h1 className="text-3xl font-bold text-foreground">Voice Assistant</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Your intelligent study companion</p>
          </motion.div>

          <motion.div variants={itemVariants} className="card p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border dark:border-slate-700 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border dark:border-slate-700 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                disabled={loading}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing In..." : "Sign In"}
              </motion.button>
            </form>

            <div className="my-4 flex items-center gap-2">
              <div className="flex-1 h-px bg-border dark:bg-slate-700" />
              <span className="text-xs text-slate-500">or</span>
              <div className="flex-1 h-px bg-border dark:bg-slate-700" />
            </div>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-4">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-primary/20"
          >
            <p className="text-sm text-slate-700 dark:text-slate-300">
              💡 <strong>Try saying:</strong> "Create a task for my Math homework"
            </p>
          </motion.div>
        </motion.div>

      </motion.div>
    </div>
  )
}