"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Loader from "@/components/shared/loader"
import VoiceCommandBar from "@/components/shared/voice-command-bar"
import { HiChevronLeft, HiChevronRight } from "react-icons/hi"

const DUMMY_EVENTS = [
  { id: 1, title: "Math Lecture", date: "2024-01-15", time: "10:00 AM", type: "event" },
  { id: 2, title: "Physics Lab", date: "2024-01-16", time: "2:00 PM", type: "event" },
  { id: 3, title: "Assignment Due", date: "2024-01-17", time: "11:59 PM", type: "deadline" },
  { id: 4, title: "Chemistry Exam", date: "2024-01-20", time: "9:00 AM", type: "exam" },
]

export default function CalendarPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState("Month")

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

  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 md:p-8 max-w-6xl mx-auto"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Track your events and deadlines</p>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-8">
        <VoiceCommandBar />
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-2 mb-6">
        {["Month", "Week", "Day"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === v
                ? "bg-primary text-white"
                : "bg-slate-100 dark:bg-slate-700 text-foreground hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            {v}
          </button>
        ))}
      </motion.div>

      {view === "Month" && (
        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">January 2024</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <HiChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <HiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-bold text-sm text-slate-600 dark:text-slate-400 py-2">
                {day}
              </div>
            ))}
            {monthDays.map((day) => (
              <div
                key={day}
                className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${
                  day === 15
                    ? "bg-primary text-white font-bold"
                    : "bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="mt-8">
        <h3 className="text-lg font-bold text-foreground mb-4">Upcoming Events</h3>
        <div className="space-y-2">
          {DUMMY_EVENTS.map((event) => (
            <motion.div
              key={event.id}
              whileHover={{ x: 4 }}
              className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  event.type === "deadline" ? "bg-red-500" : event.type === "exam" ? "bg-purple-500" : "bg-blue-500"
                }`}
              />
              <div className="flex-1">
                <p className="font-medium text-foreground">{event.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {event.date} at {event.time}
                </p>
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {event.type}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
