// "use client"

// import { useState, useEffect } from "react"
// import { useParams, useRouter } from "next/navigation"
// import { motion } from "framer-motion"
// import Loader from "@/components/shared/loader"
// import { HiArrowLeft, HiPencil, HiTrash, HiPlus } from "react-icons/hi"

// const DUMMY_PLANS_DETAIL = {
//   1: {
//     id: 1,
//     title: "Math - Calculus Mastery",
//     description: "Complete mastery of calculus concepts including integration and differentiation",
//     startDate: "2024-01-15",
//     endDate: "2024-02-15",
//     subjects: ["Integration", "Differentiation", "Limits"],
//     milestones: [
//       { name: "Week 1: Foundations", start: "2024-01-15", end: "2024-01-21", completed: true },
//       { name: "Week 2: Differentiation", start: "2024-01-22", end: "2024-01-28", completed: true },
//       { name: "Week 3: Integration", start: "2024-01-29", end: "2024-02-04", completed: false },
//       { name: "Week 4: Applications", start: "2024-02-05", end: "2024-02-15", completed: false },
//     ],
//   },
// }

// export default function PlanDetailPage() {
//   const params = useParams()
//   const router = useRouter()
//   const [isLoading, setIsLoading] = useState(true)
//   const [plan, setPlan] = useState(null)

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setPlan(DUMMY_PLANS_DETAIL[params.planId])
//       setIsLoading(false)
//     }, 3000)
//     return () => clearTimeout(timer)
//   }, [params.planId])

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader />
//       </div>
//     )
//   }

//   if (!plan) {
//     return <div className="p-6 text-center">Plan not found</div>
//   }

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
//   }

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0 },
//   }

//   return (
//     <motion.div
//       variants={containerVariants}
//       initial="hidden"
//       animate="visible"
//       className="p-6 md:p-8 max-w-4xl mx-auto"
//     >
//       <motion.div variants={itemVariants} className="flex items-center gap-2 mb-8">
//         <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
//           <HiArrowLeft className="w-5 h-5" />
//         </button>
//         <h1 className="text-3xl font-bold text-foreground">Study Plan Details</h1>
//       </motion.div>

//       <motion.div variants={itemVariants} className="card p-8 mb-8">
//         <div className="flex items-start justify-between mb-6">
//           <div>
//             <h2 className="text-2xl font-bold text-foreground">{plan.title}</h2>
//             <p className="text-slate-600 dark:text-slate-400 mt-2">{plan.description}</p>
//           </div>
//           <div className="flex gap-2">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
//             >
//               <HiPencil className="w-5 h-5 text-blue-600" />
//             </motion.button>
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
//             >
//               <HiTrash className="w-5 h-5 text-red-600" />
//             </motion.button>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-4 mb-6">
//           <div>
//             <label className="text-sm text-slate-500 dark:text-slate-400">Start Date</label>
//             <p className="font-medium text-foreground">{plan.startDate}</p>
//           </div>
//           <div>
//             <label className="text-sm text-slate-500 dark:text-slate-400">End Date</label>
//             <p className="font-medium text-foreground">{plan.endDate}</p>
//           </div>
//         </div>

//         <div>
//           <label className="text-sm text-slate-500 dark:text-slate-400 block mb-2">Subjects</label>
//           <div className="flex flex-wrap gap-2">
//             {plan.subjects.map((subject, idx) => (
//               <span
//                 key={idx}
//                 className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium"
//               >
//                 {subject}
//               </span>
//             ))}
//           </div>
//         </div>
//       </motion.div>

//       <motion.div variants={itemVariants} className="card p-8">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-lg font-bold text-foreground">Milestones</h3>
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
//           >
//             <HiPlus className="w-5 h-5" />
//           </motion.button>
//         </div>

//         <div className="space-y-3">
//           {plan.milestones.map((milestone, idx) => (
//             <motion.div
//               key={idx}
//               whileHover={{ x: 4 }}
//               className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-border dark:border-slate-700"
//             >
//               <div className="flex items-start gap-3">
//                 <input
//                   type="checkbox"
//                   defaultChecked={milestone.completed}
//                   className="mt-1 w-5 h-5 rounded border-border cursor-pointer"
//                 />
//                 <div className="flex-1">
//                   <p
//                     className={`font-medium ${milestone.completed ? "line-through text-slate-400" : "text-foreground"}`}
//                   >
//                     {milestone.name}
//                   </p>
//                   <p className="text-sm text-slate-500 dark:text-slate-400">
//                     {milestone.start} to {milestone.end}
//                   </p>
//                 </div>
//                 {milestone.completed && (
//                   <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
//                     Done
//                   </span>
//                 )}
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </motion.div>
//     </motion.div>
//   )
// }


