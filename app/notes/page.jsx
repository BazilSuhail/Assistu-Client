"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Loader from "@/components/shared/loader"
import Link from "next/link"
import { HiPlus, HiMicrophone, HiDocumentText, HiStar, HiCollection, HiTrendingUp, HiLightningBolt } from "react-icons/hi"
import NewNoteModal from "@/components/notes/CreateNote"
import Image from "next/image"
import NoteSearchModal from "@/components/notes/NoteSearchModal"
import { FiSearch } from "react-icons/fi"

export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  // Note: 'view' state is present but the list view implementation is commented out/not fully utilized.
  const [view, setView] = useState("grid")
  const [filter, setFilter] = useState("All")
  const [filters, setFilters] = useState(["All"])

  useEffect(() => {
    async function fetchNotes() {
      try {
        const token = localStorage.getItem("access")
        if (!token) {
          setIsLoading(false)
          return
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/notes/all/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await res.json()

        if (data.notes) {
          setNotes(data.notes)
          const subjects = [...new Set(data.notes.map(n => n.subject))].filter(s => s) // filter out empty subjects
          setFilters(["All", ...subjects])
        }
      } catch (e) {
        console.log("Fetch error", e)
      }

      setIsLoading(false)
    }

    fetchNotes()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader />
      </div>
    )
  }

  const filteredNotes = filter === "All" ? notes : notes.filter(n => n.subject === filter)

  const formatDate = d => {
    const date = new Date(d)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  // Calculate stats
  const totalNotes = notes.length
  const uniqueSubjects = [...new Set(notes.map(n => n.subject).filter(s => s))].length
  const recentNotes = notes.filter(n => {
    const noteDate = new Date(n.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return noteDate >= weekAgo
  }).length

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
      //  Smaller padding on mobile (p-4)
      className="min-h-screen bg-white p-4 md:p-8"
    >
      <NewNoteModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onUploaded={() => {
          window.location.reload()
        }}
      />

      <NoteSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      {/* Hero Section */}
      <motion.div variants={itemVariants} className="max-w-7xl mx-auto mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
          <div>
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3"> 
              <div className="p-2 bg-black rounded-xl md:rounded-2xl">
                <HiDocumentText className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div> 
              <h1 className="text-3xl md:text-4xl font-bold text-black">Notes</h1>
            </div> 
            <p className="text-sm md:text-md text-gray-500">Capture and organize your important thoughts</p>
          </div>
<div className="flex space-x-2"> 
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSearchModal(true)}
            className="p-3 bg-black text-white rounded-full font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow text-sm md:text-base"
          >
            <FiSearch className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-black text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow text-sm md:text-base"
          >
            <HiPlus className="w-4 h-4 md:w-5 md:h-5" />
            New Note
          </motion.button>
</div>
        </div>

        {/* Elegant Horizontal Notes Stats Cards */}
        {notes.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12"
          >
            <div className="bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center shadow-sm hover:shadow-md transition duration-300">
              {/*  Reduced padding and size */}
              <div className="p-2 md:p-3 bg-white rounded-lg md:rounded-xl border border-gray-200 mr-3 md:mr-4 flex-shrink-0">
                <HiDocumentText className="w-5 h-5 md:w-6 md:h-6 text-black" />
              </div>

              {/* Text Content (Right side) */}
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  {/*  Reduced font size for mobile stat value */}
                  <p className="text-xl md:text-2xl font-bold text-black">{totalNotes}</p>
                  <HiTrendingUp className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                </div>
                <p className="text-xs md:text-sm text-gray-500 font-medium mt-0.5">Total Notes</p>
              </div>
            </div>

            {/* Stat Card 2: Subjects (Horizontal Layout) */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center shadow-sm hover:shadow-md transition duration-300">
              {/*  Reduced padding and size */}
              <div className="p-2 md:p-3 bg-white rounded-lg md:rounded-xl border border-gray-200 mr-3 md:mr-4 flex-shrink-0">
                <HiCollection className="w-5 h-5 md:w-6 md:h-6 text-black" />
              </div>

              {/* Text Content (Right side) */}
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  {/*  Reduced font size for mobile stat value */}
                  <p className="text-xl md:text-2xl font-bold text-black">{uniqueSubjects}</p>
                  <HiStar className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                </div>
                <p className="text-xs md:text-sm text-gray-500 font-medium mt-0.5">Subjects</p>
              </div>
            </div>

            {/* Stat Card 3: This Week (Horizontal Layout) */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center shadow-sm hover:shadow-md transition duration-300">
              {/*  Reduced padding and size */}
              <div className="p-2 md:p-3 bg-white rounded-lg md:rounded-xl border border-gray-200 mr-3 md:mr-4 flex-shrink-0">
                <HiLightningBolt className="w-5 h-5 md:w-6 md:h-6 text-black" />
              </div>

              {/* Text Content (Right side) */}
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  {/*  Reduced font size for mobile stat value */}
                  <p className="text-xl md:text-2xl font-bold text-black">{recentNotes}</p>
                  <HiMicrophone className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                </div>
                <p className="text-xs md:text-sm text-gray-500 font-medium mt-0.5">This Week</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Separator */}
      <div className="w-full h-[3px] bg-gray-200 mb-6 md:mb-8"></div>

      {/* Main Content */}
      <motion.div variants={itemVariants} className="max-w-7xl mx-auto">
        {filteredNotes.length > 0 ? (
          <div>
            {/* Filter Pills */}
            <div className="mb-6 md:mb-8">
              {/*  Smaller header text */}
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Filter by Subject</h2>
              {/* Mobile: horizontal scrollable container */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {filters.map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    //  Reduced padding and font size for pills on mobile
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${filter === f
                      ? "bg-black text-white shadow-lg"
                      : "bg-gray-100 text-black hover:bg-gray-200 border border-gray-200"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Grid Title */}
            {/*  Reduced grid title size */}
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4 md:mb-6">
              {filter === "All" ? "All Notes" : `${filter} Notes`}
            </h2>

            {/* Notes Grid */}
            <motion.div
              variants={itemVariants}
              className={
                //  Always 1 column on mobile, 2 on md, 3 on lg
                view === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                  : "space-y-3" // Adjusted list view gap for mobile
              }
            >
              {filteredNotes.map(note => (
                <Link key={note.id} href={`/notes/${note.id}`} passHref>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    //  Reduced padding on note card
                    className={`bg-white border-2 border-gray-200 hover:border-black rounded-xl md:rounded-2xl p-4 md:p-6 cursor-pointer transition-all group ${view === "grid" ? "h-full" : ""
                      }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      {/*  Smaller icon container */}
                      <div className="p-1.5 md:p-2 bg-gray-100 group-hover:bg-black rounded-lg md:rounded-xl transition-colors">
                        <HiMicrophone className="w-4 h-4 md:w-5 md:h-5 text-black group-hover:text-white transition-colors" />
                      </div>
                      {/*  Smaller importance tag */}
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getImportanceColor(note.importance)}`}>
                        {note.importance || "Medium"}
                      </span>
                    </div>

                    {/* Title */}
                    {/*  Smaller title size */}
                    <h3 className="font-bold text-base md:text-lg text-black mb-3 line-clamp-2">
                      {note.title}
                    </h3>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      {/*  Smaller subject tag */}
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-black border border-gray-200">
                        {note.subject}
                      </span>
                      {/*  Smaller date text */}
                      <span className="text-xs text-gray-500 font-medium">
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 md:py-16">
            <div className="max-w-xs md:max-w-md text-center">
              <Image
                src="/todo/noNotes.png"
                alt="No notes available"
                width={300} // Reduced size for mobile context
                height={300}
                className="w-full mx-auto max-w-[200px] sm:max-w-xs object-contain mb-6 md:mb-8 opacity-70"
              />
              {/*  Adjusted title/description size */}
              <h3 className="text-xl md:text-2xl font-bold text-black mb-2 md:mb-3">No Notes Yet</h3>
              <p className="text-sm md:text-base text-gray-500 mb-5 md:mb-6">Start capturing your ideas and thoughts by creating your first note</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                //  Adjusted button size
                className="px-5 py-2.5 bg-black text-white rounded-xl font-semibold flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-shadow text-sm md:text-base"
              >
                <HiPlus className="w-4 h-4 md:w-5 md:h-5" />
                Create Your First Note
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}