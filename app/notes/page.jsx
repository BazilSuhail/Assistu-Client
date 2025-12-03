"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Loader from "@/components/shared/loader"
import Link from "next/link"
import { HiPlus, HiMicrophone } from "react-icons/hi"
import NewNoteModal from "@/components/notes/CreateNote"


export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [showModal, setShowModal] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState("grid")
  const [filter, setFilter] = useState("All")
  const [filters, setFilters] = useState(["All"])

  useEffect(() => {
    async function fetchNotes() {
      try {
        const token = localStorage.getItem("access")
        if (!token) {
          setIsLoading(false)
          return
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/notes/all/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await res.json()

        if (data.notes) {
          setNotes(data.notes)

          const subjects = [...new Set(data.notes.map(n => n.subject))]
          setFilters(["All", ...subjects])
        }
      } catch (e) {
        console.log("Fetch error", e)
      }

      setIsLoading(false)
    }

    fetchNotes()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  const filteredNotes =
    filter === "All" ? notes : notes.filter(n => n.subject === filter)

  const formatDate = d => {
    const date = new Date(d)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 md:p-8 max-w-6xl mx-auto"
    >
      <NewNoteModal
  open={showModal}
  onClose={() => setShowModal(false)}
  onUploaded={() => {
    window.location.reload()
  }}
/>

      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notes</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Your stored notes</p>
        </div>
        
        <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => setShowModal(true)}
  className="btn-primary flex items-center gap-2"
>
  <HiPlus className="w-5 h-5" />
  New Note
</motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-2 mb-6 overflow-x-auto">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${
              filter === f
                ? "bg-primary text-white"
                : "bg-slate-100 dark:bg-slate-700 text-foreground hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      <motion.div
        variants={itemVariants}
        className={
          view === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-2"
        }
      >
        {filteredNotes.map(note => (
          <Link key={note.id} href={`/notes/${note.id}`}>
            <motion.div
              whileHover={{ y: -4 }}
              className={`card p-6 hover:shadow-lg transition-all cursor-pointer ${
                view === "grid" ? "h-full" : ""
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <HiMicrophone className="w-5 h-5 text-purple-600" />
                </div>

                <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700">
                  {note.importance || "Medium"}
                </span>
              </div>

              <p className="font-medium text-foreground mb-2">{note.title}</p>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                {note.subject} • {formatDate(note.created_at)}
              </p>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  )
}
