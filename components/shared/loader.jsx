// "use client"

// import { motion } from "framer-motion"

// export default function Loader() {
//   return (
//     <div className="flex flex-col items-center justify-center gap-4">
//       <motion.div
//         animate={{ rotate: 360 }}
//         transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
//         className="w-12 h-12 border-4 border-border dark:border-slate-700 border-t-primary rounded-full"
//       />
//       <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
//     </div>
//   )
// }


"use client"

import { motion } from "framer-motion"

// Animation config extracted so it's not recreated on every render
const spinConfig = {
  animate: { rotate: 360 },
  transition: { duration: 1.5, repeat: Infinity, ease: "linear" },
}

export default function Loader() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <motion.div
        {...spinConfig}
        className="w-12 h-12 border-4 border-border dark:border-slate-700 border-t-primary rounded-full"
      />
      <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
    </div>
  )
}
