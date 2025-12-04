"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import axios from "axios"
// Using HiDocumentText (solid) for the file preview icon
import { HiDocumentText, HiCloudUpload, HiX } from "react-icons/hi" 

export default function NewNoteModal({ open, onClose, onUploaded }) {
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false) // State for drag-and-drop UI

  if (!open) return null

  // --- Handlers for Drag-and-Drop and File Selection ---
  const handleFileChange = (selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
    } else {
      setFile(null)
      alert("Please upload a PDF file.")
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    handleFileChange(droppedFile)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }
  // ---------------------------------

  const handleSubmit = async e => {
    e.preventDefault()
    if (!file) return 

    try {
      setLoading(true)
      const token = localStorage.getItem("access")
      const formData = new FormData()

      formData.append("file", file)
      formData.append("title", title || "Untitled Note")
      formData.append("subject", subject || "General")

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/notes/create/pdf/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      )

      setLoading(false)

      if (res.data?.id) {
        onUploaded()
        onClose()
      }
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  return (
    <div 
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] backdrop-blur-sm p-4 sm:p-6" // Added small padding around the viewport
        onClick={(e) => e.target === e.currentTarget && onClose()} 
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        // 🔑 MODAL SIZE ADJUSTMENTS FOR MOBILE:
        // Use w-full for full width on mobile, max-w-lg for desktop, and smaller vertical padding
        className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700"
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Upload New Note</h2>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                aria-label="Close modal"
            >
                <HiX className="w-6 h-6" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          
            {/* Title Input */}
            <div>
                <label htmlFor="note-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                    id="note-title"
                    // Decreased vertical padding slightly for mobile input height
                    className="w-full px-3 py-2 sm:px-4 border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-1 focus:ring-black focus:border-black transition duration-150"
                    placeholder="e.g., Quantum Physics Summary"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
            </div>

            {/* Subject Input */}
            <div>
                <label htmlFor="note-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <input
                    id="note-subject"
                    // Decreased vertical padding slightly for mobile input height
                    className="w-full px-3 py-2 sm:px-4 border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-1 focus:ring-black focus:border-black transition duration-150"
                    placeholder="e.g., Science, Math, History"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                />
            </div>

            {/* File Drop Area */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload PDF Document</label>
                
                {file ? (
                    // Display selected file info (using medium gray/white for confirmation)
                    // Adjusted padding to 'p-3' for mobile
                    <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                            <HiDocumentText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 dark:text-gray-200 mr-3" />
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</span>
                        </div>
                        <button type="button" onClick={() => setFile(null)} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                            <HiX className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    // Drag and Drop Zone
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        // Adjusted vertical padding to 'p-5' for mobile
                        className={`flex flex-col items-center justify-center p-5 sm:p-6 border-2 border-dashed rounded-lg cursor-pointer transition duration-300 
                            ${isDragOver 
                                ? "border-black dark:border-white bg-gray-100 dark:bg-gray-700" 
                                : "border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                            }`}
                        onClick={() => document.getElementById('file-upload-input').click()}
                    >
                        <HiCloudUpload 
                            className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 ${isDragOver ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"}`} 
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium text-center">
                            <span className="font-semibold text-black dark:text-white">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF only</p>
                        
                        {/* Hidden file input */}
                        <input
                            id="file-upload-input"
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={e => handleFileChange(e.target.files?.[0] || null)}
                        />
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading || !file}
                    // Reduced vertical padding of button to 'py-2.5' for mobile
                    className={`w-full py-2.5 sm:py-3 rounded-xl font-semibold transition duration-200 shadow-md ${
                        loading || !file
                            ? "bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed" // Disabled state
                            : "bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black" // Active state
                    }`}
                >
                    {loading ? "Processing and Uploading..." : "Create Note"}
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    // Reduced vertical padding of button to 'py-2.5' for mobile
                    className="w-full mt-3 py-2.5 sm:py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-150"
                >
                    Cancel
                </button>
            </div>
        </form>
      </motion.div>
    </div>
  )
}