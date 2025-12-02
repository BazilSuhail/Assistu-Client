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
  HiFlag,
  HiX,
  HiCheck
} from "react-icons/hi"

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [task, setTask] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: "",
    subject: "",
    priority: "",
    status: "",
    due_date: ""
  })

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

        const taskData = res.data
        setTask(taskData)
        // Initialize edit data
        setEditData({
          title: taskData.title,
          subject: taskData.subject,
          priority: taskData.priority,
          status: taskData.status,
          due_date: taskData.due_date
        })
      } catch (err) {
        setTask(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTask()
  }, [params.taskId])

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("access")
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/tasks/delete/`,
        { id: params.taskId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      router.push("/tasks")
    } catch (err) {
      console.log("Delete failed:", err)
    }
  }

  const handleUpdate = async () => {
    if (!editing) {
      setEditing(true)
      return
    }

    try {
      const token = localStorage.getItem("access")
      
      // Prepare update data - only include changed fields
      const updateData = {}
      Object.keys(editData).forEach(key => {
        if (editData[key] !== task[key]) {
          updateData[key] = editData[key]
        }
      })

      // If nothing changed, just exit edit mode
      if (Object.keys(updateData).length === 0) {
        setEditing(false)
        return
      }

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/tasks/update/`,
        { 
          id: params.taskId, 
          update: updateData 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // Update local state with response
      setTask(prev => ({ ...prev, ...res.data.task }))
      setEditing(false)
    } catch (err) {
      console.log("Update failed:", err)
      alert("Failed to update task")
    }
  }

  const handleCancelEdit = () => {
    setEditing(false)
    // Reset edit data to current task values
    setEditData({
      title: task.title,
      subject: task.subject,
      priority: task.priority,
      status: task.status,
      due_date: task.due_date
    })
  }

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

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

  const formatDate = (iso) => {
    if (!iso) return "No date"
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
          {editing ? (
            <input
              type="text"
              value={editData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="text-2xl font-semibold text-foreground bg-transparent border-b border-primary outline-none w-full"
            />
          ) : (
            <h2 className="text-2xl font-semibold text-foreground">{task.title}</h2>
          )}

          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50"
                >
                  <HiX className="w-5 h-5" />
                </button>
                <button
                  onClick={handleUpdate}
                  className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50"
                >
                  <HiCheck className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleUpdate}
                  className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  <HiPencil className="w-5 h-5 text-blue-600" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  <HiTrash className="w-5 h-5 text-red-600" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Subject */}
          <div className="flex items-start gap-3">
            <HiTag className="w-5 h-5 text-slate-500 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-slate-500">Subject</p>
              {editing ? (
                <input
                  type="text"
                  value={editData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className="font-medium text-foreground bg-transparent border-b border-primary outline-none w-full"
                />
              ) : (
                <p className="font-medium text-foreground">{task.subject}</p>
              )}
            </div>
          </div>

          {/* Priority */}
          <div className="flex items-start gap-3">
            <HiFlag className="w-5 h-5 text-slate-500 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-slate-500">Priority</p>
              {editing ? (
                <select
                  value={editData.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                  className="font-medium bg-transparent border-b border-primary outline-none w-full"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              ) : (
                <p className={`font-medium ${
                  task.priority === "high"
                    ? "text-red-600"
                    : task.priority === "medium"
                    ? "text-yellow-600"
                    : "text-slate-600"
                }`}>
                  {task.priority}
                </p>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-start gap-3">
            <HiCalendar className="w-5 h-5 text-slate-500 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-slate-500">Due Date</p>
              {editing ? (
                <input
                  type="date"
                  value={editData.due_date.split('T')[0]}
                  onChange={(e) => handleInputChange("due_date", e.target.value)}
                  className="font-medium text-foreground bg-transparent border-b border-primary outline-none w-full"
                />
              ) : (
                <p className="font-medium text-foreground">
                  {formatDate(task.due_date)}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-3">
            <HiCheckCircle className="w-5 h-5 text-slate-500 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-slate-500">Status</p>
              {editing ? (
                <select
                  value={editData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="font-medium bg-transparent border-b border-primary outline-none w-full"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              ) : (
                <p className="font-medium text-foreground">{task.status}</p>
              )}
            </div>
          </div>
        </div>

        {/* Estimated Duration */}
        <div className="flex items-start gap-3 mb-6">
          <HiClock className="w-5 h-5 text-slate-500 mt-1" />
          <div>
            <p className="text-sm text-slate-500">Estimated Duration</p>
            <p className="font-medium text-foreground">
              {Math.round(task.estimated_duration / 60)} hours
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-sm text-slate-500 mb-1">Description</p>
          {editing ? (
            <textarea
              value={editData.description || task.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full p-2 border border-primary rounded-lg bg-transparent text-foreground outline-none"
              rows={4}
            />
          ) : (
            <p className="text-foreground">{task.description}</p>
          )}
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