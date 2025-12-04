"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import Loader from "@/components/shared/loader"
import { HiPlus, HiBookOpen, HiClock, HiCalendar, HiLightningBolt, HiAcademicCap, HiChartBar } from "react-icons/hi"
import axios from "axios"
import { useRouter } from "next/navigation"
import CreatePlanModal from "@/components/planner/CreatePlan"
import PlanDetailModal from "@/components/planner/PlanDetail"
import Image from "next/image"
import { FiTrendingUp } from "react-icons/fi"

const initialPlanState = {
    id: null,
    title: "",
    duration: "",
    sessions: [],
    created_at: "",
    updated_at: "",
    user_id: "",
}

export default function PlannerPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [plans, setPlans] = useState([])
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState(initialPlanState)
    const [showDetailModal, setShowDetailModal] = useState(false)

    const fetchPlans = useCallback(async () => {
        setIsLoading(true)
        const token = localStorage.getItem("access")
        if (!token) {
            router.push("/login")
            return
        }

        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_API_URL}/planner`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setPlans(res.data)
        } catch (error) {
            console.error("Error fetching study plans:", error)
            setPlans([])
        } finally {
            setIsLoading(false)
        }
    }, [router])

    useEffect(() => {
        fetchPlans()
    }, [fetchPlans])

    const handlePlanClick = (plan) => {
        setSelectedPlan(plan)
        setShowDetailModal(true)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
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

    // Calculate stats
    const totalPlans = plans.length
    const totalSessions = plans.reduce((acc, plan) => acc + plan.sessions.length, 0)
    const activeSubjects = [...new Set(plans.flatMap(plan => plan.sessions.map(s => s.subject)))].length

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            // Adjusted padding for mobile: p-4 on small screens
            className="min-h-screen bg-white p-4 sm:p-6 md:p-8"
        >
            {/* Hero Section */}
            <motion.div variants={itemVariants} className="max-w-7xl mx-auto mb-8 sm:mb-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div>
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <div className="p-1 sm:p-2 bg-black rounded-xl sm:rounded-2xl">
                                {/* Icon size adjusted for mobile */}
                                <HiAcademicCap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            {/* Font size adjusted for mobile */}
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">Study Planner</h1>
                        </div>
                        {/* Font size adjusted for mobile */}
                        <p className="text-sm sm:text-md text-gray-500">Organize your learning journey with AI-powered study plans</p>
                    </div>
                    {/* Button padding and size adjusted for mobile */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-black text-white rounded-xl font-semibold flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl transition-shadow text-sm sm:text-base"
                    >
                        <HiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                        Create Plan
                    </motion.button>
                </div>

                {/* Elegant Horizontal Stats Cards */}
                {plans.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        // Layout: Stacked on mobile, 3-column grid on medium screens
                        className="flex flex-col gap-3 sm:gap-4 md:grid md:grid-cols-3 md:gap-4 mb-6 sm:mb-8"
                    >
                        {/* Stat Card 1: Active Plans */}
                        <div className="bg-card border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center shadow-sm hover:shadow-lg transition duration-300">
                            {/* Icon size adjusted */}
                            <div className="p-2 sm:p-3 bg-gray-100 rounded-lg border border-gray-100 mr-3 sm:mr-4 flex-shrink-0">
                                <HiBookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                            </div>

                            <div className="flex-grow">
                                <div className="flex items-center justify-between">
                                    {/* Font size adjusted */}
                                    <p className="text-xl sm:text-2xl font-extrabold text-foreground">{totalPlans}</p>
                                    <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                                </div>
                                {/* Font size adjusted */}
                                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Active Plans</p>
                            </div>
                        </div>

                        {/* Stat Card 2: Total Sessions */}
                        <div className="bg-card border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center shadow-sm hover:shadow-lg transition duration-300">
                            {/* Icon size adjusted */}
                            <div className="p-2 sm:p-3 bg-gray-100 rounded-lg border border-gray-100 mr-3 sm:mr-4 flex-shrink-0">
                                <HiClock className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                            </div>

                            <div className="flex-grow">
                                <div className="flex items-center justify-between">
                                    {/* Font size adjusted */}
                                    <p className="text-xl sm:text-2xl font-extrabold text-foreground">{totalSessions}</p>
                                    <HiLightningBolt className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                                </div>
                                {/* Font size adjusted */}
                                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Total Sessions</p>
                            </div>
                        </div>

                        {/* Stat Card 3: Active Subjects */}
                        <div className="bg-card border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center shadow-sm hover:shadow-lg transition duration-300">
                            {/* Icon size adjusted */}
                            <div className="p-2 sm:p-3 bg-gray-100 rounded-lg border border-gray-100 mr-3 sm:mr-4 flex-shrink-0">
                                <HiChartBar className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                            </div>

                            <div className="flex-grow">
                                <div className="flex items-center justify-between">
                                    {/* Font size adjusted */}
                                    <p className="text-xl sm:text-2xl font-extrabold text-foreground">{activeSubjects}</p>
                                    <HiCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                                </div>
                                {/* Font size adjusted */}
                                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Active Subjects</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            <div className="w-full h-[3px] bg-gray-200 mb-4"></div>
            {/* Plans Grid */}
            <motion.div variants={itemVariants} className="max-w-7xl mx-auto">
                {plans.length > 0 ? (
                    <>
                        {/* Font size adjusted */}
                        <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">Your Study Plans</h2>
                        {/* Responsive Grid: Switches to 2 columns earlier on mobile, 3 on large screens */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {plans.map((plan) => {
                                const subjects = [...new Set(plan.sessions.map(s => s.subject))].slice(0, 3)
                                const progress = Math.min(100, Math.floor(subjects.length * 20) + 10)

                                return (
                                    <motion.div
                                        key={plan.id}
                                        whileHover={{ y: -4, scale: 1.02 }}
                                        onClick={() => handlePlanClick(plan)}
                                        // Card padding adjusted
                                        className="bg-white border-2 border-gray-200 hover:border-black rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer transition-all group"
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                                            {/* Icon container padding adjusted */}
                                            <div className="p-2 bg-gray-100 group-hover:bg-black rounded-lg sm:rounded-xl transition-colors">
                                                <HiBookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-black group-hover:text-white transition-colors" />
                                            </div>
                                            {/* Font size adjusted */}
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                {plan.sessions.length} Sessions
                                            </span>
                                        </div>

                                        {/* Title */}
                                        {/* Font size adjusted */}
                                        <h3 className="font-bold text-lg sm:text-xl text-black mb-3 line-clamp-2">
                                            {plan.title}
                                        </h3>

                                        {/* Subjects */}
                                        <div className="mb-3 sm:mb-4">
                                            <div className="flex flex-wrap gap-1 sm:gap-2">
                                                {subjects.map((subject, idx) => (
                                                    <span
                                                        key={idx}
                                                        // Tag size adjusted
                                                        className="text-xs px-2 py-1 rounded-full bg-gray-100 text-black font-medium border border-gray-200"
                                                    >
                                                        {subject}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="mb-3 sm:mb-4">
                                            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                                {/* Font size adjusted */}
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Progress</span>
                                                <span className="text-sm font-bold text-black">{progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.8, delay: 0.2 }}
                                                    className="h-full bg-black rounded-full"
                                                />
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                                            {/* Font size adjusted */}
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <HiCalendar className="w-4 h-4" />
                                                {new Date(plan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                            {/* Font size adjusted */}
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                <HiClock className="w-4 h-4" />
                                                {plan.duration}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 sm:py-16">
                        <div className="max-w-xs sm:max-w-md text-center">
                            <Image
                                src="/todo/noPlans.png"
                                alt="No plans available"
                                width={400}
                                height={400}
                                className="w-full mx-auto max-w-[250px] sm:max-w-xs md:max-w-sm object-contain mb-6 sm:mb-8 opacity-40"
                            />
                            {/* Font size adjusted */}
                            <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 sm:mb-3">No Study Plans Yet</h3>
                            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Create your first AI-powered study plan to get started on your learning journey</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCreateModal(true)}
                                // Button size adjusted
                                className="px-5 py-2 sm:px-6 sm:py-3 bg-black text-white rounded-xl font-semibold flex items-center gap-2 sm:gap-3 mx-auto shadow-lg hover:shadow-xl transition-shadow text-sm sm:text-base"
                            >
                                <HiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                                Create Your First Plan
                            </motion.button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Modals */}
            <CreatePlanModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onPlanCreated={fetchPlans}
            />

            <PlanDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                plan={selectedPlan}
                onPlanDeleted={fetchPlans}
            />
        </motion.div>
    )
}