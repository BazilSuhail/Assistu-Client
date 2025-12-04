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
        // Using a more modern, slightly less jarring confirmation for better UX
        const confirmed = window.confirm(`Are you sure you want to permanently delete the study plan: "${plan.title}"? This cannot be undone.`)
        if (!confirmed) return

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
            setDeleteError("Failed to delete plan. You might not have permission.")
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
                    // Adjusted mobile padding on the backdrop
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[4px] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        //  Modal size adjustments for mobile: reduced max-width, tighter max-height
                        className="relative w-full max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            //  Closer to the corner on mobile, smaller icon
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-500 hover:text-foreground transition p-1"
                        >
                            <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        {/* Header Section */}
                        <div className="border-b mt-1 sm:mt-2 w-[95%] border-slate-200 dark:border-slate-700 pb-3 sm:pb-4 mb-3 sm:mb-4">
                            {/*  Adjusted Title size */}
                            <h2 className="text-lg sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">{plan.title}</h2>
                            {/*  Adjusted metadata size */}
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                <FiCalendar className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 mb-0.5" /> Duration: **{plan.duration}**
                            </p>
                        </div>

                        {/* Sessions Header */}
                        {/*  Adjusted Section Header size */}
                        <h3 className="text-lg sm:text-xl font-semibold text-primary mb-3 flex items-center gap-2">
                            <FiBookOpen className="w-5 h-5" /> Study Sessions ({plan.sessions.length})
                        </h3>

                        {/* Sessions List */}
                        <div className="space-y-3 sm:space-y-4">
                            {plan.sessions.map((session, index) => (
                                <div
                                    key={index}
                                    //  Reduced padding on session cards
                                    className="bg-card p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                                        {/*  Adjusted Session Title size */}
                                        <h4 className="font-bold text-base sm:text-lg text-foreground">{session.subject}</h4>
                                        {/*  Adjusted Date Tag size */}
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            {session.date}
                                        </span>
                                    </div>
                                    {/*  Adjusted Goal/Description text size */}
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{session.goal}</p>
                                </div>
                            ))}
                        </div>

                        {deleteError && (
                            <p className="text-red-500 text-sm mt-4">{deleteError}</p>
                        )}

                        {/* Footer / Delete Button */}
                        <div className="mt-5 sm:mt-6 flex justify-end">
                            <motion.button
                                onClick={handleDelete}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                //  Adjusted button padding and text size for mobile
                                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:bg-red-400"
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