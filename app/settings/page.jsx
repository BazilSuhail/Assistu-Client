"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Loader from "@/components/shared/loader"
import { HiBell, HiShieldCheck, HiCog } from "react-icons/hi"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000)
    return () => clearTimeout(timer)
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
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const settingsSections = [
    {
      title: "Notifications",
      icon: HiBell,
      settings: [
        { label: "Email Reminders", enabled: true },
        { label: "Push Notifications", enabled: true },
        { label: "Task Reminders", enabled: false },
      ],
    },
    {
      title: "Privacy & Security",
      icon: HiShieldCheck,
      settings: [
        { label: "Two-Factor Authentication", enabled: false },
        { label: "Data Collection", enabled: true },
      ],
    },
    {
      title: "Preferences",
      icon: HiCog,
      settings: [
        { label: "Dark Mode", enabled: false },
        { label: "Sound Effects", enabled: true },
      ],
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 md:p-8 max-w-2xl mx-auto"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your account and preferences</p>
      </motion.div>

      {settingsSections.map((section, idx) => {
        const Icon = section.icon
        return (
          <motion.div key={idx} variants={itemVariants} className="card p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Icon className="w-6 h-6 text-primary" />
              <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
            </div>
            <div className="space-y-4">
              {section.settings.map((setting, sidx) => (
                <div
                  key={sidx}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <label className="text-foreground cursor-pointer">{setting.label}</label>
                  <div className="relative inline-block w-12 h-6 bg-slate-300 dark:bg-slate-600 rounded-full">
                    <input
                      type="checkbox"
                      defaultChecked={setting.enabled}
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <motion.div
                      layout
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-colors ${
                        setting.enabled ? "bg-primary translate-x-6" : "bg-white"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )
      })}

      <motion.div variants={itemVariants} className="card p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">About</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">App Version</span>
            <span className="font-medium text-foreground">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Last Updated</span>
            <span className="font-medium text-foreground">Today</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