"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Loader from "@/components/shared/loader"
import { HiArrowLeft, HiPencil, HiTrash, HiPlus } from "react-icons/hi"

const DUMMY_PLANS_DETAIL = {
  1: {
    id: 1,
    title: "Math - Calculus Mastery",
    description: "Complete mastery of calculus concepts including integration and differentiation",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    subjects: ["Integration", "Differentiation", "Limits"],
    milestones: [
      { name: "Week 1: Foundations", start: "2024-01-15", end: "2024-01-21", completed: true },
      { name: "Week 2: Differentiation", start: "2024-01-22", end: "2024-01-28", completed: true },
      { name: "Week 3: Integration", start: "2024-01-29", end: "2024-02-04", completed: false },
      { name: "Week 4: Applications", start: "2024-02-05", end: "2024-02-15", completed: false },
    ],
  },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function PlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [plan, setPlan] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setPlan(DUMMY_PLANS_DETAIL[params.planId])
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [params.planId])

  const milestones = useMemo(() => plan?.milestones || [], [plan])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  if (!plan) {
    return <div className="p-6 text-center">Plan not found</div>
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 md:p-8 max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 mb-8">
        <IconButton onClick={() => router.back()}>
          <HiArrowLeft className="w-5 h-5" />
        </IconButton>
        <h1 className="text-3xl font-bold text-foreground">Study Plan Details</h1>
      </motion.div>

      {/* Plan Info Card */}
      <motion.div variants={itemVariants} className="card p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <PlanTitle title={plan.title} description={plan.description} />

          <div className="flex gap-2">
            <IconButton>
              <HiPencil className="w-5 h-5 text-blue-600" />
            </IconButton>
            <IconButton>
              <HiTrash className="w-5 h-5 text-red-600" />
            </IconButton>
          </div>
        </div>

        <DateGrid
          start={plan.startDate}
          end={plan.endDate}
        />

        <SubjectTags subjects={plan.subjects} />
      </motion.div>

      {/* Milestones */}
      <motion.div variants={itemVariants} className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground">Milestones</h3>
          <IconButton>
            <HiPlus className="w-5 h-5" />
          </IconButton>
        </div>

        <div className="space-y-3">
          {milestones.map((m, idx) => (
            <MilestoneItem key={idx} milestone={m} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ----------------------------- Components ----------------------------- */

function IconButton({ children, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
      {...props}
    >
      {children}
    </motion.button>
  )
}

function PlanTitle({ title, description }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <p className="text-slate-600 dark:text-slate-400 mt-2">{description}</p>
    </div>
  )
}

function DateGrid({ start, end }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <DateItem label="Start Date" value={start} />
      <DateItem label="End Date" value={end} />
    </div>
  )
}

function DateItem({ label, value }) {
  return (
    <div>
      <label className="text-sm text-slate-500 dark:text-slate-400">{label}</label>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  )
}

function SubjectTags({ subjects }) {
  return (
    <div>
      <label className="text-sm text-slate-500 dark:text-slate-400 block mb-2">Subjects</label>
      <div className="flex flex-wrap gap-2">
        {subjects.map((subject, idx) => (
          <span
            key={idx}
            className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium"
          >
            {subject}
          </span>
        ))}
      </div>
    </div>
  )
}

function MilestoneItem({ milestone }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-border dark:border-slate-700"
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          defaultChecked={milestone.completed}
          className="mt-1 w-5 h-5 rounded border-border cursor-pointer"
        />

        <div className="flex-1">
          <p
            className={`font-medium ${
              milestone.completed ? "line-through text-slate-400" : "text-foreground"
            }`}
          >
            {milestone.name}
          </p>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {milestone.start} to {milestone.end}
          </p>
        </div>

        {milestone.completed && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            Done
          </span>
        )}
      </div>
    </motion.div>
  )
}
