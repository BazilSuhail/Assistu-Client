// src/components/calendar/WeekView.jsx

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

const itemVariants = {
  hidden: { y: 20 },
  visible: { y: 0 },
};

const getEventColorClass = (type) => {
  if (type === "deadline") return "bg-red-500 border-red-500";
  if (type === "exam") return "bg-purple-500 border-purple-500";
  return "bg-blue-500 border-blue-500";
};

const isDateInEventRange = (date, eventStart, eventEnd) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const start = new Date(eventStart);
  const end = new Date(eventEnd);

  return start < dayEnd && end > dayStart;
};

export default function WeekView() {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const handleWeekChange = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + (direction * 7));
      return newDate;
    });
  };

  const handleDayClick = (day) => {
    setSelectedDate(day);

    // Filter events for this specific day
    const dayEvents = events.filter(event =>
      isDateInEventRange(day, event.start_time, event.end_time)
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

  const getWeekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    // Adjusted to start on Monday for a typical calendar week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjusts to Monday of the current week (or previous week if day is Sunday)
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }, [currentDate]);

  const weekRange = `${getWeekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${getWeekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  if (isLoading) {
    return (
      <div className="card p-6 flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <motion.div variants={itemVariants} className="p-2 sm:p-4 md:p-6 mb-4"> {/* Adjusted overall padding */}
      <div className="flex items-center justify-between mb-3 sm:mb-4"> {/* Adjusted margin */}
        <h2 className="text-base sm:text-lg font-bold text-foreground">{weekRange}</h2> {/* Adjusted font size */}
        <div className="flex gap-1 sm:gap-2"> {/* Adjusted gap */}
          <button
            onClick={() => handleWeekChange(-1)}
            className="p-1 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" // Adjusted padding
          >
            <HiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> {/* Adjusted icon size */}
          </button>
          <button
            onClick={() => handleWeekChange(1)}
            className="p-1 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" // Adjusted padding
          >
            <HiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /> {/* Adjusted icon size */}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2"> {/* Adjusted gap */}
        {getWeekDays.map((day, index) => {
          const dayEvents = events.filter(event =>
            isDateInEventRange(day, event.start_time, event.end_time)
          );

          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              onClick={() => handleDayClick(day)}
              className={`p-1 sm:p-2 rounded-lg border cursor-pointer transition-all ${isToday
                ? 'bg-black border-black dark:bg-black' // **Change to black background for today**
                : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-primary dark:hover:border-primary'
                }`} // Adjusted padding
            >
              <div className="text-center mb-1 sm:mb-2"> {/* Adjusted margin */}
                <div className={`text-[10px] sm:text-xs ${isToday ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'}`}> {/* Adjusted font size and color for today */}
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-base sm:text-lg font-bold ${isToday ? 'text-white' : 'text-foreground'}`}> {/* Adjusted font size and color for today */}
                  {day.getDate()}
                </div>
              </div>

              <div className="space-y-0.5 sm:space-y-1"> {/* Adjusted space-y */}
                {dayEvents.slice(0, 3).map((event, idx) => (
                  <div
                    key={idx}
                    className={`text-[10px] sm:text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity border-l-2 ${getEventColorClass(event.event_type)} bg-opacity-20`} // Adjusted padding and font size
                  >
                    <div className="font-medium text-white/80 truncate">
                      {event.title}
                    </div>
                    <div className="text-[8px] sm:text-[10px] text-white/80"> {/* Adjusted font size */}
                      {new Date(event.start_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] sm:text-xs text-center text-slate-500 dark:text-slate-400 pt-0.5 sm:pt-1"> {/* Adjusted font size and padding */}
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
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