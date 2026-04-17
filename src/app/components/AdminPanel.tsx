import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  UserPlus,
  Trash2,
  CheckCircle,
  Clock,
  RefreshCw,
  Lock,
  Unlock,
  Gamepad2,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

interface Registration {
  id: string;
  playerName: string;
  phoneNumber: string;
  paymentStatus: "pending" | "confirmed";
  createdAt: number;
  expiresAt: number;
}

interface TournamentData {
  id: string;
  name: string;
  maxPlayers: number;
  currentPlayers: number;
  status: "open" | "full" | "closed";
  registrations: Registration[];
}

const STORAGE_KEY = "tournament_data";

export function AdminPanel() {
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<TournamentData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      id: "1",
      name: "FC 26 TOURNAMENT",
      maxPlayers: 32,
      currentPlayers: 0,
      status: "open",
      registrations: [],
    };
  });

  const [newMaxPlayers, setNewMaxPlayers] = useState(tournament.maxPlayers);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerPhone, setNewPlayerPhone] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tournament));
  }, [tournament]);

  const handleAddPlayer = () => {
    if (!newPlayerName.trim() || !newPlayerPhone.trim()) {
      toast.error("Please enter both name and phone number");
      return;
    }

    const now = Date.now();
    const newReg: Registration = {
      id: `admin-${Date.now()}`,
      playerName: newPlayerName,
      phoneNumber: newPlayerPhone,
      paymentStatus: "confirmed",
      createdAt: now,
      expiresAt: now + 10 * 60 * 1000,
    };

    const newCurrentPlayers = tournament.currentPlayers + 1;
    setTournament({
      ...tournament,
      registrations: [...tournament.registrations, newReg],
      currentPlayers: newCurrentPlayers,
      status: newCurrentPlayers >= tournament.maxPlayers ? "full" : tournament.status,
    });

    setNewPlayerName("");
    setNewPlayerPhone("");
    toast.success("Player added successfully!");
  };

  const handleRemovePlayer = (id: string) => {
    const updatedRegistrations = tournament.registrations.filter((reg) => reg.id !== id);
    const confirmedCount = updatedRegistrations.filter((r) => r.paymentStatus === "confirmed").length;
    
    setTournament({
      ...tournament,
      registrations: updatedRegistrations,
      currentPlayers: confirmedCount,
      status: confirmedCount >= tournament.maxPlayers ? "full" : "open",
    });

    toast.success("Player removed successfully!");
  };

  const handleUpdateMaxPlayers = () => {
    if (newMaxPlayers < tournament.currentPlayers) {
      toast.error("Cannot set max players below current registrations!");
      return;
    }

    setTournament({
      ...tournament,
      maxPlayers: newMaxPlayers,
      status: tournament.currentPlayers >= newMaxPlayers ? "full" : "open",
    });

    toast.success("Max players updated!");
  };

  const handleToggleStatus = () => {
    const newStatus = tournament.status === "open" ? "closed" : "open";
    setTournament({
      ...tournament,
      status: newStatus,
    });
    toast.success(`Tournament ${newStatus === "open" ? "opened" : "closed"}!`);
  };

  const handleResetTournament = () => {
    if (window.confirm("Are you sure you want to reset the entire tournament? This cannot be undone!")) {
      const resetData: TournamentData = {
        id: "1",
        name: "FC 26 TOURNAMENT",
        maxPlayers: 32,
        currentPlayers: 0,
        status: "open",
        registrations: [],
      };
      setTournament(resetData);
      setNewMaxPlayers(32);
      toast.success("Tournament reset successfully!");
    }
  };

  const confirmedPlayers = tournament.registrations.filter((r) => r.paymentStatus === "confirmed");
  const pendingPlayers = tournament.registrations.filter((r) => r.paymentStatus === "pending");

  const handleLogout = () => {
    sessionStorage.removeItem("isAdminAuthenticated");
    sessionStorage.removeItem("adminLoginTime");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg hover:bg-slate-800 transition-all border border-slate-800 w-fit"
          >
            <ArrowLeft size={20} />
            Back to Tournament
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Gamepad2 className="text-slate-400" />
            Admin Control Panel
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg hover:bg-slate-800 transition-all border border-slate-700 hover:border-slate-600"
              title="Logout"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              onClick={handleResetTournament}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/50"
            >
              <RefreshCw size={20} />
              <span className="hidden sm:inline">Reset All</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Total Registrations - Blue */}
          <div className="bg-gradient-to-br from-blue-600/30 to-blue-700/30 rounded-xl p-5 md:p-6 border-2 border-blue-500/50">
            <div className="text-xs md:text-sm text-slate-300 mb-2">Total Registrations</div>
            <div className="text-3xl md:text-5xl font-bold text-blue-400">{tournament.registrations.length}</div>
          </div>
          
          {/* Confirmed Players - Green */}
          <div className="bg-gradient-to-br from-green-600/30 to-green-700/30 rounded-xl p-5 md:p-6 border-2 border-green-500/50">
            <div className="text-xs md:text-sm text-slate-300 mb-2">Confirmed Players</div>
            <div className="text-3xl md:text-5xl font-bold text-green-400">{confirmedPlayers.length}</div>
          </div>
          
          {/* Pending Payments - Gold/Brown */}
          <div className="bg-gradient-to-br from-amber-600/30 to-yellow-700/30 rounded-xl p-5 md:p-6 border-2 border-amber-500/50">
            <div className="text-xs md:text-sm text-slate-300 mb-2">Pending Payments</div>
            <div className="text-3xl md:text-5xl font-bold text-amber-400">{pendingPlayers.length}</div>
          </div>
          
          {/* Slots Left - Purple */}
          <div className="bg-gradient-to-br from-purple-600/30 to-purple-700/30 rounded-xl p-5 md:p-6 border-2 border-purple-500/50">
            <div className="text-xs md:text-sm text-slate-300 mb-2">Slots Left</div>
            <div className="text-3xl md:text-5xl font-bold text-purple-400">
              {tournament.maxPlayers - tournament.currentPlayers}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Controls */}
          <div className="space-y-6">
            {/* Add Player */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
                <UserPlus className="text-green-400" />
                Manually Add Player
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Player Name"
                  className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-lg focus:outline-none focus:border-green-500 text-white placeholder-slate-500"
                />
                <input
                  type="tel"
                  value={newPlayerPhone}
                  onChange={(e) => setNewPlayerPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-lg focus:outline-none focus:border-green-500 text-white placeholder-slate-500"
                />
                <button
                  onClick={handleAddPlayer}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-lg hover:shadow-green-500/50"
                >
                  Add Player
                </button>
              </div>
            </motion.div>

            {/* Tournament Settings */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4">⚙️ Tournament Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Max Players</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newMaxPlayers}
                      onChange={(e) => setNewMaxPlayers(Number(e.target.value))}
                      min={tournament.currentPlayers}
                      className="flex-1 px-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    />
                    <button
                      onClick={handleUpdateMaxPlayers}
                      className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
                    >
                      Update
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleToggleStatus}
                  className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    tournament.status === "open"
                      ? "bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-red-500/50"
                      : "bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-500/50"
                  }`}
                >
                  {tournament.status === "open" ? (
                    <>
                      <Lock size={20} />
                      Close Registration
                    </>
                  ) : (
                    <>
                      <Unlock size={20} />
                      Open Registration
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Player List */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
              <Gamepad2 className="text-blue-400" />
              Registered Players
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {tournament.registrations.length === 0 ? (
                <div className="text-slate-500 text-center py-12 bg-slate-950/50 rounded-lg border border-slate-800">
                  No registrations yet
                </div>
              ) : (
                tournament.registrations.map((reg, index) => (
                  <div
                    key={reg.id}
                    className="bg-slate-950/50 rounded-lg p-4 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-slate-500 font-semibold text-sm">#{index + 1}</span>
                        <span className="font-bold text-base md:text-lg truncate">{reg.playerName}</span>
                        {reg.paymentStatus === "confirmed" ? (
                          <CheckCircle className="text-green-400 flex-shrink-0" size={18} />
                        ) : (
                          <Clock className="text-yellow-400 flex-shrink-0" size={18} />
                        )}
                      </div>
                      <div className="text-sm text-slate-400 truncate">{reg.phoneNumber}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {reg.paymentStatus === "pending" ? (
                          <span className="text-yellow-400">
                            Expires in {Math.max(0, Math.round((reg.expiresAt - Date.now()) / 60000))} min
                          </span>
                        ) : (
                          <span className="text-green-400">✓ Payment Confirmed</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePlayer(reg.id)}
                      className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-all ml-3 flex-shrink-0"
                      title="Remove player"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}