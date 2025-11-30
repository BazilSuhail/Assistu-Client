"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Loader from "@/components/shared/loader"
import { HiArrowLeft, HiPencil, HiTrash, HiCheck } from "react-icons/hi"

const DUMMY_TASKS_DETAIL = {
  1: {
    id: 1,
    title: "Complete Math Assignment",
    description: "Complete exercises 1-10 from Chapter 5. Focus on integration problems.",
    dueDate: "2024-01-15",
    priority: "High",
    subject: "Mathematics",
    completed: false,
    subtasks: [
      { id: 1, title: "Read chapter 5", completed: true },
      { id: 2, title: "Watch video tutorial", completed: false },
      { id: 3, title: "Solve practice problems", completed: false },
    ],
    history: ["Created on Jan 10", "Updated on Jan 12"],
  },
  2: {
    id: 2,
    title: "Read Chapter 5",
    description: "Complete reading of Chapter 5 with notes",
    dueDate: "2024-01-16",
    priority: "Medium",
    subject: "English",
    completed: false,
    subtasks: [],
    history: ["Created on Jan 11"],
  },
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [task, setTask] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setTask(DUMMY_TASKS_DETAIL[params.taskId])
      setIsLoading(false)
    }, 3000)
    return () => clearTimeout(timer)
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
        <h1 className="text-3xl font-bold text-foreground">Task Details</h1>
      </motion.div>

      <motion.div variants={itemVariants} className="card p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                defaultValue={task.title}
                className="text-2xl font-bold bg-input border border-border rounded-lg w-full px-3 py-2 dark:bg-slate-700"
              />
            ) : (
              <h2 className="text-2xl font-bold text-foreground">{task.title}</h2>
            )}
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <HiPencil className="w-5 h-5 text-blue-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <HiTrash className="w-5 h-5 text-red-600" />
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Subject</label>
            <p className="font-medium text-foreground">{task.subject}</p>
          </div>
          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Priority</label>
            <p className={`font-medium ${task.priority === "High" ? "text-red-600" : "text-yellow-600"}`}>
              {task.priority}
            </p>
          </div>
          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Due Date</label>
            <p className="font-medium text-foreground">{task.dueDate}</p>
          </div>
          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Status</label>
            <p className="font-medium text-foreground">{task.completed ? "Completed" : "In Progress"}</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm text-slate-500 dark:text-slate-400 block mb-2">Description</label>
          {isEditing ? (
            <textarea
              defaultValue={task.description}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input dark:bg-slate-700 text-foreground"
              rows="4"
            />
          ) : (
            <p className="text-foreground">{task.description}</p>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <HiCheck className="w-5 h-5" />
          Mark as Complete
        </motion.button>
      </motion.div>

      {task.subtasks.length > 0 && (
        <motion.div variants={itemVariants} className="card p-6 mb-6">
          <h3 className="font-bold text-foreground mb-4">Subtasks</h3>
          <div className="space-y-2">
            {task.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <input type="checkbox" defaultChecked={subtask.completed} className="w-4 h-4" />
                <span className={subtask.completed ? "line-through text-slate-400" : "text-foreground"}>
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="card p-6">
        <h3 className="font-bold text-foreground mb-4">Edit History</h3>
        <div className="space-y-2">
          {task.history.map((entry, idx) => (
            <p key={idx} className="text-sm text-slate-600 dark:text-slate-400">
              {entry}
            </p>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
