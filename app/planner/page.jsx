"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import Loader from "@/components/shared/loader"
import Link from "next/link" // Note: Link is not used for modal details, but kept for the overall structure
import { HiPlus } from "react-icons/hi"
import axios from "axios"
import { useRouter } from "next/navigation"

// Import the new modal components (assuming you place them in the same directory or a relevant components folder)
import CreatePlanModal from "@/components/planner/CreatePlan"
import PlanDetailModal from "@/components/planner/PlanDetail"

// Define the StudyPlan type based on your API response
const initialPlanState = {
    id: null,
    title: "",
    duration: "",
    sessions: [],
    created_at: "",
    updated_at: "",
    user_id: "",
}

// NOTE: The 'subjects' and 'progress' fields from the DUMMY data are not directly in your API response.
// I will map 'sessions' into a list of subjects and use a placeholder/calculated progress for the list view.

export default function PlannerPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [plans, setPlans] = useState([])
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState(initialPlanState)
    const [showDetailModal, setShowDetailModal] = useState(false)

    // --- Data Fetching ---
    const fetchPlans = useCallback(async () => {
        setIsLoading(true)
        const token = localStorage.getItem("access") // Get token from local storage
        if (!token) {
            // Handle unauthorized state (e.g., redirect to login)
            router.push("/login")
            return
        }

        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_API_URL}/planner`, // Assuming /studyplans/ is your endpoint
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setPlans(res.data)
        } catch (error) {
            console.error("Error fetching study plans:", error)
            // Handle error, maybe show a message to the user
            setPlans([])
        } finally {
            setIsLoading(false)
        }
    }, [router])

    useEffect(() => {
        fetchPlans()
    }, [fetchPlans])

    // --- Modal Handlers ---

    const handlePlanClick = (plan) => {
        // Here we just use the list data. For full detail, you would fetch it by ID.
        // Given your API has a detail endpoint, let's fetch the full data.
        
        // For simplicity and to use the detail modal, we'll set the plan and open the modal.
        // In a production app, you would fetch the full detail here:
        // fetchPlanDetail(plan.id) 
        
        setSelectedPlan(plan)
        setShowDetailModal(true)
    }

    // --- Rendering ---
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader />
            </div>
        )
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-6 md:p-8 max-w-6xl mx-auto"
        >
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">AI Study Planner 🧠</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Create and manage your personalized study plans</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <HiPlus className="w-5 h-5" />
                    New Plan
                </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.length > 0 ? (
                    plans.map((plan) => {
                        // Extract unique subjects from sessions for display tags
                        const subjects = [...new Set(plan.sessions.map(s => s.subject))].slice(0, 3) 
                        // Placeholder for progress logic (e.g., sessions completed / total sessions)
                        const progress = Math.min(100, Math.floor(subjects.length * 20) + 10) 

                        return (
                            // Use a div instead of Link since we are opening a modal
                            <motion.div
                                key={plan.id}
                                whileHover={{ y: -4 }}
                                onClick={() => handlePlanClick(plan)}
                                className="card p-6 h-full hover:shadow-lg transition-all cursor-pointer"
                            >
                                <h3 className="font-bold text-foreground mb-3">{plan.title}</h3>
                                <div className="mb-4">
                                    <div className="flex flex-wrap gap-2">
                                        {subjects.map((subject, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                            >
                                                {subject}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Progress</span>
                                        <span className="text-sm font-bold text-foreground">{progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                            className="h-full bg-primary rounded-full"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Created: {new Date(plan.created_at).toLocaleDateString()} | Duration: {plan.duration}
                                </p>
                            </motion.div>
                        )
                    })
                ) : (
                    <p className="col-span-3 text-center text-slate-500 dark:text-slate-400">
                        No study plans found. Click "New Plan" to get started!
                    </p>
                )}
            </motion.div>
            
            {/* Modals */}
            <CreatePlanModal 
                isOpen={showCreateModal} 
                onClose={() => setShowCreateModal(false)}
                onPlanCreated={fetchPlans} // Refresh list after creation
            />

            <PlanDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                plan={selectedPlan}
                onPlanDeleted={fetchPlans} // Refresh list after deletion
            />

        </motion.div>
    )
}