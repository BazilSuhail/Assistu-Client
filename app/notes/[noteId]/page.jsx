"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { motion } from "framer-motion"
import Loader from "@/components/shared/loader"
import {
  HiArrowLeft,
  HiTrash,
  HiDownload,
  HiDocumentText,
  HiLightBulb,
  HiTag,
  HiCollection,
  HiKey,
  HiViewGrid,
  HiCalendar,
  HiClock,
  HiStar,
  HiDotsVertical
} from "react-icons/hi"

export default function NoteDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [note, setNote] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showFullTranscript, setShowFullTranscript] = useState(false)

  const noteId = params.noteId

  async function loadNote() {
    try {
      const token = localStorage.getItem("access")
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/notes/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setNote(res.data)
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this note? This action cannot be undone.")) return

    if (isDeleting) return
    setIsDeleting(true)

    try {
      const token = localStorage.getItem("access")
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/notes/delete/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      router.push("/notes")
    } catch (err) {
      console.log(err)
    } finally {
      setIsDeleting(false)
    }
  }

  function handleExport() {
    if (!note) return

    // Create a clean JSON object with all note data
    const exportData = {
      id: note.id,
      title: note.title,
      subject: note.subject,
      importance: note.importance,
      summary: note.summary,
      explanation: note.explanation,
      categories: note.categories,
      keywords: note.keywords,
      tags: note.tags,
      transcript: note.transcript,
      created_at: note.created_at,
      updated_at: note.updated_at
    }

    // Convert to formatted JSON string
    const jsonString = JSON.stringify(exportData, null, 2)

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' })

    // Create a download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const sanitizedTitle = note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    link.download = `note_${sanitizedTitle}_${timestamp}.json`

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  useEffect(() => {
    loadNote()
  }, [noteId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader />
      </div>
    )
  }

  if (!note) {
    return <div className="p-6 text-center">Note not found</div>
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getImportanceColor = (importance) => {
    switch (importance?.toLowerCase()) {
      case 'high': return 'bg-black text-white'
      case 'medium': return 'bg-gray-400 text-white'
      case 'low': return 'bg-gray-200 text-black'
      default: return 'bg-gray-300 text-black'
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      //  Adjusted container padding for mobile
      className="min-h-screen bg-white p-4 md:p-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="max-w-7xl mx-auto mb-4 md:mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            //  Smaller button size on mobile
            className="p-1 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <HiArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-black" />
          </button>

          {/* Action Menu (More Options) */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              //  Smaller button size on mobile
              className="p-1 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <HiDotsVertical className="w-5 h-5 md:w-6 md:h-6 text-black" />
            </button>

            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 mt-2 w-40 md:w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10"
              >
                <button
                  onClick={() => { handleDelete(); setMenuOpen(false); }}
                  //  Reduced padding and text size
                  className="w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2 md:gap-3 transition-colors"
                >
                  <HiTrash className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm font-medium">Delete Note</span>
                </button>
                <button
                  onClick={() => { /* Export logic */; setMenuOpen(false); }}
                  //  Reduced padding and text size
                  className="w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2 md:gap-3 border-t border-gray-100 transition-colors"
                >
                  <HiDownload className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm font-medium">Export</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Grid Layout - Stacks on Mobile */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
        {/* Left Column - Main Content (Stacks first on mobile) */}
        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-4 md:space-y-6">
          {/* Title Section */}
          <div>
            <div className="flex items-start gap-3 mb-4">
              {/*  Smaller icon container and icon on mobile */}
              <div className="p-2 bg-black rounded-xl md:rounded-2xl flex-shrink-0 mt-1">
                <HiDocumentText className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="flex-1">
                {/*  Smaller title size on mobile */}
                <h1 className="text-3xl md:text-4xl font-bold text-black mb-1">{note.title}</h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                  {/*  Smaller tags/pills */}
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-black border border-gray-200">
                    {note.subject}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getImportanceColor(note.importance)}`}>
                    {note.importance || "Medium"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          {/*  Reduced padding and text size */}
          <div className="bg-white border-2 border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              {/*  Smaller icon container and icon */}
              <div className="p-1.5 bg-gray-100 rounded-lg md:rounded-xl">
                <HiLightBulb className="w-5 h-5 md:w-6 md:h-6 text-black" />
              </div>
              {/*  Smaller header size */}
              <h2 className="text-lg md:text-xl font-bold text-black">Summary</h2>
            </div>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">{note.summary}</p>
          </div>

          {/* Explanation Card */}
          {note.explanation?.length > 0 && (
            //  Reduced padding and text size
            <div className="bg-white border-2 border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                {/*  Smaller icon container and icon */}
                <div className="p-1.5 bg-gray-100 rounded-lg md:rounded-xl">
                  <HiViewGrid className="w-5 h-5 md:w-6 md:h-6 text-black" />
                </div>
                {/*  Smaller header size */}
                <h2 className="text-lg md:text-xl font-bold text-black">Key Points</h2>
              </div>
              <ul className="space-y-3">
                {note.explanation.map((item, i) => (
                  //  Reduced item padding
                  <li key={i} className="flex items-start gap-3 pb-2 border-b border-gray-100 last:border-0">
                    {/*  Smaller number circle */}
                    <span className="flex-shrink-0 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    {/*  Smaller text size */}
                    <span className="text-sm md:text-base text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Transcript Card with Gradient Fade */}
          {/*  Reduced padding and text size */}
          <div className="bg-white border-2 border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {/*  Smaller icon container and icon */}
                <div className="p-1.5 bg-gray-100 rounded-lg md:rounded-xl">
                  <HiDocumentText className="w-5 h-5 md:w-6 md:h-6 text-black" />
                </div>
                {/*  Smaller header size */}
                <h2 className="text-lg md:text-xl font-bold text-black">Transcript</h2>
              </div>
              {/*  Smaller button size */}
              <button
                onClick={() => setShowFullTranscript(!showFullTranscript)}
                className="text-sm font-medium text-black hover:underline"
              >
                {showFullTranscript ? "Show Less" : "Show More"}
              </button>
            </div>
            <div className="relative">
              {/*  Reduced max height on mobile */}
              <div className={`overflow-hidden ${!showFullTranscript ? 'max-h-36 md:max-h-48' : 'max-h-none'} transition-all`}>
                {/*  Smaller transcript text size */}
                <p className="text-sm md:text-base text-gray-700 whitespace-pre-line leading-relaxed">
                  {note.transcript}
                </p>
              </div>
              {!showFullTranscript && (
                <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Metadata Sidebar (Stacks second on mobile) */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4 md:space-y-6">


          {/* Categories */}
          {note.categories?.length > 0 && (
            //  Reduced padding
            <div className="bg-white border-2 border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                {/*  Smaller icon container and icon */}
                <div className="p-1.5 bg-gray-100 rounded-lg md:rounded-xl">
                  <HiCollection className="w-4 h-4 md:w-5 md:h-5 text-black" />
                </div>
                {/*  Smaller header size */}
                <h3 className="font-bold text-base md:text-black">Categories</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {/*  Smaller pill size */}
                {note.categories.map((category, i) => (
                  <span key={i} className="px-2.5 py-1 bg-gray-100 text-black rounded-full text-xs font-medium border border-gray-200">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {note.keywords?.length > 0 && (
            //  Reduced padding
            <div className="bg-white border-2 border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                {/*  Smaller icon container and icon */}
                <div className="p-1.5 bg-gray-100 rounded-lg md:rounded-xl">
                  <HiKey className="w-4 h-4 md:w-5 md:h-5 text-black" />
                </div>
                {/*  Smaller header size */}
                <h3 className="font-bold text-base text-black">Keywords</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {/*  Smaller pill size */}
                {note.keywords.map((keyword, i) => (
                  <span key={i} className="px-2.5 py-1 bg-black text-white rounded-full text-xs font-medium">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {note.tags?.length > 0 && (
            //  Reduced padding
            <div className="bg-white border-2 border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                {/*  Smaller icon container and icon */}
                <div className="p-1.5 bg-gray-100 rounded-lg md:rounded-xl">
                  <HiTag className="w-4 h-4 md:w-5 md:h-5 text-black" />
                </div>
                {/*  Smaller header size */}
                <h3 className="font-bold text-base text-black">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {/*  Smaller pill size */}
                {note.tags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 bg-gray-100 text-black rounded-full text-xs font-medium border border-gray-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {/*  Reduced padding and text size */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleExport}
                className="w-full px-3 py-2.5 bg-black text-white rounded-lg md:rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <HiDownload className="w-4 h-4 md:w-5 md:h-5" />
                Export Note
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 text-black rounded-lg md:rounded-xl font-medium hover:border-red-300 hover:text-red-600 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <HiTrash className="w-4 h-4 md:w-5 md:h-5" />
                {isDeleting ? "Deleting..." : "Delete Note"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}