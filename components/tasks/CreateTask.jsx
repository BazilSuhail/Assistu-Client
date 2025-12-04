"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { FiMic, FiType, FiX, FiCheck, FiCpu, FiLoader, FiUser } from "react-icons/fi"
import { FaMicrophone, FaStop } from "react-icons/fa"

// --- Helper: Voice Synthesis Setup (Unchanged) ---
let voices = []

const loadVoices = () => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    voices = window.speechSynthesis.getVoices()
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices()
      }
    }
  }
}

const speakConfirmation = (taskTitle, callback) => {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    if (callback) callback()
    return;
  }

  const textToSpeak = `Task created successfully with the title: ${taskTitle}`;
  const utterance = new SpeechSynthesisUtterance(textToSpeak);

  // Attempt to use a preferred voice
  const preferredVoice = voices.find(v => v.name.includes('Google') && v.name.includes('English') && v.name.includes('Female')) || voices[0];

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.volume = 1
  utterance.rate = 1.05
  utterance.pitch = 1

  // CRUCIAL: Call the callback (which closes the modal) ONLY after the speech ends
  utterance.onend = () => {
    if (callback) {
      callback();
    }
  };

  utterance.onerror = (event) => {
    console.error('Speech synthesis error, closing anyway:', event);
    if (callback) {
      callback(); // Close the modal even on error
    }
  };

  window.speechSynthesis.speak(utterance);
}

// --- Component Start ---

