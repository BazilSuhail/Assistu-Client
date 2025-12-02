"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import axios from "axios"
import Loader from "@/components/shared/loader"
import {
  HiArrowLeft,
  HiPencil,
  HiTrash,
  HiCheckCircle,
  HiClock,
  HiCalendar,
  HiTag,
  HiFlag
} from "react-icons/hi"

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [task, setTask] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = localStorage.getItem("access")
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_API_URL}/tasks/${params.taskId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        setTask(res.data)
      } catch (err) {
        setTask(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTask()
  }, [params.taskId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="p-6 md:p-8 text-center">
        <p className="text-slate-500">Task not found</p>
      </div>
    )
  }

  const formatDate = iso => {
    const d = new Date(iso)
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
        >
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-foreground">Task Details</h1>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg w-full"
      >
        {/* Title Row */}
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">{task.title}</h2>

          <div className="flex gap-2">
            <button className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <HiPencil className="w-5 h-5 text-blue-600" />
            </button>

            <button className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <HiTrash className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Subject */}
          <div className="flex items-start gap-3">
            <HiTag className="w-5 h-5 text-slate-500 mt-1" />
            <div>
              <p className="text-sm text-slate-500">Subject</p>
              <p className="font-medium text-foreground">{task.subject}</p>
            </div>
          </div>

          {/* Priority */}
          <div className="flex items-start gap-3">
            <HiFlag className="w-5 h-5 text-slate-500 mt-1" />
            <div>
              <p className="text-sm text-slate-500">Priority</p>
              <p
                className={`font-medium ${
                  task.priority === "high"
                    ? "text-red-600"
                    : task.priority === "medium"
                    ? "text-yellow-600"
                    : "text-slate-600"
                }`}
              >
                {task.priority}
              </p>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-start gap-3">
            <HiCalendar className="w-5 h-5 text-slate-500 mt-1" />
            <div>
              <p className="text-sm text-slate-500">Due Date</p>
              <p className="font-medium text-foreground">
                {formatDate(task.due_date)}
              </p>
            </div>
          </div>

          {/* Estimated Duration */}
          <div className="flex items-start gap-3">
            <HiClock className="w-5 h-5 text-slate-500 mt-1" />
            <div>
              <p className="text-sm text-slate-500">Estimated Duration</p>
              <p className="font-medium text-foreground">
                {Math.round(task.estimated_duration / 60)} hours
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-sm text-slate-500 mb-1">Description</p>
          <p className="text-foreground">{task.description}</p>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="mb-8">
            <p className="text-sm text-slate-500 mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 rounded-full text-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-2 mb-6">
          <HiCheckCircle
            className={`w-5 h-5 ${
              task.status === "completed" ? "text-green-600" : "text-slate-500"
            }`}
          />
          <p className="font-medium text-foreground">{task.status}</p>
        </div>

        {/* RawCommand */}
        <div className="mt-8">
          <p className="text-sm text-slate-500 mb-1">Original Command</p>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            {task.original_command}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
