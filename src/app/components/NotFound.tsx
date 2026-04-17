import { motion } from "motion/react";
import { Home, AlertCircle } from "lucide-react";
import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-2xl"
      >
        <div className="mb-6">
          <AlertCircle className="mx-auto text-red-400" size={80} />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-600 bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 mb-8">
          Page not found. This tournament slot doesn't exist!
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-500/50"
        >
          <Home size={24} />
          Back to Tournament
        </Link>
      </motion.div>
    </div>
  );
}
