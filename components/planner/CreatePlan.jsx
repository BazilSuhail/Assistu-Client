"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { FiX, FiZap } from "react-icons/fi"

export default function CreatePlanModal({ isOpen, onClose, onPlanCreated }) {
    const [prompt, setPrompt] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!prompt.trim()) return

        setIsSubmitting(true)
        setError(null)
        const token = localStorage.getItem("access")

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_API_URL}/planner/`, // Your POST endpoint
                { description: prompt },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                }
            )
            
            setPrompt("")
            onPlanCreated() // Call the function to refresh the list
            onClose()
        } catch (err) {
            console.error("Error creating plan:", err)
            setError("Failed to create plan. Please check the server response.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" // fixed and bg-black/40
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="relative w-full max-w-lg bg-background rounded-lg shadow-xl p-6"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-500 hover:text-foreground transition"
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                        
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-4">
                            <FiZap className="w-6 h-6 text-primary" /> Generate New Study Plan
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Describe the subject, goal, and timeline (e.g., "Review Calculus chapters 1-3 for a test next Monday").
                        </p>

                        <form onSubmit={handleSubmit}>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="E.g., Plan my full stack development review for the next 10 days, focusing on React and Django."
                                rows={4}
                                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition"
                                disabled={isSubmitting}
                            />
                            
                            {error && (
                                <p className="text-red-500 text-sm mt-2">{error}</p>
                            )}

                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="mt-4 w-full btn-primary"
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