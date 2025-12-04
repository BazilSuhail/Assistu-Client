"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { HiHome, HiCheckCircle, HiCalendar, HiMicrophone, HiLightBulb, HiCog } from "react-icons/hi"
import { LuMonitorDot } from "react-icons/lu"

const ROUTES = [
  { name: "Dashboard", path: "/dashboard", icon: HiHome },
  { name: "Tasks", path: "/tasks", icon: HiCheckCircle },
  { name: "Calendar", path: "/calendar", icon: HiCalendar },
  { name: "Notes", path: "/notes", icon: HiMicrophone },
  { name: "Others", path: "planner-menu", icon: LuMonitorDot }, // Changed to trigger menu
]

export default function BottomNav({ onOpenSettings }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuOpen])

  const handlePlannerClick = () => {
    setMenuOpen(!menuOpen)
  }

  const handleMenuItemClick = (action) => {
    setMenuOpen(false)
    if (action === "planner") {
      router.push("/planner")
    } else if (action === "settings") {
      onOpenSettings?.()
    }
  }

  return (
    <nav className="border-t border-border dark:border-slate-700 bg-white dark:bg-slate-800 grid grid-cols-5 gap-0 p-2 relative">
      {ROUTES.map((route) => {
        const Icon = route.icon
        const isActive = pathname === route.path || pathname.startsWith(route.path + "/")

        // Special handling for Planner menu
        if (route.path === "planner-menu") {
          return (
            <div key={route.path} className="relative flex flex-col items-stretch" ref={menuRef}>
              <button
                onClick={handlePlannerClick}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors w-full h-full ${pathname === "/planner"
                    ? "text-black bg-slate-100 dark:text-white dark:bg-slate-700"
                    : "text-gray-400 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-medium text-center">{route.name}</span>
              </button>

              {/* Floating Menu */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full mb-5 left-1/2 -translate-x-[80%] w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-50"
                  >
                    {/* Planner Option */}
                    <button
                      onClick={() => handleMenuItemClick("planner")}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors border-b border-slate-100 dark:border-slate-700"
                    >
                      <HiLightBulb className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">Study Planner</span>
                    </button>

                    {/* Settings Option */}
                    <button
                      onClick={() => handleMenuItemClick("settings")}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                    >
                      <HiCog className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">Settings</span>
                    </button>

                    {/* Arrow pointer */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700 rotate-45"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        }

        return (
          <Link key={route.path} href={route.path} className="flex flex-col items-stretch">
            <button
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors w-full h-full ${isActive
                  ? "text-black bg-slate-100 dark:text-white dark:bg-slate-700"
                  : "text-gray-400 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium text-center">{route.name}</span>
            </button>
          </Link>
        )
      })}
    </nav>
  )
}