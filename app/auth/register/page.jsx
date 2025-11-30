"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { HiArrowLeft } from "react-icons/hi"

  import axios from "axios"

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    email: "",
    password: "",
    course: "Computer Science",
    termsAccepted: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")


const handleSubmit = async (e) => {
  e.preventDefault()
  setError("")
  setLoading(true)

  try {
    const apiUrl = process.env.NEXT_PUBLIC_SERVER_API_URL
    if (!apiUrl) {
      throw new Error("API URL missing")
    }
console.log(`${apiUrl}/api/auth/register/`)
console.log(`/api/auth/register/`)

    const response = await axios.post(`${apiUrl}/api/auth/register/`, {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      courseName: formData.course,
    })

    const data = response.data

    if (data.access) {
      localStorage.setItem("access", data.access)
    }
    if (data.refresh) {
      localStorage.setItem("refresh", data.refresh)
    }
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user))
    }

    router.push("/dashboard")
  } catch (err) {
    setError(err.response?.data?.error || err.message)
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10"
      >

        <div className="hidden md:flex flex-col justify-center items-center order-1 md:order-2 p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Welcome</h2>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm">
            Create your student account and get access to your dashboard.
          </p>
        </div>

        <div className="flex flex-col justify-center order-2 md:order-1">


          <motion.div variants={itemVariants} className="text-left mb-8">
            <h1 className="text-4xl font-bold text-foreground">Create Account</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Join thousands of students</p>
          </motion.div>

          <motion.div variants={itemVariants} className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border dark:border-slate-700 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border dark:border-slate-700 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Course</label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border dark:border-slate-700 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>Computer Science</option>
                  <option>Engineering</option>
                  <option>Science</option>
                  <option>Arts</option>
                  <option>Commerce</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border dark:border-slate-700 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">I agree to the Terms & Conditions</span>
              </label>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-primary text-white py-[12px] rounded-[8px]"
              >
                Create Account
              </motion.button>
            </form>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-4">
              Already have an account? <Link href="/auth/login" className="text-primary hover:underline font-medium">Sign in</Link>
            </p>
          </motion.div>
        </div>

      </motion.div>
    </div>
  )
}
