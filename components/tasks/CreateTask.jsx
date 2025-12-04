"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import axios from "axios"

// --- Helper: Voice Synthesis Setup ---
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
  const recognitionRef = useRef(null) 
  const finalTranscriptRef = useRef("") 

// --- Hooks for Initialization and Cleanup ---
  
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
    recognition.continuous = true // CRITICAL: Keeps the microphone open
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
    if (!recognitionRef.current || listening || loading) return
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
        finalTranscriptRef.current = transcript.trim();
        setTranscript(finalTranscriptRef.current);
        setListening(false);
        recognitionRef.current.stop();
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
  }

// --- Task Creation Logic ---

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
      
      // 1. Enter Success State (Visual Confirmation)
      setSuccessTitle(taskTitle)
      setLoading(false)
      setSuccess(true)
      
      // 2. Define the cleanup and closure function
      const closeHandler = () => {
          resetForm()
          if (onCreated) onCreated()
          onClose()
      }

      // 3. Speak the confirmation, passing the close handler as the callback
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

// --- Component JSX ---

  // Success Animation Component
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
              <svg 
                  className="w-12 h-12 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
              >
                  <motion.path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                  />
              </svg>
          </motion.div>

          <h3 className="text-2xl font-bold text-green-500 mb-2">Task Created!</h3>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
              **Title:** {successTitle}
          </p>
          {/* This message reflects the new behavior */}
          <p className="text-sm text-slate-500 mt-2">Speaking confirmation and closing...</p>
      </motion.div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl min-h-[350px]">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-600 dark:text-slate-300 text-sm"
          disabled={loading || success} 
        >
          Close
        </button>

        {!success && (
            <h2 className="text-xl font-semibold text-foreground mb-4">Create Task</h2>
        )}

        {/* --- MAIN CONTENT SWITCH --- */}
        {success ? (
            <SuccessView />
        ) : (
            <>
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
                        onClick={() => { !loading && stopListening(); setMode("voice"); }}
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
                        onClick={() => { !loading && stopListening(); setMode("nlp"); }}
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
                        <div className="relative h-32 flex flex-col items-center justify-center border border-slate-300 dark:border-slate-700 rounded-lg">
                          {/* Dynamic Pulsating Animation */}
                          {listening ? (
                            <motion.div
                              className="relative w-20 h-20 flex items-center justify-center"
                              initial={{ scale: 1 }}
                            >
                              {/* Outer pulse */}
                              <motion.div
                                className="absolute inset-0 bg-primary/20 rounded-full"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.2, 0.8] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                              />
                              {/* Inner circle */}
                              <motion.div
                                className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                              >
                                {/* Microphone icon placeholder (replace with actual icon if needed) */}
                                <div className="text-white text-xl">🎤</div>
                              </motion.div>
                            </motion.div>
                          ) : (
                            <div className={`text-sm ${loading ? "text-slate-400" : "text-slate-500"}`}>
                              {loading ? "Processing..." : "Press Start to speak"}
                            </div>
                          )}
                        </div>

                        {/* Editable Transcript Area */}
                        <textarea
                            value={transcript}
                            onChange={(e) => {
                                setTranscript(e.target.value);
                                finalTranscriptRef.current = e.target.value;
                            }}
                            placeholder="Speak here, or type to correct the transcript..."
                            disabled={loading}
                            className={`w-full p-3 mt-4 h-24 rounded-lg text-sm outline-none transition-all resize-none ${
                                loading
                                    ? "bg-slate-200 dark:bg-slate-900 text-slate-400 cursor-not-allowed"
                                    : "bg-slate-100 dark:bg-slate-700 text-foreground"
                            }`}
                        />

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
                      placeholder="Describe your task. Example: Prepare notes for physics exam due Friday"
                      disabled={loading}
                      className={`w-full p-3 h-32 rounded-lg text-sm outline-none transition-all resize-none ${
                        loading
                          ? "bg-slate-200 dark:bg-slate-900 text-slate-400 cursor-not-allowed"
                          : "bg-slate-100 dark:bg-slate-700 text-foreground"
                      }`}
                    />

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      The AI will extract the task title and due date automatically.
                    </p>
                  </>
                )}
        
                {/* Create Button */}
                <button
                    onClick={createTask}
                    disabled={isCreating || loading || (mode === "voice" ? !transcript.trim() : !prompt.trim())}
                    className={`w-full mt-6 px-4 py-2 rounded-lg font-medium transition-all ${
                        isCreating || loading || (mode === "voice" ? !transcript.trim() : !prompt.trim())
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
            </>
        )}
      </div>
    </div>
  )
}