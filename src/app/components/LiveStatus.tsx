import { motion } from "motion/react";
import { Users, TrendingUp, Flame, Clock, Hourglass } from "lucide-react";

interface LiveStatusProps {
  currentPlayers: number;
  maxPlayers: number;
  slotsLeft: number;
  currentPrice: number;
  lastUpdate: number;
}

export function LiveStatus({
  currentPlayers,
  maxPlayers,
  slotsLeft,
  currentPrice,
}: LiveStatusProps) {
  const fillPercentage = (currentPlayers / maxPlayers) * 100;
  const isUrgent = slotsLeft <= 10;
  const isCritical = slotsLeft <= 5;

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-800 shadow-2xl h-fit"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <Hourglass className="text-blue-400" size={32} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          ⏳ LIVE STATUS
        </h2>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-base md:text-lg font-semibold text-slate-300">Registration Progress</span>
          <span className="text-xl md:text-2xl font-bold text-white">
            {currentPlayers}/{maxPlayers}
          </span>
        </div>
        <div className="relative h-10 md:h-12 bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fillPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-xl ${
              isCritical
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : isUrgent
                ? "bg-gradient-to-r from-orange-500 to-red-500"
                : "bg-gradient-to-r from-green-500 to-emerald-600"
            }`}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm md:text-base font-bold drop-shadow-lg">
            {Math.round(fillPercentage)}% Full
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Slots Left */}
        <motion.div
          animate={isUrgent ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className={`p-5 md:p-6 rounded-xl ${
            isCritical
              ? "bg-gradient-to-br from-red-500/20 to-red-600/20 border-2 border-red-500/50"
              : isUrgent
              ? "bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/50"
              : "bg-slate-800/50 border-2 border-slate-700"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {isCritical ? (
              <Flame className="text-red-400 animate-pulse" size={24} />
            ) : (
              <Users className="text-blue-400" size={24} />
            )}
            <span className="text-xs md:text-sm text-slate-400">Slots Left</span>
          </div>
          <div className="text-3xl md:text-5xl font-bold">{slotsLeft}</div>
          {isUrgent && (
            <motion.p
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xs text-red-400 mt-2 font-semibold uppercase tracking-wide"
            >
              🔥 ALMOST FULL!
            </motion.p>
          )}
        </motion.div>

        {/* Current Price */}
        <div className="p-5 md:p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border-2 border-yellow-500/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-yellow-400" size={24} />
            <span className="text-xs md:text-sm text-slate-400">Entry Fee</span>
          </div>
          <div className="text-3xl md:text-5xl font-bold text-yellow-400">₦{currentPrice.toLocaleString()}</div>
          <p className="text-xs text-slate-400 mt-2">Price increases with demand</p>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="bg-slate-950/50 rounded-xl p-5 md:p-6 border border-slate-800">
        <h3 className="font-semibold mb-4 text-sm md:text-base text-slate-300 flex items-center gap-2">
          💸 DYNAMIC PRICING
        </h3>
        <div className="space-y-3 text-sm md:text-base">
          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <span className={currentPlayers < 10 ? "text-green-400 font-semibold" : "text-slate-500"}>
              Early Bird (0-9)
            </span>
            <span className={currentPlayers < 10 ? "text-green-400 font-bold" : "text-slate-500"}>
              ₦1,500
            </span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <span
              className={
                currentPlayers >= 10 && currentPlayers < 22
                  ? "text-orange-400 font-semibold"
                  : "text-slate-500"
              }
            >
              Regular (10-21)
            </span>
            <span
              className={
                currentPlayers >= 10 && currentPlayers < 22
                  ? "text-orange-400 font-bold"
                  : "text-slate-500"
              }
            >
              ₦2,000
            </span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <span className={currentPlayers >= 22 ? "text-red-400 font-semibold" : "text-slate-500"}>
              Final Rush (22+)
            </span>
            <span className={currentPlayers >= 22 ? "text-red-400 font-bold" : "text-slate-500"}>
              ₦2,500
            </span>
          </div>
        </div>
      </div>

      {/* Live Indicator */}
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span>Live updates every 5 seconds</span>
      </div>
    </motion.div>
  );
}