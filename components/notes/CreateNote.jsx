"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import axios from "axios"

export default function NewNoteModal({ open, onClose, onUploaded }) {
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async e => {
    e.preventDefault()
    if (!file) return

    try {
      setLoading(true)

      const token = localStorage.getItem("access")
      const formData = new FormData()

      formData.append("file", file)
      formData.append("title", title || "Untitled Note")
      formData.append("subject", subject || "General")

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/notes/create/pdf/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      )

      setLoading(false)

      if (res.data?.id) {
        onUploaded()
        onClose()
      }
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 p-6 rounded-xl w-full max-w-md shadow-xl"
      >
        <h2 className="text-xl font-semibold text-foreground mb-4">New Note</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              className="input"
              placeholder="Enter title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              className="input"
              placeholder="Enter subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload PDF</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-3"
          >
            {loading ? "Uploading..." : "Create Note"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-2 py-2 rounded-md bg-slate-200 dark:bg-slate-700 text-foreground"
          >
            Cancel
          </button>
        </form>
      </motion.div>
    </div>
  )
}
