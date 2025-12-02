"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Loader from "@/components/shared/loader"
import { HiArrowLeft, HiPencil, HiTrash, HiPlay, HiDownload } from "react-icons/hi"

const DUMMY_NOTES_DETAIL = {
  1: {
    id: 1,
    title: "Physics Lecture - Chapter 3",
    date: "2024-01-15",
    duration: "45m",
    subject: "Physics",
    transcript:
      "Today we discussed Newton's laws of motion. The first law states that an object in motion stays in motion unless acted upon by an external force. We also covered the concept of inertia and mass...",
    summary:
      "Key concepts: Newton's three laws of motion, inertia, mass, and force relationships. Important examples included pendulums and collision physics.",
  },
}

export default function NoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [note, setNote] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setNote(DUMMY_NOTES_DETAIL[params.noteId])
      setIsLoading(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [params.noteId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  if (!note) {
    return <div className="p-6 text-center">Note not found</div>
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
      className="p-6 md:p-8 max-w-3xl mx-auto"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-2 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-foreground">Note Details</h1>
      </motion.div>

      <motion.div variants={itemVariants} className="card p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{note.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {note.subject} • {note.date} • {note.duration}
            </p>
          </div>
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

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full flex items-center justify-center gap-2 mb-6"
        >
          <HiPlay className="w-5 h-5" />
          Play Recording
        </motion.button>

        <div className="w-full h-12 bg-slate-50 dark:bg-slate-700 rounded-lg mb-6 flex items-center justify-center">
          <div className="flex gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 ${i < 12 ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"}`}
                style={{ height: Math.random() * 20 + 10 }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="card p-6 mb-6">
        <h3 className="font-bold text-foreground mb-4">Transcript</h3>
        <p className="text-foreground leading-relaxed">{note.transcript}</p>
      </motion.div>

      <motion.div variants={itemVariants} className="card p-6 mb-6">
        <h3 className="font-bold text-foreground mb-4">Summary</h3>
        <p className="text-foreground">{note.summary}</p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 btn-primary flex items-center justify-center gap-2"
        >
          <HiDownload className="w-5 h-5" />
          Export
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
