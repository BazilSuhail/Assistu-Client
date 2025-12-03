"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import axios from "axios"

export default function CreateEventModal({ open, onClose, onCreated }) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [loading, setLoading] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true
    recognition.continuous = true

    recognition.onresult = event => {
      const result = Array.from(event.results).map(r => r[0].transcript).join("")
      setTranscript(result)
    }

    recognitionRef.current = recognition
  }, [])

  const startListening = () => {
    if (!recognitionRef.current) return
    setListening(true)
    recognitionRef.current.start()
  }

  const stopListening = () => {
    if (!recognitionRef.current) return
    setListening(false)
    recognitionRef.current.stop()
  }

  const createEvent = async () => {
    if (!transcript.trim()) return
    setLoading(true)
    const token = localStorage.getItem("access")
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/events/create/`,
        { description: transcript },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setTranscript("")
      onClose()
      if (onCreated) onCreated()
    } catch (err) {
      console.error("Failed to create event", err)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-600 dark:text-slate-300 text-sm">Close</button>

        <h2 className="text-xl font-semibold text-foreground mb-4">Create Event</h2>

        <div className="relative h-32 flex items-center justify-center border border-slate-300 dark:border-slate-700 rounded-lg mb-4">
          {listening ? (
            <motion.div
              className="w-20 h-20 bg-primary/30 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />
          ) : (
            <div className="text-slate-500 text-sm">Press Start to speak</div>
          )}
        </div>

        <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg h-24 overflow-auto text-sm text-foreground">
          {transcript || "Transcript will appear here"}
        </div>

        <div className="flex items-center justify-between mt-4">
          <button onClick={startListening} className="px-4 py-2 bg-primary text-white rounded-lg">Start</button>
          <button onClick={stopListening} className="px-4 py-2 bg-red-600 text-white rounded-lg">Stop</button>
          <button onClick={createEvent} className="px-4 py-2 bg-green-600 text-white rounded-lg" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  )
}
