"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { FiX, FiLoader } from "react-icons/fi"
import { FaMicrophone, FaStop } from "react-icons/fa"

export default function CreateEventModal({ open, onClose, onCreated }) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [loading, setLoading] = useState(false)
  const recognitionRef = useRef(null)
  // Ref to hold the final, complete transcript for submission
  const finalTranscriptRef = useRef("")

  // --- Voice Recognition Setup ---
  useEffect(() => {
    if (typeof window === "undefined") return
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true
    recognition.continuous = true // Keep mic open until stopped

    recognition.onresult = event => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += chunk + ' '
        } else {
          interim += chunk
        }
      }

      if (final) {
        finalTranscriptRef.current += final;
      }

      // Display current final + interim transcript
      setTranscript(finalTranscriptRef.current + interim.trim());
    }

    recognition.onend = () => {
      if (listening) {
        setListening(false);
      }
    };


    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  // Reset transcript when modal opens/closes
  useEffect(() => {
    if (!open) {
      setTranscript("")
      finalTranscriptRef.current = ""
      stopListening()
      setLoading(false)
    }
  }, [open])

  // --- Listening Controls ---

  const startListening = () => {
    if (!recognitionRef.current || loading) return
    setListening(true)
    finalTranscriptRef.current = ""
    setTranscript("")
    try {
      recognitionRef.current.stop()
      recognitionRef.current.start()
    } catch (e) {
      console.warn("Recognition start failed (might be already starting)", e);
    }
  }

  const stopListening = () => {
    if (!recognitionRef.current) return
    if (listening) {
      // Finalize the transcript before stopping
      finalTranscriptRef.current = transcript.trim();
      setTranscript(finalTranscriptRef.current);
      setListening(false)
      recognitionRef.current.stop()
    }
  }

  // Toggle function for the single button
  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }

  // --- Event Creation Logic ---

  const createEvent = async () => {
    const description = transcript.trim()
    if (!description) return
    setLoading(true)
    stopListening() // Ensure listening is stopped before API call

    const token = localStorage.getItem("access")
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/events/create/`,
        { description },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // Success, close and notify parent
      onClose()
      if (onCreated) onCreated()
    } catch (err) {
      console.error("Failed to create event", err)
      // Optionally handle specific errors, e.g., show error message
    } finally {
      setLoading(false)
      setTranscript("")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 backdrop-blur-[4px] flex items-center justify-center bg-black/40 z-50">
      <motion.div
        className="relative bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-[330px] md:max-w-md shadow-xl min-h-[400px]"
        initial={{ y: 20, opacity: 0 }} // Adjusted initial Y position for mobile
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full"
          disabled={loading}
          aria-label="Close"
        >
          <FiX className="w-6 h-6" />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Create Event</h2>

        {/* --- Loading Overlay --- */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="absolute inset-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center gap-3">
                <FiLoader className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-medium text-foreground">Creating event...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Larger Mic Area and Toggle Button */}
        <div className="relative h-48 flex flex-col items-center justify-center border-2 border-dashed border-primary/50 dark:border-primary/30 rounded-lg bg-slate-50 dark:bg-slate-700/50 p-4 mb-4">
          <AnimatePresence>
            <button
              onClick={toggleListening} // Use the toggle function
              disabled={loading}
              className={`relative w-32 h-32 flex items-center justify-center transition-transform duration-300 rounded-full ${loading ? "cursor-not-allowed" : "cursor-pointer"}`}
              aria-label={listening ? "Stop Listening" : "Start Listening"}
            >
              {listening && (
                <motion.div
                  key="listening-rings"
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Multiple growing/shrinking circles for audio feedback */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-full h-full rounded-full ${i % 2 === 0 ? 'bg-primary/20' : 'bg-primary/10'}`}
                      animate={{
                        scale: [1, 1.3 + i * 0.1, 1],
                        opacity: [0.8 - i * 0.1, 0.1, 0.8 - i * 0.1]
                      }}
                      transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.3 }}
                    />
                  ))}
                </motion.div>
              )}

              {/* Inner circle - changes color/icon based on state */}
              <motion.div
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl relative z-10 
                ${listening ? 'bg-red-600' : 'bg-primary hover:scale-105'}`}
                whileTap={{ scale: 0.9 }}
              >
                {listening ? (
                  <FaStop className="w-8 h-8 text-white" />
                ) : (
                  <FaMicrophone className="w-8 h-8 text-white" />
                )}
              </motion.div>
            </button>
          </AnimatePresence>

          {/* Status Text Below Mic */}
          <p className="text-sm mt-4 font-medium text-center text-slate-500 dark:text-slate-400">
            {loading
              ? "Processing..."
              : listening
                ? <span className="text-red-600 font-bold">Listening... Tap to Stop</span>
                : "Tap the mic to dictate your event"}
          </p>
        </div>

        {/* Transcript Area (Made Editable for correction) */}
        <textarea
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            finalTranscriptRef.current = e.target.value;
          }}
          placeholder="Transcript will appear here. Edit if needed."
          disabled={loading || listening}
          className={`w-full p-3 h-24 rounded-lg text-sm outline-none transition-all resize-none border ${loading || listening
            ? "bg-slate-200 dark:bg-slate-900 text-slate-400 cursor-not-allowed"
            : "bg-slate-100 dark:bg-slate-700 text-foreground border-slate-300 dark:border-slate-700 focus:border-primary"
            }`}
        />

        {/* Create Button */}
        <button
          onClick={createEvent}
          disabled={loading || !transcript.trim()}
          className={`w-full mt-4 sm:mt-6 px-4 py-3 rounded-xl font-[500] text-md transition-all shadow-lg ${loading || !transcript.trim()
            ? "bg-primary/50 text-white/70 cursor-not-allowed"
            : "bg-primary text-white hover:bg-primary/90"
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <FiLoader className="w-5 h-5 animate-spin" />
              Creating...
            </span>
          ) : (
            "Process & Create Event"
          )}
        </button>
      </motion.div>
    </div>
  )
}