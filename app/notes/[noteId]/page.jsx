"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { motion } from "framer-motion"
import Loader from "@/components/shared/loader"
import { HiArrowLeft, HiPencil, HiTrash, HiDownload } from "react-icons/hi"

export default function NoteDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [note, setNote] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const noteId = params.noteId
 

  async function loadNote() {
    try {
      const token = localStorage.getItem("access")

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/notes/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
//console.log(res.data)
      setNote(res.data)
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (isDeleting) return
    setIsDeleting(true)

    try {
      
      const token = localStorage.getItem("access")

      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/notes/delete/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      router.push("/notes")
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    loadNote()
  }, [noteId])

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
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
        >
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-foreground">Note Details</h1>
      </motion.div>

      <motion.div variants={itemVariants} className="card p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{note.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {note.subject}
            </p>
          </div>

          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.05 }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <HiPencil className="w-5 h-5 text-blue-600" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleDelete}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <HiTrash className="w-5 h-5 text-red-600" />
            </motion.button>
          </div>
        </div>
      </motion.div>
      <motion.div variants={itemVariants} className="card p-6 mb-6">
        <h3 className="font-bold text-foreground mb-4">Summary</h3>
        <p className="text-foreground">{note.summary}</p>
      </motion.div>

      {note.explanation?.length > 0 && (
        <motion.div variants={itemVariants} className="card p-6 mb-6">
          <h3 className="font-bold text-foreground mb-4">Explanation</h3>
          <ul className="text-foreground space-y-2">
            {note.explanation.map((item, i) => (
              <li key={i} className="border-b border-slate-200 dark:border-slate-700 pb-2">
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {note.categories?.length > 0 && (
        <motion.div variants={itemVariants} className="card p-6 mb-6">
          <h3 className="font-bold text-foreground mb-4">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {note.categories.map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {note.keywords?.length > 0 && (
        <motion.div variants={itemVariants} className="card p-6 mb-6">
          <h3 className="font-bold text-foreground mb-4">Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {note.keywords.map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {note.tags?.length > 0 && (
        <motion.div variants={itemVariants} className="card p-6 mb-6">
          <h3 className="font-bold text-foreground mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}

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

      <motion.div variants={itemVariants} className="card p-6 mb-6">
        <h3 className="font-bold text-foreground mb-4">Transcript</h3>
        <p className="text-foreground whitespace-pre-line leading-relaxed">{note.transcript}</p>
      </motion.div>

    </motion.div>
  )
}
