// CalendarPage.jsx

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { HiPlus } from "react-icons/hi"
import CreateEventModal from "@/components/events/CreateEvent"

// --- Import Isolated View Components ---
import MonthViewCalendar from "@/components/calendar/MonthView"
import WeekView from "@/components/calendar/WeekView"
import DayView from "@/components/calendar/DayView"
import { FiCalendar } from "react-icons/fi"

export default function CalendarPage() {
    const [view, setView] = useState("Month")
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    // Trigger refresh for all views when event is created
    const handleEventCreated = () => {
        setRefreshKey(prev => prev + 1)
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
            //  Adjusted padding for mobile (p-4)
            className="p-4 md:p-8"
        >
            <CreateEventModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreated={handleEventCreated}
            />

            {/* Header and New Event Button */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-3 md:mb-8">
                    <div>
                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            {/*  Smaller icon container */}
                            <div className="p-2 bg-black rounded-xl md:rounded-2xl">
                                <FiCalendar className="w-6 h-6 md:w-7 md:h-7 text-white" />
                            </div>
                            {/*  Smaller title size on mobile */}
                            <h1 className="text-3xl md:text-4xl font-bold text-black">Calendar</h1>
                        </div>
                        {/*  Smaller description text on mobile */}
                        <p className="text-sm md:text-md text-gray-500">Track your events and deadlines</p>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCreateModalOpen(true)}
                    //  Replaced 'btn-primary' and optimized button padding/text size for mobile
                    className="flex items-center gap-2 mt-4 sm:mt-0 px-4 py-2 bg-black text-white rounded-xl font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-shadow"
                >
                    <HiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    New Event
                </motion.button>
            </motion.div>

            <div className="w-full h-[3px] bg-gray-200 mb-6"></div>

            {/* View Switcher */}
            <motion.div variants={itemVariants} className="flex gap-2 mb-6">
                {["Month", "Week", "Day"].map((v) => (
                    <button
                        key={v}
                        onClick={() => setView(v)}
                        //  Ensured consistent small padding/text size on mobile pills
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm rounded-lg font-medium transition-colors ${view === v
                            //  Used standard black/white classes (assuming primary is black, text-foreground is black)
                            ? "bg-black text-white"
                            : "bg-gray-100 text-black hover:bg-gray-200"
                            }`}
                    >
                        {v}
                    </button>
                ))}
            </motion.div>

            {view === "Month" && <MonthViewCalendar />}
            {view === "Week" && <WeekView />}
            {view === "Day" && <DayView />}
        </motion.div>
    )
}