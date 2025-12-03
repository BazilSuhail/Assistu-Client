"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import Loader from "@/components/shared/loader"
import VoiceCommandBar from "@/components/shared/voice-command-bar"
import { HiChevronLeft, HiChevronRight, HiPlus, HiX, HiTrash, HiPencilAlt, HiChevronDown, HiChevronUp, HiCheck, HiOutlineX } from "react-icons/hi"
import axios from "axios"
import CreateEventModal from "@/components/events/CreateEvent"

// --- Event API Functions ---
const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || ""

// Helper function for authentication headers
const getAuthHeaders = () => {
    const token = localStorage.getItem("access")
    console.log(token)
    return { Authorization: `Bearer ${token}` }
}

const removeEvent = async (eventId) => {
    const headers = getAuthHeaders()
    try {
        // FIX: Switched to DELETE method and placed eventId in the URL
        const res = await axios.delete(
            `${SERVER_API_URL}/events/delete/${eventId}/`,
            { headers: headers }
        )
        return res.data
    } catch (err) {
        console.error("Failed to delete event", err)
        throw err
    }
}

/**
 * Function to edit an event using PUT method with ID in URL.
 * Backend URL: /events/update/<str:event_id>/
 */
const editEvent = async (updatedEventData) => {
    const headers = getAuthHeaders()

    // Extract ID for the URL and keep the rest as the 'update' payload
    const { id, ...updates } = updatedEventData;

    try {
        // FIX: Put eventId in the URL and send the updates object in the body
        const res = await axios.put(
            `${SERVER_API_URL}/events/update/${id}/`,
            { update: updates }, // Send the updates payload nested under 'update' key
            { headers: headers }
        )
        return res.data
    } catch (err) {
        console.error("Failed to update event", err)
        throw err
    }
}


// --- EventItem Component ---

