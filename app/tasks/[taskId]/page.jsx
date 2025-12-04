"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
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
  HiCheck,
  HiDotsVertical
} from "react-icons/hi"

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [task, setTask] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: "",
    subject: "",
    priority: "",
    status: "",
    due_date: "",
    description: ""
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
        setEditData({
          title: taskData.title,
          subject: taskData.subject,
          priority: taskData.priority,
          status: taskData.status,
          due_date: taskData.due_date,
          description: taskData.description
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
    try {
      const token = localStorage.getItem("access")

      const updateData = {}
      Object.keys(editData).forEach(key => {
        if (editData[key] !== task[key]) {
          updateData[key] = editData[key]
        }
      })

      if (Object.keys(updateData).length === 0) {
        setEditing(false)
        setMenuOpen(false)
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

      setTask(prev => ({ ...prev, ...res.data.task }))
      setEditing(false)
      setMenuOpen(false)
    } catch (err) {
      console.log("Update failed:", err)
      alert("Failed to update task")
    }
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setEditData({
      title: task.title,
      subject: task.subject,
      priority: task.priority,
      status: task.status,
      due_date: task.due_date,
      description: task.description
    })
    setMenuOpen(false)
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
      <div className="p-4 sm:p-6 md:p-8 text-center">
        <p className="text-slate-500">Task not found</p>
      </div>
    )
  }

  const formatDate = (iso) => {
    if (!iso) return "No date"
    const d = new Date(iso)
    // Handle cases where date might be UTC midnight
    const offsetDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    return offsetDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }


  return (
    // 🔑 ADJUSTED PADDING FOR MOBILE
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            // 🔑 Adjusted touch area and size for mobile
            className="p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-colors"
          >
            <HiArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              // 🔑 Adjusted touch area and size for mobile
              className="p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-colors"
            >
              <HiDotsVertical className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  // 🔑 Adjusted width for mobile menu
                  className="absolute right-0 mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10"
                >
                  {editing ? (
                    <>
                      <button
                        onClick={handleCancelEdit}
                        className="w-full px-4 py-2 sm:py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <HiX className="w-5 h-5" />
                        <span className="text-sm font-medium">Cancel</span>
                      </button>
                      <button
                        onClick={handleUpdate}
                        className="w-full px-4 py-2 sm:py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-t border-gray-100 transition-colors"
                      >
                        <HiCheck className="w-5 h-5" />
                        <span className="text-sm font-medium">Save</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditing(true);
                          setMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 sm:py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <HiPencil className="w-5 h-5" />
                        <span className="text-sm font-medium">Edit</span>
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full px-4 py-2 sm:py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-t border-gray-100 transition-colors"
                      >
                        <HiTrash className="w-5 h-5" />
                        <span className="text-sm font-medium">Delete</span>
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        // 🔑 Responsive Grid: Switches to single column on mobile (default is 1, lg:grid-cols-5)
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8"
      >
        {/* Left Column - Main Content */}
        <div className="lg:col-span-3">
          {/* Title Section */}
          <div className="mb-6 sm:mb-8">
            {editing ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                // 🔑 Responsive Title Font Size
                className="text-2xl sm:text-3xl font-bold text-black bg-transparent border-b-2 border-black outline-none w-full pb-2"
              />
            ) : (
              <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">{task.title}</h1>
            )}
          </div>

          <div className="w-full h-[3px] bg-gray-300 mb-5"></div>

          {/* Progress Bar (Visible only in View Mode) */}
          {!editing && task.status !== 'completed' && task.completion_percentage !== undefined && (
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Progress</span>
                <span className="text-sm font-bold text-black">{task.completion_percentage}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${task.completion_percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-black"
                />
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="bg-gray-100 p-4 sm:p-5 rounded-lg grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 pb-4 sm:pb-8 border-b border-gray-200">
            {/* Subject */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HiTag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Subject</span>
              </div>
              {editing ? (
                <input
                  type="text"
                  value={editData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className="text-base sm:text-lg font-semibold text-black bg-transparent border-b border-gray-300 outline-none w-full"
                />
              ) : (
                <p className="text-base sm:text-lg font-semibold text-black">{task.subject}</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HiCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Due Date</span>
              </div>
              {editing ? (
                <input
                  type="date"
                  value={editData.due_date.split('T')[0]}
                  onChange={(e) => handleInputChange("due_date", e.target.value)}
                  className="text-base sm:text-lg font-semibold text-black bg-transparent border-b border-gray-300 outline-none w-full"
                />
              ) : (
                <p className="text-base sm:text-lg font-semibold text-black">{formatDate(task.due_date)}</p>
              )}
            </div>

            {/* Duration */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <HiClock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Duration</span>
              </div>
              <p className="text-base sm:text-lg font-semibold text-black">{Math.round(task.estimated_duration / 60)}h</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Description</h2>
            {editing ? (
              <textarea
                value={editData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                // 🔑 Input Padding/Border Adjustment
                className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg bg-white text-black outline-none focus:border-black transition-colors resize-none text-sm sm:text-base"
                rows={5}
              />
            ) : (
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{task.description}</p>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    // 🔑 Tag size adjustment
                    className="px-2 py-0.5 text-xs sm:text-sm font-medium bg-gray-100 text-black rounded-full border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column - Status & Priority Controls */}
        {/* 🔑 Right column border/padding adjusted for mobile */}
        <div className="lg:col-span-2 lg:border-l lg:border-gray-200 lg:pl-8">
          <div className="sticky top-4 sm:top-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-6">Task Status</h2>

            {/* 🔑 Responsive Grid: grid-cols-1 on mobile, grid-cols-2 on large screens */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">

              {/* Priority */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiFlag className="w-5 h-5 text-black" />
                  <span className="text-xs font-semibold text-black uppercase tracking-wide">Priority</span>
                </div>

                {editing ? (
                  <div className="space-y-2">
                    {[
                      { key: "low", label: "Low Priority", color: "bg-green-200 text-green-700" },
                      { key: "medium", label: "Medium Priority", color: "bg-yellow-300 text-yellow-700" },
                      { key: "high", label: "High Priority", color: "bg-red-200 text-red-700" }
                    ].map(item => (
                      <button
                        key={item.key}
                        onClick={() => handleInputChange("priority", item.key)}
                        // 🔑 Button padding adjusted
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all 
                          ${editData.priority === item.key
                            ? item.color
                            : "bg-gray-100 text-black hover:bg-gray-200"}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span
                    className={`inline-block w-full text-center px-4 py-3 rounded-lg text-sm font-medium
                      ${task.priority === "low"
                        ? "bg-green-200 text-green-700"
                        : task.priority === "medium"
                          ? "bg-yellow-200 text-yellow-700"
                          : "bg-red-200 text-red-700"
                      }`}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Status */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiCheckCircle className="w-5 h-5 text-black" />
                  <span className="text-xs font-semibold text-black uppercase tracking-wide">Status</span>
                </div>

                {editing ? (
                  <div className="space-y-2">
                    {[
                      { key: "pending", label: "Pending", color: "bg-blue-200 text-blue-700" },
                      { key: "in_progress", label: "In Progress", color: "bg-purple-200 text-purple-700" },
                      { key: "completed", label: "Completed", color: "bg-green-200 text-green-700" }
                    ].map(item => (
                      <button
                        key={item.key}
                        onClick={() => handleInputChange("status", item.key)}
                        // 🔑 Button padding adjusted
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all 
                          ${editData.status === item.key
                            ? item.color
                            : "bg-gray-100 text-black hover:bg-gray-200"}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span
                    className={`inline-block w-full text-center px-4 py-3 rounded-lg text-sm font-medium
                      ${task.status === "pending"
                        ? "bg-blue-200 text-blue-700"
                        : task.status === "in_progress"
                          ? "bg-purple-200 text-purple-700"
                          : "bg-green-200 text-green-700"
                      }`}
                  >
                    {task.status.replace("_", " ").toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions in Edit Mode (Now full width on small screens) */}
            {editing && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-4">Click Save in the menu or below to apply changes</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}


            {/* Footer Info */}
            <div className="pt-6 border-t border-gray-200 mt-8">
              <p className="text-[15px] mb-2 text-gray-500 font-[600]">Original Command</p>
              {/* 🔑 Smaller font size for code block on mobile */}
              <p className="text-xs bg-gray-50 p-2 rounded-md border-[2px] border-gray-200 text-gray-400 font-mono overflow-x-auto">{task.original_command}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}