export default function CreateTask({ open, onClose, onCreated }) {
  const [mode, setMode] = useState("voice")
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successTitle, setSuccessTitle] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef("")

  // --- Hooks for Initialization and Cleanup (Unchanged) ---

  // Load voices immediately when component mounts
  useEffect(() => {
    loadVoices()
  }, [])

  // Initialize Speech Recognition when component mounts
  useEffect(() => {
    if (typeof window === "undefined") return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
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

      setTranscript(finalTranscriptRef.current + interim.trim());
    }

    recognition.onend = () => {
      // Note: recognition.onend fires after recognition.stop() or when silent for too long.
      // We only want to set listening to false if it was active when the event fired.
      if (listening) {
        setListening(false);
      }
    };

    recognition.onerror = (event) => {
      console.error('Recognition error:', event);
      setListening(false);
    };

    recognitionRef.current = recognition

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  // Reset when modal opens/closes
  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  // --- Helper Functions ---

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access')
    }
    return null
  }

  const startListening = () => {
    if (!recognitionRef.current || loading) return
    setListening(true)
    finalTranscriptRef.current = ""
    setTranscript("")

    try {
      // Stopping first ensures a clean restart
      recognitionRef.current.stop()
      recognitionRef.current.start()
    } catch (e) {
      console.warn("Recognition start failed (might be already starting)", e);
    }
  }

  const stopListening = () => {
    if (!recognitionRef.current) return
    if (listening) {
      // Update transcript state with current full transcript
      finalTranscriptRef.current = transcript.trim();
      setTranscript(finalTranscriptRef.current);
      setListening(false);
      recognitionRef.current.stop();
    }
  }

  // **New Toggle Function**
  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }

  const resetForm = () => {
    setTranscript("")
    setPrompt("")
    finalTranscriptRef.current = ""
    stopListening()
    setIsCreating(false)
    setLoading(false)
    setSuccess(false)
    setSuccessTitle("")
    setIsSpeaking(false)
  }

  // --- Task Creation Logic (Unchanged) ---

  async function createTask() {
    if (isCreating || loading) return

    const description = mode === "voice" ? transcript : prompt
    if (!description.trim()) return

    const token = getToken()
    setIsCreating(true)
    setLoading(true)
    stopListening()

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/tasks/create/`,
        { description },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const taskTitle = response.data.title || "Untitled Task"

      setSuccessTitle(taskTitle)
      setLoading(false)
      setSuccess(true)

      const closeHandler = () => {
        resetForm()
        if (onCreated) onCreated()
        onClose()
      }

      setIsSpeaking(true);
      speakConfirmation(taskTitle, closeHandler)

    } catch (err) {
      console.error("Task creation failed", err)
      if (err.response?.status === 401) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
      setIsCreating(false)
      setLoading(false)
    }
  }

  if (!open) return null

  // --- Component JSX (Updated UI: Larger Mic Area & Toggle Logic) ---

  // Custom Speaking Animation for Agent Feedback
  const SpeakingIndicator = () => (
    <motion.div className="flex space-x-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          animate={{
            y: [0, -5, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </motion.div>
  )

  // Success Animation Component (Unchanged)
  const SuccessView = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex flex-col items-center justify-center h-full text-center py-8"
    >
      {/* Animated Checkmark */}
      <motion.div
        className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-6 shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <FiCheck className="w-12 h-12 text-white" />
      </motion.div>

      <h3 className="text-2xl font-bold text-green-500 mb-2">Success!</h3>
      <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
        Task: {successTitle}
      </p>

      <div className="flex items-center gap-2 mt-4 text-primary font-medium">
        <FiCpu className="w-5 h-5" />
        <p className="text-sm">
          {isSpeaking ? (
            <span className="flex items-center gap-1">Agent Speaking  <SpeakingIndicator /></span>
          ) : (
            "Closing Modal..."
          )}
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 flex backdrop-blur-[4px] items-center justify-center bg-black/40 z-50 p-4">
      <motion.div
        // 🔑 MODAL SIZE ADJUSTMENTS: Use w-[95%] on mobile and set min-height to fit content.
        className="relative bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 w-[95%] sm:w-full max-w-md shadow-xl min-h-fit"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full"
          disabled={loading || success || isSpeaking}
          aria-label="Close"
        >
          <FiX className="w-6 h-6" />
        </button>

        {!success && (
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">New Task</h2>
        )}

        {/* --- MAIN CONTENT SWITCH --- */}
        <AnimatePresence mode="wait">
          {success ? (
            <SuccessView key="success" />
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Loading Overlay */}
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
                      <p className="text-sm font-medium text-foreground">Analyzing & Creating...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mode Switch */}
              <div className="flex mb-6 gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-xl">
                <button
                  onClick={() => { !loading && stopListening(); setMode("voice"); }}
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-medium transition-all ${mode === "voice"
                      ? "bg-primary text-white shadow-md"
                      : "text-foreground hover:bg-slate-200 dark:hover:bg-slate-600"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <FiMic className="w-5 h-5" /> Voice
                </button>

                <button
                  onClick={() => { !loading && stopListening(); setMode("nlp"); }}
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-medium transition-all ${mode === "nlp"
                      ? "bg-primary text-white shadow-md"
                      : "text-foreground hover:bg-slate-200 dark:hover:bg-slate-600"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <FiType className="w-5 h-5" /> Text
                </button>
              </div>

              {/* VOICE MODE */}
              {mode === "voice" && (
                <>
                  {/* **MODIFIED: Smaller Mic Area on Mobile** */}
                  <div className={`relative h-36 sm:h-40 flex flex-col items-center justify-center border-2 border-dashed border-primary/50 dark:border-primary/30 rounded-lg bg-slate-50 dark:bg-slate-700/50 p-4`}>
                    <AnimatePresence>
                      <button
                        onClick={toggleListening} // Use the new toggle function
                        disabled={loading}
                        // Mic Button Size Adjusted for Mobile
                        className={`relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center transition-transform duration-300 rounded-full ${loading ? "cursor-not-allowed" : "cursor-pointer"}`}
                        aria-label={listening ? "Stop Listening" : "Start Listening"}
                      >
                        {listening && (
                          <motion.div
                            key="listening-rings"
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
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
                          // Inner Circle Size Adjusted for Mobile
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg relative z-10 
                                          ${listening ? 'bg-red-600' : 'bg-primary hover:scale-105'}`}
                          whileTap={{ scale: 0.9 }}
                        >
                          {listening ? (
                            <FaStop className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                          ) : (
                            <FaMicrophone className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                          )}
                        </motion.div>
                      </button>
                    </AnimatePresence>

                    {/* Status Text Below Mic */}
                    <p className="text-sm mt-4 font-medium text-center">
                      {loading
                        ? "Processing..."
                        : listening
                          ? <span className="text-red-600 font-bold">Listening... Tap to Stop</span>
                          : "Tap the mic to start speaking"}
                    </p>
                  </div>

                  {/* Editable Transcript Area */}
                  <textarea
                    value={transcript}
                    onChange={(e) => {
                      setTranscript(e.target.value);
                      finalTranscriptRef.current = e.target.value;
                    }}
                    placeholder="Transcript appears here. Edit if needed."
                    disabled={loading || listening} // Disable typing while actively listening
                    // Text Area Height Adjusted for Mobile
                    className={`w-full p-3 mt-4 h-16 sm:h-20 rounded-lg text-sm outline-none transition-all resize-none border ${loading || listening
                        ? "bg-slate-200 dark:bg-slate-900 text-slate-400 cursor-not-allowed"
                        : "bg-slate-100 dark:bg-slate-700 text-foreground border-slate-300 dark:border-slate-700 focus:border-primary"
                      }`}
                  />

                  {/* Removed Start/Stop Buttons. Retained an empty div for layout consistency if needed, but removing completely to force simplicity */}
                  <div className="h-4 sm:h-10"></div>
                </>
              )}

              {/* NLP MODE */}
              {mode === "nlp" && (
                <>
                  <textarea
                    value={prompt}
                    onChange={e => !loading && setPrompt(e.target.value)}
                    placeholder="E.g., Prepare notes for physics exam due Friday"
                    disabled={loading}
                    // Text Area Height Adjusted for Mobile
                    className={`w-full p-4 h-36 sm:h-40 rounded-lg text-base outline-none transition-all resize-none border ${loading
                        ? "bg-slate-200 dark:bg-slate-900 text-slate-400 cursor-not-allowed"
                        : "bg-slate-100 dark:bg-slate-700 text-foreground border-slate-300 dark:border-slate-700 focus:border-primary"
                      }`}
                  />

                  <div className="flex items-center gap-2 text-primary font-medium mt-2">
                    <FiCpu className="w-4 h-4" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      AI extracts title, due date, and details automatically.
                    </p>
                  </div>
                </>
              )}

              {/* Create Button (Unchanged logic) */}
              <button
                onClick={createTask}
                disabled={isCreating || loading || (mode === "voice" ? !transcript.trim() : !prompt.trim())}
                className={`w-full mt-6 sm:mt-8 px-4 py-3 rounded-xl font-[600] text-md transition-all shadow-lg ${isCreating || loading || (mode === "voice" ? !transcript.trim() : !prompt.trim())
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
                  "Process & Create Task"
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}