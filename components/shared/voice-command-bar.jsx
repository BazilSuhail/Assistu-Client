"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { HiMicrophone, HiXCircle } from "react-icons/hi"

export default function VoiceCommandBar() {
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [response, setResponse] = useState("")

  const mockResponses = {
    "create task": "Creating a new task for you...",
    "show today": "Showing tasks for today",
    "show overdue": "Displaying overdue tasks",
    "create note": "Starting a new voice note...",
    "show calendar": "Opening your calendar",
    "create plan": "Starting a new study plan",
    help: 'I can help you with tasks, notes, calendar, and study plans. Try saying "Create a task" or "Show my calendar"',
  }

  const handleVoiceCommand = () => {
    setIsListening(true)
    setTimeout(() => {
      setIsListening(false)
      const lowerInput = input.toLowerCase()
      let found = false
      for (const [key, value] of Object.entries(mockResponses)) {
        if (lowerInput.includes(key)) {
          setResponse(value)
          found = true
          break
        }
      }
      if (!found) {
        setResponse('Command not recognized. Try "help" for available commands.')
      }
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleVoiceCommand()}
          placeholder="Try: Create task, Show calendar..."
          className="flex-1 px-4 py-2 rounded-lg bg-input border border-border dark:border-slate-700 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleVoiceCommand}
          className={`p-2 rounded-lg transition-colors ${
            isListening ? "bg-red-500 text-white" : "bg-primary text-white hover:opacity-90"
          }`}
        >
          <HiMicrophone className="w-5 h-5" />
        </motion.button>
        {response && (
          <button
            onClick={() => {
              setResponse("")
              setInput("")
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <HiXCircle className="w-5 h-5" />
          </button>
        )}
      </div>
      {response && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-primary rounded-lg text-sm text-foreground"
        >
          {response}
        </motion.div>
      )}
    </div>
  )
}
