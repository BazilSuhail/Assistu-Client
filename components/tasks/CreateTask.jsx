"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import axios from "axios"

export default function CreateTask({ open, onClose, onCreated }) {
  const [mode, setMode] = useState("voice") 
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [prompt, setPrompt] = useState("")
  const recognitionRef = useRef(null)
 

  // Helper to get token
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access')
    }
    return null
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true
    recognition.continuous = true

    recognition.onresult = event => {
      const result = Array.from(event.results)
        .map(r => r[0].transcript)
        .join("")
      setTranscript(result)
    }

    recognitionRef.current = recognition
  }, [])

  const startListening = () => {
    if (!recognitionRef.current) return
    setListening(true)
    setTranscript("")
    recognitionRef.current.start()
  }

  const stopListening = () => {
    if (!recognitionRef.current) return
    setListening(false)
    recognitionRef.current.stop()
  }

  async function createTask() {
    const description = mode === "voice" ? transcript : prompt
    if (!description.trim()) return

    const token = getToken()

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/tasks/create/`,
        { description },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      setTranscript("")
      setPrompt("")
      setListening(false)

      if (onCreated) onCreated()
      onClose()
    } catch (err) {
      console.log("Task creation failed", err)
      if (err.response?.status === 401) {
        // Redirect to login if unauthorized
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-600 dark:text-slate-300 text-sm"
        >
          Close
        </button>

        <h2 className="text-xl font-semibold text-foreground mb-4">Create Task</h2>

        {/* Mode Switch */}
        <div className="flex mb-4 gap-2">
          <button
            onClick={() => setMode("voice")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium ${
              mode === "voice"
                ? "bg-primary text-white"
                : "bg-slate-200 dark:bg-slate-700 text-foreground"
            }`}
          >
            Voice
          </button>

          <button
            onClick={() => setMode("nlp")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium ${
              mode === "nlp"
                ? "bg-primary text-white"
                : "bg-slate-200 dark:bg-slate-700 text-foreground"
            }`}
          >
            NLP Prompt
          </button>
        </div>

        {/* VOICE MODE */}
        {mode === "voice" && (
          <>
            <div className="relative h-32 flex items-center justify-center border border-slate-300 dark:border-slate-700 rounded-lg">
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

            <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg h-24 overflow-auto text-sm text-foreground">
              {transcript || "Transcript will appear here"}
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={startListening}
                className="px-4 py-2 bg-primary text-white rounded-lg"
              >
                Start
              </button>

              <button
                onClick={stopListening}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Stop
              </button>
            </div>
          </>
        )}

        {/* NLP MODE */}
        {mode === "nlp" && (
          <>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe your task..."
              className="w-full p-3 h-32 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm outline-none text-foreground"
            />

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Example: Prepare notes for physics exam due Friday
            </p>
          </>
        )}

        {/* Create Button */}
        <button
          onClick={createTask}
          className="w-full mt-6 px-4 py-2 bg-primary text-white rounded-lg font-medium"
        >
          Create Task
        </button>
      </div>
    </div>
  )
}