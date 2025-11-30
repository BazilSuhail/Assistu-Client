"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HiHome, HiCheckCircle, HiCalendar, HiMicrophone, HiLightBulb } from "react-icons/hi"

const ROUTES = [
  { name: "Dashboard", path: "/dashboard", icon: HiHome },
  { name: "Tasks", path: "/tasks", icon: HiCheckCircle },
  { name: "Calendar", path: "/calendar", icon: HiCalendar },
  { name: "Notes", path: "/notes", icon: HiMicrophone },
  { name: "Planner", path: "/planner", icon: HiLightBulb },
]

export default function BottomNav({ darkMode, onToggleDarkMode }) {
  const pathname = usePathname()

  return (
    <nav className="border-t border-border dark:border-slate-700 bg-white dark:bg-slate-800 grid grid-cols-5 gap-1 p-2">
      {ROUTES.map((route) => {
        const Icon = route.icon
        const isActive = pathname === route.path || pathname.startsWith(route.path + "/")
        return (
          <Link key={route.path} href={route.path}>
            <button
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors ${
                isActive ? "text-primary bg-blue-50 dark:bg-blue-900/20" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{route.name}</span>
            </button>
          </Link>
        )
      })}
    </nav>
  )
}
