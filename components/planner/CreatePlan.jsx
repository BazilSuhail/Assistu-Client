"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { FiX, FiZap } from "react-icons/fi"
import { FaMicrophone, FaStop } from "react-icons/fa"

export default function CreatePlanModal({ isOpen, onClose, onPlanCreated }) {
    // Original state for text input/output
    const [prompt, setPrompt] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)

    // New state for Voice Recognition
    const [listening, setListening] = useState(false)
    const recognitionRef = useRef(null)
    const finalTranscriptRef = useRef("")

    // --- Speech Recognition Setup & Cleanup ---

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

            // Update the main 'prompt' state with combined text for real-time display
            setPrompt(finalTranscriptRef.current + interim.trim());
        }

        recognition.onend = () => {
            // Only auto-stop listening if it wasn't stopped manually (which triggers recognition.stop() and sets listening=false)
            if (listening) {
                setListening(false);
            }
        };

        recognition.onerror = (event) => {
            console.error('Recognition error:', event);
            setListening(false);
        };

        recognitionRef.current = recognition

        // Cleanup on unmount or closure
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort()
            }
        }
    }, [])

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setPrompt("")
            setError(null)
            setIsSubmitting(false)
            finalTranscriptRef.current = ""
        }
    }, [isOpen])

    // --- Voice Control Functions ---

    const startListening = () => {
        if (!recognitionRef.current || isSubmitting) return

        // Clear previous state
        finalTranscriptRef.current = ""
        setPrompt("")

        setListening(true)
        try {
            // Attempt to stop before starting to ensure a fresh session
            recognitionRef.current.stop()
            recognitionRef.current.start()
        } catch (e) {
            // Ignore errors if recognition is already starting/active
            console.warn("Recognition start failed (might be already starting)", e);
        }
    }

    const stopListening = () => {
        if (!recognitionRef.current || !listening) return

        // Finalize the transcript before stopping
        finalTranscriptRef.current = prompt.trim();
        setPrompt(finalTranscriptRef.current);
        setListening(false);
        recognitionRef.current.stop();
    }

    const toggleListening = () => {
        if (listening) {
            stopListening();
        } else {
            startListening();
        }
    }

    // --- Submission Logic ---

    const handleSubmit = async (e) => {
        e.preventDefault()
        // Ensure listening stops before sending data
        stopListening()

        // Use the current prompt state (which holds the transcript)
        if (!prompt.trim()) return

        setIsSubmitting(true)
        setError(null)
        const token = localStorage.getItem("access")

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_API_URL}/planner/`,
                { description: prompt }, // Sending the transcribed/edited prompt
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                }
            )

            setPrompt("")
            onPlanCreated()
            onClose()
        } catch (err) {
            console.error("Error creating plan:", err)
            setError("Failed to create plan. Please check the server response.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    // --- Component JSX (Updated) ---

    // Simple animation for the pulsing mic ring
    const PulseRing = () => (
        <motion.div
            className="absolute inset-0 rounded-full bg-red-500/30"
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
        />
    )

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/40 flex items-center backdrop-blur-[4px] justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        // Adjusted padding for modal content on mobile
                        className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-lg shadow-xl p-5 sm:p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-500 hover:text-red-500 transition p-1"
                            disabled={isSubmitting}
                        >
                            <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        {/* Adjusted Heading Size for mobile */}
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2 mb-3 sm:mb-4">
                            <FiZap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> Generate New Study Plan
                        </h2>
                        {/* Adjusted Description Size for mobile */}
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 sm:mb-6">
                            Describe your plan using **voice** or **text**. The AI will generate a structured schedule.
                        </p>

                        <form onSubmit={handleSubmit}>
                            {/* --- VOICE INPUT AREA --- */}
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/50 dark:border-primary/30 rounded-lg bg-slate-50 dark:bg-slate-700/50 p-4 mb-4">
                                <button
                                    type="button"
                                    onClick={toggleListening}
                                    disabled={isSubmitting}
                                    // Adjusted microphone button size for touch on mobile
                                    className={`relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full transition-transform duration-300 ${isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                                    aria-label={listening ? "Stop Recording" : "Start Recording"}
                                >
                                    <AnimatePresence>
                                        {listening && <PulseRing key="pulse" />}
                                    </AnimatePresence>

                                    <motion.div
                                        // Adjusted microphone icon size
                                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg relative z-10 ${listening ? 'bg-red-600' : 'bg-primary hover:scale-105'}`}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        {listening ? (
                                            <FaStop className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                        ) : (
                                            <FaMicrophone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                        )}
                                    </motion.div>
                                </button>

                                <p className={`text-xs sm:text-sm mt-3 font-medium text-center ${listening ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {isSubmitting
                                        ? "Processing..."
                                        : listening
                                            ? "Recording... Tap to Stop"
                                            : "Tap the microphone to record your plan description."}
                                </p>
                            </div>

                            {/* Transcript/Prompt Text Area (Editable) */}
                            <textarea
                                value={prompt}
                                // User can edit the transcribed text manually
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Your recorded transcript or manual text input appears here. Edit if needed."
                                rows={4}
                                // Adjusted padding for smaller screens
                                className={`w-full p-3 border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition resize-none text-sm 
                                    ${isSubmitting || listening ? "bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed border-slate-300" : "border-slate-300 dark:border-slate-700"}
                                `}
                                // Disable typing while recording is active
                                disabled={isSubmitting || listening}
                            />

                            {error && (
                                <p className="text-red-500 text-sm mt-2">{error}</p>
                            )}

                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                // Adjusted vertical padding and font size for mobile button
                                className={`mt-4 w-full px-4 py-2.5 sm:py-3 rounded-xl font-[600] text-base sm:text-lg transition-all shadow-lg 
                                    ${isSubmitting || !prompt.trim()
                                        ? "bg-primary/50 text-white/70 cursor-not-allowed"
                                        : "bg-primary text-white hover:bg-primary/90"
                                    }`}
                                disabled={isSubmitting || !prompt.trim()}
                            >
                                {isSubmitting ? "Generating Plan..." : "Generate Plan"}
                            </motion.button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}