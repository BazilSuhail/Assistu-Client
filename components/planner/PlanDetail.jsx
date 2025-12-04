"use client"

import { motion, AnimatePresence } from "framer-motion"
import { FiX, FiCalendar, FiBookOpen, FiTrash2 } from "react-icons/fi"
import axios from "axios"
import { useState } from "react"

export default function PlanDetailModal({ isOpen, onClose, plan, onPlanDeleted }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState(null)

    if (!isOpen || !plan.id) return null

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this study plan?")) return

        setIsDeleting(true)
        setDeleteError(null)
        const token = localStorage.getItem("access")

        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_SERVER_API_URL}/planner/delete/${plan.id}`, // Your DELETE endpoint
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            onPlanDeleted() // Refresh the list
            onClose() // Close the modal
        } catch (err) {
            console.error("Error deleting plan:", err)
            setDeleteError("Failed to delete plan.")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-xl p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-500 hover:text-foreground transition"
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                        
                        <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
                            <h2 className="text-3xl font-bold text-foreground mb-1">{plan.title}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                <FiCalendar className="inline mr-1 mb-0.5" /> Duration: **{plan.duration}**
                            </p>
                        </div>

                        <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
                            <FiBookOpen /> Study Sessions ({plan.sessions.length})
                        </h3>

                        <div className="space-y-4">
                            {plan.sessions.map((session, index) => (
                                <div key={index} className="bg-card p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg text-foreground">{session.subject}</h4>
                                        <span className="text-sm px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            {session.date}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400">{session.goal}</p>
                                </div>
                            ))}
                        </div>
                        
                        {deleteError && (
                            <p className="text-red-500 text-sm mt-4">{deleteError}</p>
                        )}

                        <div className="mt-6 flex justify-end">
                            <motion.button
                                onClick={handleDelete}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:bg-red-400"
                                disabled={isDeleting}
                            >
                                <FiTrash2 className="w-4 h-4" />
                                {isDeleting ? "Deleting..." : "Delete Plan"}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}