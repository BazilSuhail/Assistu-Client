// components/calendar/DayEventsModal.jsx

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { HiX, HiTrash, HiPencilAlt, HiChevronDown, HiChevronUp, HiCheck, HiOutlineX } from "react-icons/hi"
import axios from "axios"
import { createPortal } from 'react-dom'; // 👈 NEW: Import createPortal

const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || ""

const getAuthHeaders = () => {
    const token = localStorage.getItem("access")
    return { Authorization: `Bearer ${token}` }
}

const removeEvent = async (eventId) => {
    const headers = getAuthHeaders()
    try {
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

const editEvent = async (updatedEventData) => {
    const headers = getAuthHeaders()
    const { id, ...updates } = updatedEventData;

    try {
        const res = await axios.put(
            `${SERVER_API_URL}/events/update/${id}/`,
            { update: updates },
            { headers: headers }
        )
        return res.data
    } catch (err) {
        console.error("Failed to update event", err)
        throw err
    }
}

// EventItem Component (No changes needed here for modal positioning)
const EventItem = ({ event, onUpdate, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [localEvent, setLocalEvent] = useState(event);

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
                id: localEvent.id,
                title: localEvent.title,
                description: localEvent.description,
                start_time: localEvent.start_time,
                end_time: localEvent.end_time,
                event_type: localEvent.event_type
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
            className={`card p-4 flex flex-col gap-2 border-l-4 ${getIndicatorColor(localEvent.event_type)}`}
            onClick={handleExpandToggle}
        >
            <div className="flex justify-between items-start cursor-pointer">
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
                    <button className="p-1">
                        {isExpanded ? <HiChevronUp className="w-5 h-5 text-slate-500" /> : <HiChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 pt-3 border-t border-slate-200 dark:border-gray-600"
                >
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap mb-3">
                        {eventDescription}
                    </p>

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

// DayEventsModal Component (Updated to use a Portal)
export default function DayEventsModal({ open, onClose, selectedDate, events, onEventUpdate, onEventDelete }) {
    // 1. State to track if the component has mounted (required for using `document`)
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 2. Exit early if not open OR not mounted (prevents SSR errors)
    if (!open || !mounted) return null

    const formattedDate = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    // 3. Define the modal content as a variable
    const modalContent = (
        // Adjusted width classes: max-w-full on small screens, max-w-lg on larger screens
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4 sm:p-0">
            {/* Modal Inner: max-w-lg (larger than original max-w-md) and takes full width on small screens */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-full sm:max-w-lg p-6 transform transition-all">
                <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-foreground">Events on {selectedDate.getDate()}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <HiX className="w-6 h-6" />
                    </button>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{formattedDate}</p>

                <div className="min-h-[180px] max-h-[500px] overflow-y-auto pt-2 space-y-3">
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
    );

    // 4. Render the modal content into the "modal-root" element via the Portal
    return createPortal(
        modalContent,
        document.getElementById('modal-root')
    );
}