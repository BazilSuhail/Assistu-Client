// src/components/calendar/MonthView.jsx

"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import axios from "axios";
import Loader from "@/components/shared/loader";
import DayEventsModal from "@/components/calendar/DayEventsModal";

const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || "";

const getAuthHeaders = () => {
    const token = localStorage.getItem("access");
    return { Authorization: `Bearer ${token}` };
};

const isDateInEventRange = (date, eventStart, eventEnd) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const start = new Date(eventStart);
    const end = new Date(eventEnd);

    // Check if the event overlaps with the current day
    return start < dayEnd && end > dayStart;
};

const getEventColorClass = (type) => {
    if (type === "deadline") return "bg-red-500";
    if (type === "exam") return "bg-purple-500";
    return "bg-blue-500";
};

const itemVariants = {
    hidden: { y: 20 },
    visible: { y: 0 },
};

export default function MonthViewCalendar() {
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

    // Modal state
    const [dayModalOpen, setDayModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDayEvents, setSelectedDayEvents] = useState([]);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(
                `${SERVER_API_URL}/events/`,
                { headers: getAuthHeaders() }
            );
            setEvents(res.data);
        } catch (err) {
            console.error("Failed to fetch events", err);
            setEvents([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleMonthChange = (direction) => {
        setCurrentDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setDate(1);
            newDate.setMonth(prevDate.getMonth() + direction);
            return newDate;
        });
    };

    const handleDayClick = (day) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(clickedDate);

        // Filter events for this specific day
        const dayEvents = events.filter(event =>
            isDateInEventRange(clickedDate, event.start_time, event.end_time)
        );
        setSelectedDayEvents(dayEvents);
        setDayModalOpen(true);
    };

    const handleEventUpdate = () => {
        fetchEvents(); // Refresh events after update
    };

    const handleEventDelete = async (eventId) => {
        try {
            const headers = getAuthHeaders();
            await axios.delete(`${SERVER_API_URL}/events/delete/${eventId}/`, { headers });
            fetchEvents(); // Refresh events after deletion

            // Update modal events
            const updatedEvents = selectedDayEvents.filter(e => e.id !== eventId);
            setSelectedDayEvents(updatedEvents);
        } catch (error) {
            console.error("Failed to delete event", error);
            alert("Failed to delete event");
        }
    };

    const eventsByDay = useMemo(() => {
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const daysMap = {};

        events.forEach(event => {
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

            for (let day = 1; day <= daysInMonth; day++) {
                const dayDate = new Date(currentYear, currentMonth, day);

                if (isDateInEventRange(dayDate, event.start_time, event.end_time)) {
                    if (!daysMap[day]) {
                        daysMap[day] = { count: 0, types: new Set() };
                    }
                    daysMap[day].count += 1;
                    daysMap[day].types.add(event.event_type);
                }
            }
        });

        Object.keys(daysMap).forEach(day => {
            daysMap[day].types = Array.from(daysMap[day].types);
        });

        return daysMap;
    }, [events, currentDate]);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const calendarGridDays = [
        ...Array(firstDayOfMonth).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
    ];

    const currentMonthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
    const currentDayOfMonth = isCurrentMonth ? today.getDate() : null;

    if (isLoading) {
        return (
            //  Min height reduced for mobile visibility
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                <Loader />
            </div>
        );
    }

    //  Using standard black/white classes for assumed theme consistency
    const PRIMARY_COLOR = 'bg-black';
    const PRIMARY_TEXT_COLOR = 'text-white';
    const DAY_TEXT_COLOR = 'text-gray-900';
    const TODAY_DARK_HOVER = 'hover:bg-gray-800';

    return (
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                {/*  Adjusted text size for mobile */}
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{currentMonthName}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleMonthChange(-1)}
                        //  Adjusted padding and hover state for better mobile tap target/visuals
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <HiChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleMonthChange(1)}
                        //  Adjusted padding and hover state for better mobile tap target/visuals
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <HiChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                {/* Day Labels */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    //  Reduced text size for mobile
                    <div key={day} className="text-center font-bold text-xs sm:text-sm text-gray-500 py-1 sm:py-2">
                        {day}
                    </div>
                ))}
                {/* Day Cells */}
                {calendarGridDays.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="p-3"></div>;
                    }

                    const dayEventsData = eventsByDay[day] || { count: 0, types: [] };
                    const hasEvent = dayEventsData.count > 0;
                    const isToday = day === currentDayOfMonth;

                    let baseClasses = "bg-gray-50 hover:bg-gray-100";
                    if (isToday) {
                        baseClasses = `${PRIMARY_COLOR} ${PRIMARY_TEXT_COLOR} font-bold ${TODAY_DARK_HOVER}`;
                    } else if (hasEvent) {
                        baseClasses = "bg-blue-50 hover:bg-blue-100";
                    }

                    return (
                        <motion.div
                            whileTap={{ scale: 0.95 }}
                            key={day}
                            onClick={() => handleDayClick(day)}
                            //  Optimized padding and minimum height for mobile: min-h-[50px]
                            className={`p-1.5 sm:p-3 rounded-lg text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[50px] sm:min-h-[70px] ${baseClasses}`}
                        >
                            {/* Day Number */}
                            <div className={`text-sm sm:text-lg font-semibold ${isToday ? PRIMARY_TEXT_COLOR : DAY_TEXT_COLOR}`}>
                                {day}
                            </div>
                            {/* Event Indicators */}
                            {hasEvent && (
                                <div className="mt-1 flex justify-center items-center gap-0.5 sm:gap-1">
                                    {dayEventsData.types.slice(0, 2).map((type, i) => (
                                        <div
                                            key={i}
                                            //  Reduced dot size for mobile: w-1.5 h-1.5
                                            className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isToday ? PRIMARY_TEXT_COLOR : getEventColorClass(type)}`}
                                        />
                                    ))}
                                    {dayEventsData.count > 2 && (
                                        //  Reduced text size for mobile: text-[8px]
                                        <span className={`text-[8px] sm:text-[10px] px-1 rounded-sm ${isToday ? 'text-white bg-gray-700' : 'text-gray-700 bg-gray-200'} font-medium`}>
                                            +{dayEventsData.count - 2}
                                        </span>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Day Events Modal */}
            {selectedDate && (
                <DayEventsModal
                    open={dayModalOpen}
                    onClose={() => setDayModalOpen(false)}
                    selectedDate={selectedDate}
                    events={selectedDayEvents}
                    onEventUpdate={handleEventUpdate}
                    onEventDelete={handleEventDelete}
                />
            )}
        </motion.div>
    );
}