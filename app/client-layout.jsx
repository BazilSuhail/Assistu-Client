"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/layout/Sidebar"
import BottomNav from "@/components/layout/bottom-nav"
import SettingsModal from "@/components/layout/SettingsModal"
import { usePathname } from "next/navigation"

export default function ClientLayout({ children, geistMono }) {
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true"
    setDarkMode(isDark)
    document.documentElement.classList.toggle("dark", isDark)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(true)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem("darkMode", newDarkMode)
    document.documentElement.classList.toggle("dark", newDarkMode)
  }

  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/register"

  if (isAuthPage) {
    return <div className={darkMode ? "dark" : ""}>{children}</div>
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen overflow-hidden">
        {!isMobile && (
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        )}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">{children}</div>
          {isMobile && (
            <BottomNav
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
              onOpenSettings={() => setSettingsModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Settings Modal for Mobile */}
      {isMobile && (
        <SettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      )}
    </div>
  )
}
