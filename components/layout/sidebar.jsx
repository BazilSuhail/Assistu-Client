"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  HiHome,
  HiCheckCircle,
  HiCalendar,
  HiMicrophone,
  HiLightBulb,
  HiCog,
  HiMenu,
  HiMoon,
  HiSun,
  HiLogout,
} from "react-icons/hi"
import SettingsModal from "./SettingsModal"
import Image from "next/image"

const ROUTES = [
  { name: "Dashboard", path: "/dashboard", icon: HiHome },
  { name: "Tasks", path: "/tasks", icon: HiCheckCircle },
  { name: "Calendar", path: "/calendar", icon: HiCalendar },
  { name: "Notes", path: "/notes", icon: HiMicrophone },
  { name: "Study Planner", path: "/planner", icon: HiLightBulb },
  { name: "Settings", path: "settings-modal", icon: HiCog }, // Changed to trigger modal
]

export default function Sidebar({ isOpen, onToggle, darkMode, onToggleDarkMode }) {
  const pathname = usePathname()
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)

  return (
    <>
      <motion.aside
        initial={{ width: 0 }}
        animate={{ width: isOpen ? 250 : 80 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-800 border-r border-border dark:border-slate-700 flex flex-col overflow-hidden"
      >
        <div className="p-4 flex items-center justify-between">

          {isOpen && (
            <motion.div
              animate={{ opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <>
              <Image
               src="/assistu.webp"
            alt="No tasks available"
            width={40}
            height={40}
              />
                <span className="font-bold text-sm truncate">Assistu</span>
              </>
            </motion.div>

          )}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <HiMenu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 -mt-2 overflow-y-auto">
          {ROUTES.map((route) => {
            const Icon = route.icon
            const isActive = pathname === route.path || pathname.startsWith(route.path + "/")

            // For settings, render a button instead of Link
            if (route.path === "settings-modal") {
              return (
                <button
                  key={route.path}
                  onClick={() => setSettingsModalOpen(true)}
                  className="w-full"
                >
                  <motion.div
                    className={`flex items-center gap-3 px-3 py-2 mt-4 rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-700 text-foreground ${!isOpen ? "justify-center w-[50px]" : ""}`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {isOpen && <span className="text-sm font-medium truncate">{route.name}</span>}
                  </motion.div>
                </button>
              )
            }

            return (
              <Link key={route.path} href={route.path}>
                <motion.div
                  className={`flex items-center gap-3 px-3 py-2 mt-4 rounded-lg transition-all ${isActive
                    ? "bg-primary text-white"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700 text-foreground"
                    } ${!isOpen ? "justify-center w-[50px]" : ""}`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {isOpen && <span className="text-sm font-medium truncate">{route.name}</span>}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border dark:border-slate-700 space-y-2">
          <button
            onClick={onToggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {darkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            {isOpen && <span className="text-sm font-medium">{darkMode ? "Light" : "Dark"}</span>}
          </button>
          <Link href="/auth/login" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-red-600">
            <HiLogout className="w-5 h-5" />
            {isOpen && <span className="text-sm font-medium">Logout</span>}
          </Link>
        </div>
      </motion.aside>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
      />
    </>
  )
}

