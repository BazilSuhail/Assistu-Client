// components/SettingsModal.jsx
"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    HiX,
    HiCog,
    HiSun,
    HiMoon,
    HiUser,
    HiMail,
    HiCalendar,
    HiCheckCircle,
    HiDocumentText,
    HiClock,
    HiCollection
} from "react-icons/hi"
import axios from "axios"
import Loader from "@/components/shared/loader"

// Helper component for statistics card (Keeps color for icons/value)
const StatCard = ({ icon: Icon, iconClass, value, label }) => (
    // Background and Border are monochromatic
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 lg:p-4 border border-slate-300 dark:border-slate-700">
        <div className="flex items-center justify-between mb-1">
            {/* Icon color is preserved */}
            <Icon className={`w-5 h-5 ${iconClass}`} /> 
            {/* Value color is preserved */}
            <span className={`text-xl lg:text-2xl font-bold ${iconClass}`}>{value}</span>
        </div>
        {/* Label is monochromatic */}
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</p>
    </div>
)

export default function SettingsModal({ isOpen, onClose, darkMode, onToggleDarkMode }) {
    const [profile, setProfile] = useState(null)
    const [statistics, setStatistics] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (isOpen) {
            fetchProfileData()
        }
    }, [isOpen])

    const fetchProfileData = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem("access")
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_API_URL}/auth/profile/`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setProfile(response.data.profile)
            setStatistics(response.data.statistics)
        } catch (err) {
            console.error("Failed to fetch profile:", err)
            setError("Failed to load profile data")
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const completionRate = statistics?.total_tasks > 0
        ? Math.round((statistics.completed_tasks / statistics.total_tasks) * 100)
        : 0

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        // Modal colors are monochromatic
                        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-xl lg:max-w-4xl max-h-[95vh] overflow-y-auto text-black dark:text-white"
                        initial={{ scale: 0.9, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 50 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b dark:border-slate-700 p-4 lg:p-6 flex items-center justify-between z-10">
                            <h2 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
                                {/* Header icon color is now gray/white */}
                                <HiCog className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600 dark:text-slate-400" /> Settings & Profile
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Close settings"
                            >
                                <HiX className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 lg:p-6 space-y-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader />
                                </div>
                            ) : error ? (
                                <div className="text-center py-12">
                                    <p className="text-red-500 mb-4">{error}</p>
                                    <button
                                        onClick={fetchProfileData}
                                        // Button color is now gray/black
                                        className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-black dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Column 1: Profile and Preferences */}
                                    <div className="space-y-6">
                                        {/* Profile Section */}
                                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 lg:p-6 border border-slate-300 dark:border-slate-700 shadow-md">
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                {/* Profile icon color is now gray/white */}
                                                <HiUser className="w-5 h-5 text-slate-600 dark:text-slate-400" /> Account Information
                                            </h3>
                                            <div className="flex items-start gap-4">
                                                {/* Avatar (Monochromatic primary color) */}
                                                <div className="flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-slate-700 dark:bg-slate-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                                    {profile?.avatar ? (
                                                        <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        <HiUser className="w-8 h-8" />
                                                    )}
                                                </div>

                                                {/* Profile Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-lg font-bold truncate">
                                                        {profile?.name || "User"}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 truncate">
                                                        @{profile?.username || "username"}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                                        {/* Icon color is now gray/white */}
                                                        <HiMail className="w-4 h-4 text-slate-400" />
                                                        <span className="truncate">{profile?.email || "email@example.com"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
                                                        {/* Icon color is now gray/white */}
                                                        <HiCalendar className="w-3 h-3 text-slate-400" />
                                                        <span>Joined {formatDate(profile?.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Subjects */}
                                            {profile?.subjects && profile.subjects.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-700">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {/* Icon color is now gray/white */}
                                                        <HiCollection className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                                        <span className="text-sm font-semibold">Subjects</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {profile.subjects.map((subject, idx) => (
                                                            <span
                                                                key={idx}
                                                                // Chip colors are monochromatic
                                                                className="px-2 py-0.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-400 dark:border-slate-600 rounded-full text-xs font-medium"
                                                            >
                                                                {subject}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Preferences Section */}
                                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 lg:p-6 border border-slate-300 dark:border-slate-700">
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                {/* Preference icon color is now gray/white */}
                                                <HiCog className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                Application Preferences
                                            </h3>

                                            {/* Dark Mode Toggle */}
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900">
                                                <div className="flex items-center gap-3">
                                                    {darkMode ? (
                                                        <HiMoon className="w-5 h-5 text-slate-400" />
                                                    ) : (
                                                        <HiSun className="w-5 h-5 text-slate-400" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-sm">Theme</p>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                                            {darkMode ? "Dark Mode" : "Light Mode"} is active
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Toggle Switch (Handle is now gray/white) */}
                                                <label className="flex items-center cursor-pointer">
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only"
                                                            checked={darkMode}
                                                            onChange={onToggleDarkMode}
                                                        />
                                                        <div className="block bg-slate-400 dark:bg-slate-600 w-12 h-6 rounded-full"></div>
                                                        <div
                                                            className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform shadow-md ${darkMode ? "translate-x-6 bg-black dark:bg-white" : ""
                                                                }`}
                                                        ></div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Column 2: Statistics */}
                                    {statistics && (
                                        <div>
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                {/* Statistic header icon color is now gray/white */}
                                                <HiCheckCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                Activity Statistics
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                
                                                {/* Stat Cards - Colors preserved only in iconClass */}
                                                
                                                {/* Total Notes */}
                                                <StatCard 
                                                    icon={HiDocumentText} 
                                                    iconClass="text-purple-500" 
                                                    value={statistics.total_notes} 
                                                    label="Total Notes" 
                                                />

                                                {/* Total Tasks */}
                                                <StatCard 
                                                    icon={HiCheckCircle} 
                                                    iconClass="text-blue-500" 
                                                    value={statistics.total_tasks} 
                                                    label="Total Tasks" 
                                                />

                                                {/* Completed Tasks */}
                                                <StatCard 
                                                    icon={HiCheckCircle} 
                                                    iconClass="text-green-600" 
                                                    value={statistics.completed_tasks} 
                                                    label="Completed" 
                                                />

                                                {/* Pending Tasks */}
                                                <StatCard 
                                                    icon={HiClock} 
                                                    iconClass="text-orange-500" 
                                                    value={statistics.pending_tasks} 
                                                    label="Pending" 
                                                />

                                                {/* Total Events */}
                                                <StatCard 
                                                    icon={HiCalendar} 
                                                    iconClass="text-green-500" 
                                                    value={statistics.total_events} 
                                                    label="Total Events" 
                                                />

                                                {/* Completion Rate */}
                                                <StatCard 
                                                    icon={HiCheckCircle} 
                                                    iconClass="text-black dark:text-white" 
                                                    value={`${completionRate}%`} 
                                                    label="Completion Rate" 
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}