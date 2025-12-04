"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import Link from "next/link"
import { FiX, FiSearch, FiBookOpen, FiZap, FiTag, FiClock } from "react-icons/fi"
import { HiOutlineDocumentText } from "react-icons/hi"

// Define the expected structure of a single search result
const NoteResult = ({ note }) => {
    // Determine color based on relevance score for visual feedback
    const score = note.relevance_score || 0;
    let relevanceColor = "text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-400";
    if (score >= 80) relevanceColor = "text-green-700 bg-green-100 dark:bg-green-900/50";
    else if (score >= 50) relevanceColor = "text-yellow-700 bg-yellow-100 dark:bg-yellow-900/50";

    // Format the date
    const date = note.created_at ? new Date(note.created_at).toLocaleDateString() : 'N/A';

    return (
        <Link href={`/notes/${note.id}`} passHref>
            <motion.div
                whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
                className="card p-4 transition-all duration-200 cursor-pointer border dark:border-slate-700 hover:border-primary/50"
            >
                <div className="flex items-start justify-between mb-2">
                    {/* Title */}
                    <h3 className="text-base font-semibold text-foreground truncate max-w-[80%] flex items-center gap-2">
                        <FiBookOpen className="w-4 h-4 text-primary shrink-0" />
                        {note.title || "Untitled Note"}
                    </h3>

                    {/* Relevance Score Badge */}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${relevanceColor}`}>
                        {score}% Match
                    </span>
                </div>

                {/* Subject & Summary */}
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                    <span className="font-medium text-foreground dark:text-white">Subject: {note.subject || 'General'}</span>
                    <br />
                    {note.summary || 'No summary available for this note.'}
                </p>

                {/* Footer details */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-3">
                    <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" /> {date}
                    </span>
                    {note.importance && (
                        <span className="flex items-center gap-1">
                            <FiZap className="w-3 h-3 text-red-500" /> Importance: {note.importance}
                        </span>
                    )}
                    {note.tags && note.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                            <FiTag className="w-3 h-3" /> {note.tags.slice(0, 2).join(', ')}{note.tags.length > 2 ? '...' : ''}
                        </span>
                    )}
                </div>
            </motion.div>
        </Link>
    );
};


export default function NoteSearchModal({ isOpen, onClose }) {
    // Component State
    const [query, setQuery] = useState("")
    const [results, setResults] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const [error, setError] = useState(null)

    // The base URL for the search API endpoint
    const SEARCH_URL = `${process.env.NEXT_PUBLIC_SERVER_API_URL}/notes/search-notes/`;

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setQuery("")
            setResults([])
            setHasSearched(false)
            setError(null)
        }
    }, [isOpen])

    // Fetch search results from the API
    const handleSearch = async (e) => {
        e.preventDefault()

        const trimmedQuery = query.trim();
        if (!trimmedQuery) {
            setResults([]);
            setHasSearched(true);
            return;
        }

        setIsLoading(true)
        setHasSearched(true)
        setError(null)

        try {
            const token = localStorage.getItem("access")

            // Send the query as a URL parameter
            const res = await axios.post(
                SEARCH_URL,
                { query: trimmedQuery },          // body
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );


            // The response structure matches the example: { query, count, results: [...] }
            setResults(Array.isArray(res.data.results) ? res.data.results : [])

        } catch (err) {
            console.error("Error during note search:", err)
            setError("Failed to fetch search results. Please try again.")
            setResults([])
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-[4px]"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }} 
                        className="relative max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 h-[90vh] flex flex-col sm:w-full sm:h-auto sm:max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4 sm:mb-6 shrink-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                                <HiOutlineDocumentText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> Search Notes
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-slate-500 hover:text-red-500 transition p-1"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="mb-4 shrink-0">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search by keyword, topic, or content summary..."
                                    className="w-full pl-10 pr-4 py-2 placeholder:text-[14px] border rounded-full bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition"
                                    disabled={isLoading}
                                />
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`absolute right-1 top-1/2 transform -translate-y-1/2 px-4 py-1.5 rounded-full font-medium text-sm transition ${isLoading || !query.trim()
                                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                        : "bg-primary text-white hover:bg-primary/90"
                                        }`}
                                    disabled={isLoading || !query.trim()}
                                >
                                    Search
                                </motion.button>
                            </div>
                        </form>

                        {/* Results / Status Area */}
                        <div className="flex-grow overflow-y-auto lg:min-h-[300px] space-y-3 pt-2">
                            {isLoading ? (
                                <div className="text-center p-8 text-primary">
                                    <FiSearch className="w-8 h-8 animate-pulse mx-auto mb-2" />
                                    <p>Searching for notes...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center p-8 text-red-500 border border-red-300 bg-red-50 rounded-lg">
                                    <p className="font-semibold">Error:</p>
                                    <p>{error}</p>
                                </div>
                            ) : hasSearched && results.length === 0 ? (
                                <div className="text-center p-8 text-slate-500 dark:text-slate-400 border border-dashed rounded-lg dark:border-slate-700">
                                    <p className="text-lg font-semibold mb-2">No Results Found </p>
                                    <p>Try refining your search query or check your connection.</p>
                                </div>
                            ) : results.length > 0 ? (
                                // Display Results
                                <>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium pb-2">
                                        Found {results.length} relevant note(s):
                                    </p>
                                    {results.map((note) => (
                                        <NoteResult key={note.id} note={note} />
                                    ))}
                                </>
                            ) : (
                                <div className="text-center p-8 text-slate-500 dark:text-slate-400">
                                    <p className="text-lg font-semibold mb-2">Ready to Search </p>
                                    <p className="text-[13px]">Enter a keyword above to find your notes by relevance score.</p>
                                </div>
                            )}
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}