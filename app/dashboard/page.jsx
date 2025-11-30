"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Loader from "@/components/shared/loader"
import VoiceCommandBar from "@/components/shared/voice-command-bar"
import { HiCheckCircle, HiCalendar, HiMicrophone, HiTrendingUp } from "react-icons/hi"
import Link from "next/link"
import axios from "axios"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  const [stats, setStats] = useState({
    tasks_due_today: 0,
    upcoming_events: 0,
    study_hours: 0,
    notes_created: 0
  })

  const [recentTasks, setRecentTasks] = useState([])
  const [recentNotes, setRecentNotes] = useState([])

  // Load dashboard data
  useEffect(() => {
    // In your useEffect
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("access")
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_API_URL}/api/tasks/dashboard/`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const data = res.data

        setStats({
          tasks_due_today: data.tasks_due_today || 0,
          upcoming_events: data.upcoming_events || 0,
          study_hours: data.study_hours || 0,
          notes_created: data.notes_created || 0
        })

        setRecentTasks(Array.isArray(data.recent_tasks) ? data.recent_tasks : [])
        setRecentNotes(Array.isArray(data.recent_notes) ? data.recent_notes : [])

        setIsLoading(false)
      } catch (err) {
        console.error("Dashboard fetch failed", err)
        setRecentTasks([])
        setRecentNotes([])
        setIsLoading(false)
      }
    }

    loadDashboard()
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
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const STATS_CONFIG = [
    { title: "Tasks Due Today", key: "tasks_due_today", icon: HiCheckCircle, color: "text-blue-500" },
    { title: "Upcoming Events", key: "upcoming_events", icon: HiCalendar, color: "text-green-500" },
    { title: "Study Hours", key: "study_hours", icon: HiTrendingUp, color: "text-orange-500" },
    { title: "Notes Created", key: "notes_created", icon: HiMicrophone, color: "text-purple-500" }
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 md:p-8 max-w-7xl mx-auto"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, Bazil! 👋</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Here's what's happening with your studies today.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-8">
        <VoiceCommandBar />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {STATS_CONFIG.map((s, idx) => {
          const Icon = s.icon
          return (
            <motion.div key={idx} whileHover={{ y: -5 }} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{s.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {stats[s.key]}
                  </p>
                </div>
                <Icon className={`w-8 h-8 ${s.color}`} />
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="space-y-3">
        {recentTasks.length < 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No recent tasks</p>
        ) : (
          recentTasks.map((task, index) => (
            <Link key={index} href={`/tasks/${task.id || index}`}>
              <motion.div
                whileHover={{ x: 4 }}
                className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{task.title || "Untitled Task"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${task.priority === "high"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : task.priority
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600"
                      }`}
                  >
                    {task.priority || "none"}
                  </span>
                </div>
              </motion.div>
            </Link>
          ))
        )}
      </div>

      <div className="space-y-3">
        {recentNotes.length < 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No recent notes</p>
        ) : (
          recentNotes.map((note, index) => (
            <Link key={index} href={`/notes/${note.id || index}`}>
              <motion.div
                whileHover={{ x: 4 }}
                className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{note.title || "Untitled Note"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {note.created_at ? new Date(note.created_at).toLocaleDateString() : "Unknown date"} • {note.duration || 0}m
                    </p>
                  </div>
                  <HiMicrophone className="w-4 h-4 text-slate-400" />
                </div>
              </motion.div>
            </Link>
          ))
        )}
      </div>

    </motion.div>
  )
}
