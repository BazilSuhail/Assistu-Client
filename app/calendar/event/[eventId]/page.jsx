"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Loader from "@/components/shared/loader"
import { HiArrowLeft, HiPencil, HiTrash } from "react-icons/hi"

const DUMMY_EVENTS_DETAIL = {
  1: {
    id: 1,
    title: "Math Lecture",
    date: "2024-01-15",
    time: "10:00 AM",
    duration: "1 hour",
    location: "Room 101",
    description: "Calculus - Integration techniques",
    recurrence: "Weekly on Monday",
  },
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [event, setEvent] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setEvent(DUMMY_EVENTS_DETAIL[params.eventId])
      setIsLoading(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [params.eventId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  if (!event) {
    return <div className="p-6 text-center">Event not found</div>
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
      className="p-6 md:p-8 max-w-2xl mx-auto"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-2 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-foreground">Event Details</h1>
      </motion.div>

      <motion.div variants={itemVariants} className="card p-8">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">{event.title}</h2>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <HiPencil className="w-5 h-5 text-blue-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <HiTrash className="w-5 h-5 text-red-600" />
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Date</label>
            <p className="font-medium text-foreground">{event.date}</p>
          </div>
          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Time</label>
            <p className="font-medium text-foreground">{event.time}</p>
          </div>
          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Duration</label>
            <p className="font-medium text-foreground">{event.duration}</p>
          </div>
          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Location</label>
            <p className="font-medium text-foreground">{event.location}</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm text-slate-500 dark:text-slate-400 block mb-2">Description</label>
          <p className="text-foreground">{event.description}</p>
        </div>

        <div className="mb-6">
          <label className="text-sm text-slate-500 dark:text-slate-400 block mb-2">Recurrence</label>
          <p className="text-foreground">{event.recurrence}</p>
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full">
          Send Reminder
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
