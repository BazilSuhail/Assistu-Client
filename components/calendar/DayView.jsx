// src/components/calendar/DayView.jsx

"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiChevronRight, HiViewList } from "react-icons/hi";
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
  if (type === "deadline") return "bg-red-500 border-red-500 text-red-700 dark:text-red-300";
  if (type === "exam") return "bg-purple-500 border-purple-500 text-purple-700 dark:text-purple-300";
  return "bg-blue-500 border-blue-500 text-blue-700 dark:text-blue-300";
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

export default function DayView() {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal state
  const [dayModalOpen, setDayModalOpen] = useState(false);

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

  const handleDayChange = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + direction);
      return newDate;
    });
  };

  const handleEventUpdate = () => {
    fetchEvents(); // Refresh events after update
  };

  const handleEventDelete = async (eventId) => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${SERVER_API_URL}/events/delete/${eventId}/`, { headers });
      fetchEvents(); // Refresh events after deletion
    } catch (error) {
      console.error("Failed to delete event", error);
      alert("Failed to delete event");
    }
  };

  const dayEvents = useMemo(() => {
    return events.filter(event =>
      isDateInEventRange(currentDate, event.start_time, event.end_time)
    );
  }, [events, currentDate]);

  const getEventPosition = (event) => {
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);

    // Calculate position relative to 6 AM start
    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
    const endHour = endTime.getHours() + endTime.getMinutes() / 60;

    const top = (startHour - 6) * 60;
    const height = (endHour - startHour) * 60;

    return { top, height };
  };

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (isLoading) {
    return (
      <div className="card p-6 flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <motion.div variants={itemVariants} className="card p-4 sm:p-6 mb-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-md sm:text-xl font-bold text-foreground">{formattedDate}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'} scheduled
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setDayModalOpen(true)}
            // Highlight button and make it slightly larger on mobile
            className="p-2 sm:p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors bg-slate-100 dark:bg-slate-700"
            title="View All Events"
          >
            <HiViewList className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDayChange(-1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <HiChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDayChange(1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <HiChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {dayEvents.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <p>No events scheduled for this day</p>
        </div>
      ) : (
        <>
          {/* Timeline View for desktop */}
          <div className="hidden md:block relative overflow-x-auto"> {/* Added overflow-x-auto for smaller desktop screens */}
            <div className="relative min-w-[500px]" style={{ height: '1080px' }}> {/* Set min-width to ensure timeline isn't crushed */}
              {/* Time labels */}
              <div className="absolute left-0 top-0 bottom-0 w-16">
                {Array.from({ length: 18 }, (_, i) => i + 6).map(hour => (
                  <div
                    key={hour}
                    className="absolute text-xs text-slate-500 dark:text-slate-400"
                    style={{ top: `${(hour - 6) * 60}px` }}
                  >
                    {hour % 12 === 0 ? 12 : hour % 12} {hour < 12 ? 'AM' : 'PM'}
                  </div>
                ))}
              </div>

              {/* Hour lines */}
              <div className="absolute left-16 right-0 top-0 bottom-0">
                {Array.from({ length: 18 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-slate-200 dark:border-slate-600"
                    style={{ top: `${i * 60}px` }}
                  />
                ))}
              </div>

              {/* Events */}
              <div className="absolute left-16 right-0 top-0 bottom-0">
                {dayEvents.map((event, idx) => {
                  const position = getEventPosition(event);
                  return (
                    <div
                      key={idx}
                      className={`absolute left-0 right-0 mx-1 p-2 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getEventColorClass(event.event_type)} bg-opacity-20`}
                      style={{
                        top: `${position.top}px`,
                        height: `${position.height}px`,
                        minHeight: '30px'
                      }}
                    >
                      <div className="font-semibold text-sm text-white truncate">
                        {event.title}
                      </div>
                      <div className="text-xs text-slate-200 dark:text-slate-400">
                        {new Date(event.start_time).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })} - {new Date(event.end_time).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* List View for mobile (md:hidden ensures this is used on small screens) */}
          <div className="md:hidden space-y-2">
            {dayEvents.map((event, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getEventColorClass(event.event_type)} bg-opacity-20`}
              >
                <div className="font-semibold text-white">
                  {event.title}
                </div>
                <div className="text-sm text-slate-200 dark:text-slate-400 mt-1">
                  {new Date(event.start_time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })} - {new Date(event.end_time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
                {event.description && (
                  <div className="text-xs text-slate-300 dark:text-slate-400 mt-2">
                    {event.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <DayEventsModal
        open={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        selectedDate={currentDate}
        events={dayEvents}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
      />
    </motion.div>
  );
}