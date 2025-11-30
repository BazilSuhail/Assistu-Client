/* Integrated TasksPage with VoiceModal */
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Loader from "@/components/shared/loader"
import VoiceModal from "@/components/tasks/VoiceModal"
import Link from "next/link"
import { HiPlus, HiTrash } from "react-icons/hi" 

const DUMMY_TASKS = [
  { id: 1, title: "Complete Math Assignment", dueDate: "2024-01-15", subject: "Mathematics", priority: "High", completed: false },
  { id: 2, title: "Read Chapter 5", dueDate: "2024-01-16", subject: "English", priority: "Medium", completed: false },
  { id: 3, title: "Lab Report", dueDate: "2024-01-12", subject: "Physics", priority: "High", completed: false },
  { id: 4, title: "Project Submission", dueDate: "2024-01-18", subject: "Computer Science", priority: "High", completed: true },
  { id: 5, title: "Study for Exam", dueDate: "2024-01-20", subject: "Chemistry", priority: "Medium", completed: false }
]

export default function TasksPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("All")
  const [tasks, setTasks] = useState(DUMMY_TASKS)
  const [selectedTasks, setSelectedTasks] = useState(new Set())
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const filteredTasks = tasks.filter(task => {
    if (filter === "All") return true
    if (filter === "Today") return task.dueDate === "2024-01-15"
    if (filter === "Overdue") return task.dueDate < "2024-01-15"
    if (filter === "Completed") return task.completed
    if (filter.startsWith("By ")) return task.subject === filter.replace("By ", "")
    return true
  })

  const toggleTask = id => {
    const s = new Set(selectedTasks)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelectedTasks(s)
  }

  const deleteTasks = () => {
    setTasks(tasks.filter(t => !selectedTasks.has(t.id)))
    setSelectedTasks(new Set())
  }

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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 md:p-8 max-w-4xl mx-auto">
      <VoiceModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your tasks</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg transition-colors font-medium flex items-center gap-2"
        >
          <HiPlus className="w-5 h-5" />
          Voice
        </motion.button>
      </motion.div>
 
      <motion.div variants={itemVariants} className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["All", "Today", "Overdue", "Completed", "By Mathematics", "By Physics"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${
              filter === f ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-700 text-foreground hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        {filteredTasks.length ? (
          filteredTasks.map(task => (
            <Link key={task.id} href={`/tasks/${task.id}`}>
              <motion.div whileHover={{ x: 4 }} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTasks.has(task.id)}
                  onChange={e => {
                    e.stopPropagation()
                    toggleTask(task.id)
                  }}
                  className="w-5 h-5 rounded border-border cursor-pointer"
                />

                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? "line-through text-slate-400" : "text-foreground"}`}>{task.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{task.subject} • {task.dueDate}</p>
                </div>

                <span className={`text-xs font-medium px-3 py-1 rounded-full ${task.priority === "High" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"}`}>
                  {task.priority}
                </span>
              </motion.div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">No tasks found</div>
        )}
      </motion.div>

      {selectedTasks.size > 0 && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-20 md:bottom-6 left-6 right-6 md:left-auto md:right-6 card p-4 flex items-center justify-between">
          <p className="text-sm font-medium">{selectedTasks.size} selected</p>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={deleteTasks} className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium">
            <HiTrash className="w-4 h-4" />
            Delete
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  )
}