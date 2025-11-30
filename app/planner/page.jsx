"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Loader from "@/components/shared/loader"
import Link from "next/link"
import { HiPlus } from "react-icons/hi"

const DUMMY_PLANS = [
  {
    id: 1,
    title: "Math - Calculus Mastery",
    subjects: ["Integration", "Differentiation", "Limits"],
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    progress: 45,
  },
  {
    id: 2,
    title: "Physics - Mechanics",
    subjects: ["Forces", "Motion", "Energy"],
    startDate: "2024-01-20",
    endDate: "2024-02-20",
    progress: 30,
  },
  {
    id: 3,
    title: "Chemistry - Organic",
    subjects: ["Bonding", "Reactions", "Synthesis"],
    startDate: "2024-01-10",
    endDate: "2024-02-10",
    progress: 70,
  },
]

export default function PlannerPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 md:p-8 max-w-6xl mx-auto"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Study Planner</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Create and manage your personalized study plans</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center gap-2"
        >
          <HiPlus className="w-5 h-5" />
          New Plan
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_PLANS.map((plan) => (
          <Link key={plan.id} href={`/planner/${plan.id}`}>
            <motion.div
              whileHover={{ y: -4 }}
              className="card p-6 h-full hover:shadow-lg transition-all cursor-pointer"
            >
              <h3 className="font-bold text-foreground mb-3">{plan.title}</h3>
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {plan.subjects.map((subject, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Progress</span>
                  <span className="text-sm font-bold text-foreground">{plan.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${plan.progress}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {plan.startDate} to {plan.endDate}
              </p>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  )
}
