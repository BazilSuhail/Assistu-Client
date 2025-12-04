"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Loader from "@/components/shared/loader"
import { HiCheckCircle, HiCalendar, HiMicrophone, HiTrendingUp } from "react-icons/hi"
import Link from "next/link"
import axios from "axios"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  const [stats, setStats] = useState({
    notes_count: 0,
    tasks_next_month: 0,
    events_next_month: 0,
    study_plans_count: 0
  })

  const [tasksNextMonth, setTasksNextMonth] = useState([])
  const [eventsNextMonth, setEventsNextMonth] = useState([])

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("access")
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_API_URL}/tasks/dashboard/`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const data = res.data
        // console.log(res.data) // Kept for debugging, though usually removed in production

        // Mapping API response data to component state
        setStats({
          notes_count: data.notes_count || 0,
          tasks_next_month: data.tasks_next_month.length || 0,
          events_next_month: data.events_next_month.length || 0,
          study_plans_count: data.study_plans.length || 0
        })

        // Set list data for Tasks and Events
        setTasksNextMonth(Array.isArray(data.tasks_next_month) ? data.tasks_next_month.slice(0, 5) : []) // Limiting tasks to top 5
        setEventsNextMonth(Array.isArray(data.events_next_month) ? data.events_next_month.slice(0, 5) : []) // Limiting events to top 5

        setIsLoading(false)
      } catch (err) {
        console.error("Dashboard fetch failed", err)
        setStats({ notes_count: 0, tasks_next_month: 0, events_next_month: 0, study_plans_count: 0 })
        setTasksNextMonth([])
        setEventsNextMonth([])
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const STATS_CONFIG = [
    { title: "Tasks Next 30 Days", key: "tasks_next_month", icon: HiCheckCircle, color: "text-blue-500", link: "/tasks" },
    { title: "Events Next 30 Days", key: "events_next_month", icon: HiCalendar, color: "text-green-500", link: "/calendar" },
    { title: "Total Notes", key: "notes_count", icon: HiMicrophone, color: "text-purple-500", link: "/notes" },
    { title: "Study Plans", key: "study_plans_count", icon: HiTrendingUp, color: "text-orange-500", link: "/planner" }
  ]

  // Helper component for list items (Tasks and Events)
  const ListItem = ({ item, type }) => {
    let title, date, priority, subject, link;
    let colorClass = "border-gray-500";
    let subInfo;

    if (type === 'task') {
      title = item.title || "Untitled Task";
      date = item.due_date ? new Date(item.due_date).toLocaleDateString() : "No due date";
      priority = item.priority || "none";
      subject = item.subject || 'General';
      link = `/tasks/${item.id}`;
      subInfo = `${date} • ${subject}`;

      if (priority === "high") colorClass = "border-red-500";
      else if (priority === "medium") colorClass = "border-yellow-500";
      else colorClass = "border-gray-500";
    } else if (type === 'event') {
      title = item.title || "Untitled Event";
      date = item.start_time ? new Date(item.start_time).toLocaleString() : "Unknown time";
      link = `/calendar/`;
      colorClass = "border-green-500";
      subInfo = date;
    }

    return (
      <Link href={link} key={item.id} passHref>
        <motion.div
          whileHover={{ x: 4 }}
          className={`p-3 bg-slate-50 mb-3 dark:bg-slate-700/50 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border-l-4 ${colorClass}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subInfo}
              </p>
            </div>
            {type === 'task' && (
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${priority === "high"
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  : priority === "medium"
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
              >
                {priority}
              </span>
            )}
          </div>
        </motion.div>
      </Link>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 md:p-8 max-w-7xl mx-auto"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome back! 👋</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Here's a look at your next 30 days.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {STATS_CONFIG.map((s, idx) => {
          const Icon = s.icon
          return (
            <Link href={s.link} key={idx} passHref>
              <motion.div whileHover={{ y: -5 }} className="card p-6 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{s.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      {stats[s.key]}
                    </p>
                  </div>
                  <Icon className={`w-8 h-8 ${s.color}`} />
                </div>
              </motion.div>
            </Link>
          )
        })}
      </motion.div>

      {/* Tasks and Events Section */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
        {/* Next Month's Tasks (Top 5) */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Top 5 Tasks Due Next Month</h2>
          <div className="space-y-3">
            {tasksNextMonth.length === 0 ? (
              <div className="p-8 bg-card rounded-lg text-center text-slate-500 dark:text-slate-400">
                No upcoming tasks for the next 30 days. <Link href="/tasks" className="text-blue-500 hover:underline">Create a task</Link>
              </div>
            ) : (
              tasksNextMonth.map((task) => (
                <ListItem key={task.id} item={task} type="task" />
              ))
            )}
            {tasksNextMonth.length > 0 && (
              <div className="text-right mt-4">
                <Link href="/tasks" className="text-sm text-blue-500 hover:underline">View All Tasks &rarr;</Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Next Month's Events (Top 5) */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Top 5 Upcoming Events</h2>
          <div className="space-y-3">
            {eventsNextMonth.length === 0 ? (
              <div className="p-8 bg-card rounded-lg text-center text-slate-500 dark:text-slate-400">
                No events scheduled for the next 30 days. <Link href="/calendar" className="text-green-500 hover:underline">Schedule an event</Link>
              </div>
            ) : (
              eventsNextMonth.map((event) => (
                <ListItem key={event.id} item={event} type="event" />
              ))
            )}
            {eventsNextMonth.length > 0 && (
              <div className="text-right mt-4">
                <Link href="/calendar" className="text-sm text-green-500 hover:underline">View All Events &rarr;</Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}