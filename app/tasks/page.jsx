/* Integrated with backend tasks process.env.NEXT_PUBLIC_SERVER_API_URL */
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import Loader from "@/components/shared/loader" 
import Link from "next/link"
import { HiPlus, HiTrash } from "react-icons/hi"
import CreateTask from "@/components/tasks/CreateTask"
import Image from "next/image"

export default function TasksPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("All")
  const [tasks, setTasks] = useState([])
  const [selectedTasks, setSelectedTasks] = useState(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  

  // Helper to get token
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access')
    }
    return null
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    try {
      const token = getToken()
      const res = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/tasks/user/`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // console.log(res.data)
      
      const mapped = res.data.tasks.map(t => ({
        id: t.id,
        title: t.title,
        subject: t.subject,
        dueDate: t.due_date,
        priority: t.priority || "Medium",
        completed: t.status === "completed"
      }))
      setTasks(mapped)
    } catch (err) {
      console.log("Failed to load tasks", err)
      if (err.response?.status === 401) {
        // Redirect to login if unauthorized
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteTasks() {
    const token = getToken()
    const arr = Array.from(selectedTasks)
    
    for (const id of arr) {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/tasks/delete/`, 
          { id }, 
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      } catch (err) {
        console.log("Delete failed", id, err)
        if (err.response?.status === 401) {
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          break
        }
      }
    }
    
    setTasks(tasks.filter(t => !selectedTasks.has(t.id)))
    setSelectedTasks(new Set())
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === "All") return true
    // Use task.dueDate for filtering since it's the ISO date string
    const today = new Date().toISOString().split("T")[0]; 
    if (filter === "Today") return task.dueDate === today
    if (filter === "Overdue") return task.dueDate < today
    if (filter === "Completed") return task.completed
    if (filter.startsWith("By ")) return task.subject === filter.replace("By ", "")
    return true
  })

  const toggleTask = id => {
    const s = new Set(selectedTasks)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelectedTasks(s)
  }

  async function handleVoiceCreated() {
    await fetchTasks()
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
    // 🔑 ADJUSTED PADDING FOR MOBILE: Reduced overall padding on small screens
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 md:p-8 mx-auto">
      <CreateTask open={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleVoiceCreated} />

      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          {/* 🔑 ADJUSTED FONT SIZE FOR MOBILE: text-2xl on mobile, text-3xl on larger screens */}
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage your tasks</p>
        </div>

        {/* 🔑 ADJUSTED BUTTON PADDING FOR MOBILE */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setModalOpen(true)}
          className="px-3 py-2 text-sm sm:px-4 sm:py-2 bg-primary text-white rounded-lg transition-colors font-medium flex items-center gap-2"
        >
          <HiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          Voice
        </motion.button>
      </motion.div>

      {/* 🔑 FILTER BAR: Increased padding for easier tapping and maintained horizontal scrolling */}
      <motion.div variants={itemVariants} className="flex gap-2 mb-6 overflow-x-auto pb-3">
        {["All", "Today", "Overdue", "Completed", "By Mathematics", "By Physics"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            // Adjusted padding to 'px-3 py-1.5' for smaller buttons on mobile
            className={`px-3 py-1.5 rounded-full font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
              filter === f ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-700 text-foreground hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-3 sm:space-y-2">
        {filteredTasks.length ? (
          filteredTasks.map(task => (
            <Link key={task.id} href={`/tasks/${task.id}`} className="block">
              <motion.div 
                whileHover={{ x: 4 }} 
                // 🔑 TASK ITEM PADDING ADJUSTMENT
                className="card p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTasks.has(task.id)}
                  onChange={e => {
                    e.stopPropagation()
                    toggleTask(task.id)
                  }}
                  className="w-5 h-5 rounded border-border cursor-pointer"
                />

                <div className="flex-1 min-w-0"> {/* Added min-w-0 to allow proper truncation on small screens */}
                  <p className={`font-medium truncate ${task.completed ? "line-through text-slate-400" : "text-foreground"}`}>{task.title}</p>
                  {/* 🔑 INFO TEXT SIZE ADJUSTMENT */}
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{task.subject} • {task.dueDate}</p>
                </div>

                <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                  task.priority === "high"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                }`}>
                  {task.priority}
                </span>
              </motion.div>
            </Link>
          ))
        ) : (
          <Image
            src="/todo/noTask.png"
            alt="No tasks available"
            width={400}
            height={400}
            // 🔑 IMAGE SIZE ADJUSTMENT: Ensure it looks good on mobile too
            className="w-full mx-auto bg-transparent max-w-[250px] sm:max-w-xs md:max-w-sm lg:max-w-md object-contain mt-10"
          />
        )}
      </motion.div>

      {selectedTasks.size > 0 && (
        // 🔑 FLOATING BAR ADJUSTMENTS: Fixed width, responsive bottom position
        <motion.div 
          initial={{ y: 100, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 card p-3 sm:p-4 flex items-center justify-between max-w-sm mx-auto md:mx-0"
        >
          <p className="text-sm font-medium">{selectedTasks.size} selected</p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={deleteTasks}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm"
          >
            <HiTrash className="w-4 h-4" />
            Delete
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  )
}