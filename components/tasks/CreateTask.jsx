"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import axios from "axios"

export default function CreateTask({ open, onClose, onCreated }) {
  const [mode, setMode] = useState("voice") 
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
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

  // Reset all states
  const resetForm = () => {
    setTranscript("")
    setPrompt("")
    setListening(false)
    setIsCreating(false)
    setLoading(false)
  }

  async function createTask() {
    // Prevent double-click
    if (isCreating || loading) return
    
    const description = mode === "voice" ? transcript : prompt
    if (!description.trim()) return

    const token = getToken()
    setIsCreating(true)
    setLoading(true)

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/tasks/create/`,
        { description },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      // Reset form after success
      resetForm()

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
      // Reset creating state on error
      setIsCreating(false)
      setLoading(false)
    }
  }

  // Reset when modal opens/closes
  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-600 dark:text-slate-300 text-sm"
          disabled={loading}
        >
          Close
        </button>

        <h2 className="text-xl font-semibold text-foreground mb-4">Create Task</h2>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-foreground">Creating task...</p>
            </div>
          </div>
        )}

        {/* Mode Switch */}
        <div className="flex mb-4 gap-2">
          <button
            onClick={() => !loading && setMode("voice")}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              mode === "voice"
                ? "bg-primary text-white"
                : "bg-slate-200 dark:bg-slate-700 text-foreground"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Voice
          </button>

          <button
            onClick={() => !loading && setMode("nlp")}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              mode === "nlp"
                ? "bg-primary text-white"
                : "bg-slate-200 dark:bg-slate-700 text-foreground"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
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
                <div className={`text-sm ${loading ? "text-slate-400" : "text-slate-500"}`}>
                  {loading ? "Processing..." : "Press Start to speak"}
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg h-24 overflow-auto text-sm text-foreground">
              {transcript || "Transcript will appear here"}
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={startListening}
                disabled={loading || listening}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  loading || listening
                    ? "bg-primary/50 text-white/70 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {listening ? "Listening..." : "Start"}
              </button>

              <button
                onClick={stopListening}
                disabled={loading || !listening}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  loading || !listening
                    ? "bg-red-600/50 text-white/70 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
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
              onChange={e => !loading && setPrompt(e.target.value)}
              placeholder="Describe your task..."
              disabled={loading}
              className={`w-full p-3 h-32 rounded-lg text-sm outline-none transition-all ${
                loading
                  ? "bg-slate-200 dark:bg-slate-900 text-slate-400 cursor-not-allowed"
                  : "bg-slate-100 dark:bg-slate-700 text-foreground"
              }`}
            />

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Example: Prepare notes for physics exam due Friday
            </p>
          </>
        )}

        {/* Create Button */}
        <button
          onClick={createTask}
          disabled={isCreating || loading || (!transcript.trim() && !prompt.trim())}
          className={`w-full mt-6 px-4 py-2 rounded-lg font-medium transition-all ${
            isCreating || loading || (!transcript.trim() && !prompt.trim())
              ? "bg-primary/50 text-white/70 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Creating...
            </span>
          ) : (
            "Create Task"
          )}
        </button>
      </div>
    </div>
  )
}