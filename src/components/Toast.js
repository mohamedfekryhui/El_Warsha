import { motion, AnimatePresence } from "framer-motion";

export default function Toast({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9, x: "-50%" }}
          animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
          exit={{ opacity: 0, y: 20, scale: 0.9, x: "-50%" }}
          className="fixed bottom-8 left-1/2 transform bg-slate-900/95 text-white dark:bg-white dark:text-slate-900 px-6 py-3 rounded-2xl shadow-2xl font-bold text-xs z-[100] flex items-center gap-2 border border-slate-800 dark:border-slate-100"
        >
          <span>📋</span>
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