const EventItem = ({ event, onUpdate, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [localEvent, setLocalEvent] = useState(event);

    // Sync local state when event prop changes (e.g., after successful update)
    useEffect(() => {
        setLocalEvent(event);
    }, [event]);

    const getIndicatorColor = (type) => {
        if (type === "deadline") return "border-red-500"
        if (type === "exam") return "border-purple-500"
        return "border-blue-500"
    }

    const eventDescription = localEvent.description || `This is the description for the event: **${localEvent.title}**. Click the chevron icon to expand the description and access the edit/delete buttons.`;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalEvent(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleSave = async () => {
        try {
            await editEvent({
                id: localEvent.id, // Mandatory ID for the backend
                title: localEvent.title,
                description: localEvent.description,
                start_time: localEvent.start_time,
                end_time: localEvent.end_time,
                event_type: localEvent.event_type
                // Only sending fields that were likely edited (title, description, type, times)
            });
            setIsEditing(false);
            onUpdate();
        } catch (error) {
            alert("Failed to save event. Check console for details.");
        }
    }

    const handleCancel = () => {
        setLocalEvent(event);
        setIsEditing(false);
    }

    const handleExpandToggle = (e) => {
        // Prevent action when clicking interactive elements
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('select')) {
            return;
        }
        setIsExpanded(prev => !prev);
    }


    if (isEditing) {
        return (
            <motion.div
                initial={{ opacity: 0, scaleY: 0.9 }}
                animate={{ opacity: 1, scaleY: 1 }}
                className={`card p-4 space-y-3 shadow-lg ${getIndicatorColor(localEvent.event_type)}`}
            >
                <input
                    name="title"
                    value={localEvent.title}
                    onChange={handleInputChange}
                    className="w-full text-lg font-semibold text-foreground bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none p-1"
                    placeholder="Event Title"
                />
                <textarea
                    name="description"
                    value={localEvent.description || ''}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full text-sm text-slate-600 dark:text-slate-300 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 p-2 outline-none"
                    placeholder="Description (Optional)"
                />
                <div className="flex justify-between items-center text-sm">
                    {/* Simplified time/type inputs - for a real app, use DateTime pickers */}
                    <select
                        name="event_type"
                        value={localEvent.event_type}
                        onChange={handleInputChange}
                        className="bg-slate-100 dark:bg-slate-700 text-foreground rounded-md p-1"
                    >
                        <option value="meeting">Meeting</option>
                        <option value="deadline">Deadline</option>
                        <option value="exam">Exam</option>
                    </select>

                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-1 text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 transition font-medium"
                        >
                            <HiCheck className="w-5 h-5" /> Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition"
                        >
                            <HiOutlineX className="w-5 h-5" /> Cancel
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className={`card p-4 flex flex-col gap-2 border-l-4 ${getIndicatorColor(localEvent.event_type)}`}
            onClick={handleExpandToggle}
        >
            {/* Top row: Title and Controls (Chevron only) */}
            <div
                className="flex justify-between items-start cursor-pointer"
            >
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg text-foreground truncate">{localEvent.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {new Date(localEvent.start_time).toLocaleTimeString()} - {new Date(localEvent.end_time).toLocaleTimeString()}
                    </p>
                    <span className="text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
                        {localEvent.event_type}
                    </span>
                </div>

                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    {/* Chevron Button */}
                    <button className="p-1">
                        {isExpanded ? <HiChevronUp className="w-5 h-5 text-slate-500" /> : <HiChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                </div>
            </div>

            {/* Expandable Description and Action Buttons */}
            {isExpanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 pt-3 border-t border-slate-200 dark:border-gray-600"
                >
                    {/* Description Area */}
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap mb-3">
                        {eventDescription}
                    </p>

                    {/* Action Buttons (Visible only when expanded) */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                            className="text-sm flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition"
                            title="Edit Event"
                        >
                            <HiPencilAlt className="w-4 h-4" /> Edit
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(localEvent.id); }}
                            className="text-sm flex items-center gap-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition"
                            title="Delete Event"
                        >
                            <HiTrash className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}

// --- DayEventsModal Component ---

const DayEventsModal = ({ open, onClose, selectedDate, events, onEventUpdate, onEventDelete }) => {
    if (!open) return null

    const formattedDate = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[5px]">
            <div className="bg-white  dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 transform transition-all">
                <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-foreground">Events on {selectedDate.getDate()}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <HiX className="w-6 h-6" />
                    </button>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{formattedDate}</p>

                <div className="min-h-[180px] pt-2 space-y-3">
                    {events.length > 0 ? (
                        events.map((event) => (
                            <EventItem
                                key={event.id}
                                event={event}
                                onUpdate={onEventUpdate}
                                onDelete={onEventDelete}
                            />
                        ))
                    ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400">No events scheduled for this day.</p>
                    )}
                </div>
            </div>
        </div>
    )
}


export default function CalendarPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [view, setView] = useState("Month")
    const [events, setEvents] = useState([])
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [dayModalOpen, setDayModalOpen] = useState(false)
    const [selectedDayEvents, setSelectedDayEvents] = useState([])

    const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    const [selectedDate, setSelectedDate] = useState(null)

    const fetchEvents = async () => {
        setIsLoading(true)
        try {
            const res = await axios.get(
                `${SERVER_API_URL}/events/`,
                { headers: getAuthHeaders() }
            )
            setEvents(res.data)
        } catch (err) {
            console.error("Failed to fetch events", err)
            setEvents([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [])

    const handleViewChange = (newView) => {
        setView(newView)
        if (newView === "Month") {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
        }
    }

    // --- Event Action Handlers ---

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return

        try {
            await removeEvent(eventId)
            // Re-fetch events to update the UI globally
            await fetchEvents()

            // Re-filter events for the Day Modal if it's open
            if (dayModalOpen && selectedDate) {
                onDayClick(selectedDate.getDate());
            }

        } catch (error) {
            alert("Failed to delete event. Please check the console for details.")
        }
    }

    // This function handles the state update for the Day Modal after an inline edit/delete
    const updateDayModalEvents = async () => {
        // Re-fetch all events first
        await fetchEvents();

        // Then update the events list within the modal
        if (dayModalOpen && selectedDate) {
            onDayClick(selectedDate.getDate());
        }
    }


    // --- Calendar Logic ---

    const eventDays = useMemo(() => {
        const currentMonth = currentDate.getMonth()
        const currentYear = currentDate.getFullYear()

        return events.reduce((days, event) => {
            const eventStart = new Date(event.start_time)
            const eventEnd = new Date(event.end_time)

            if (
                (eventStart.getMonth() === currentMonth && eventStart.getFullYear() === currentYear) ||
                (eventEnd.getMonth() === currentMonth && eventEnd.getFullYear() === currentYear)
            ) {
                if (eventStart.getMonth() === currentMonth) {
                    days.add(eventStart.getDate())
                }
            }
            return days
        }, new Set())
    }, [events, currentDate])

    const onDayClick = (day) => {
        const dateClicked = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        setSelectedDate(dateClicked)

        const dayStart = new Date(dateClicked)
        dayStart.setHours(0, 0, 0, 0)

        const dayEnd = new Date(dateClicked)
        dayEnd.setHours(23, 59, 59, 999)

        const filteredEvents = events.filter(event => {
            const eventStart = new Date(event.start_time)
            const eventEnd = new Date(event.end_time)

            return eventStart < dayEnd && eventEnd > dayStart
        })

        setSelectedDayEvents(filteredEvents)
        setDayModalOpen(true)
    }

    const handleMonthChange = (direction) => {
        setCurrentDate((prevDate) => {
            const newDate = new Date(prevDate)
            newDate.setDate(1)
            newDate.setMonth(prevDate.getMonth() + direction)
            return newDate
        })
    }

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

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

    const calendarGridDays = [
        ...Array(firstDayOfMonth).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
    ]

    const currentMonthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const today = new Date()
    const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear()
    const currentDayOfMonth = isCurrentMonth ? today.getDate() : null

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-4 md:p-8 max-w-6xl mx-auto"
        >
            <CreateEventModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreated={fetchEvents}
            />

            {selectedDate && (
                <DayEventsModal
                    open={dayModalOpen}
                    onClose={() => setDayModalOpen(false)}
                    selectedDate={selectedDate}
                    events={selectedDayEvents}
                    onEventUpdate={updateDayModalEvents} // Used to re-render the modal content
                    onEventDelete={handleDeleteEvent}
                />
            )}

            {/* Header and New Event Button */}
            <motion.div variants={itemVariants} className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Calendar 🗓️</h1>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">Track your events and deadlines</p>
                </div>
                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="btn-primary flex items-center gap-2 mt-4 sm:mt-0 px-3 py-2 text-sm sm:text-base"
                >
                    <HiPlus className="w-5 h-5" />
                    New Event
                </button>
            </motion.div>

            {/* Voice Command Bar */}
            <motion.div variants={itemVariants} className="mb-6 md:mb-8">
                <VoiceCommandBar />
            </motion.div>

            {/* View Switcher */}
            <motion.div variants={itemVariants} className="flex gap-2 mb-6">
                {["Month", "Week", "Day"].map((v) => (
                    <button
                        key={v}
                        onClick={() => handleViewChange(v)}
                        className={`px-3 py-1 sm:px-4 sm:py-2 text-sm rounded-lg font-medium transition-colors ${view === v
                                ? "bg-primary text-white"
                                : "bg-slate-100 dark:bg-slate-700 text-foreground hover:bg-slate-200 dark:hover:bg-slate-600"
                            }`}
                    >
                        {v}
                    </button>
                ))}
            </motion.div>

            {/* Month View */}
            {view === "Month" && (
                <motion.div variants={itemVariants} className="card p-4 sm:p-6 mb-8">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-foreground">{currentMonthName}</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleMonthChange(-1)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <HiChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleMonthChange(1)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <HiChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                        {/* Days of the Week Header */}
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                            <div key={day} className="text-center font-bold text-xs sm:text-sm text-slate-600 dark:text-slate-400 py-2">
                                {day}
                            </div>
                        ))}
                        {/* Calendar Days */}
                        {calendarGridDays.map((day, index) => {
                            if (day === null) {
                                return <div key={`empty-${index}`} className="p-3"></div>
                            }
                            const hasEvent = eventDays.has(day)
                            const isToday = day === currentDayOfMonth

                            let baseClasses = "bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700"
                            if (isToday) {
                                baseClasses = "bg-primary text-white font-bold hover:bg-primary-dark"
                            } else if (hasEvent) {
                                baseClasses = "bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800"
                            }

                            return (
                                <div
                                    key={day}
                                    onClick={() => onDayClick(day)}
                                    className={`p-1 sm:p-3 rounded-lg text-center cursor-pointer transition-colors relative flex flex-col items-center justify-center min-h-[40px] sm:min-h-[60px] ${baseClasses}`}
                                >
                                    <div className={`text-sm sm:text-lg font-semibold ${isToday ? 'text-white' : 'text-foreground'}`}>
                                        {day}
                                    </div>
                                    {/* Event Indicator Circle */}
                                    {hasEvent && (
                                        <div className={`mt-1 w-2 h-2 rounded-full ${isToday ? 'bg-white' : 'bg-blue-500'}`} />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            )}

            {/* Upcoming Events List */}
            <motion.div variants={itemVariants}>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">Upcoming Events 📅</h3>
                <div className="space-y-3">
                    {events.length ? events.map(event => (
                        <EventItem
                            key={event.id}
                            event={event}
                            onUpdate={fetchEvents} // Always re-fetch all events on successful update from the main list
                            onDelete={handleDeleteEvent}
                        />
                    )) : (
                        <p className="text-center text-slate-500">No upcoming events</p>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}