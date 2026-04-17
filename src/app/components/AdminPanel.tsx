import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { ArrowLeft, UserPlus, Trash2, CheckCircle, Clock, RefreshCw, Lock, Unlock, Gamepad2, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { useTournamentSubscription } from "../../hooks/useTournamentSubscription";
import { addPlayerAsAdmin, removePlayerAsAdmin, updateTournamentSettings, logoutAdmin } from "../../services/admin";
import { confirmPayment } from "../../services/tournament";

const TOURNAMENT_ID = import.meta.env.VITE_TOURNAMENT_ID || "1";

export function AdminPanel() {
  const navigate = useNavigate();
  const { tournament, registrations } = useTournamentSubscription(TOURNAMENT_ID);
  const [newMaxPlayers, setNewMaxPlayers] = useState<number>(32);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerPhone, setNewPlayerPhone] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (tournament) setNewMaxPlayers(tournament.max_players);
  }, [tournament?.max_players]);

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim() || !newPlayerPhone.trim()) {
      toast.error("Please enter both name and phone number");
      return;
    }
    setIsWorking(true);
    try {
      await addPlayerAsAdmin(TOURNAMENT_ID, newPlayerName.trim(), newPlayerPhone.trim());
      setNewPlayerName("");
      setNewPlayerPhone("");
      toast.success("Player added successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to add player");
    } finally {
      setIsWorking(false);
    }
  };

  const handleRemovePlayer = async (id: string) => {
    if (!window.confirm("Remove this player from the tournament?")) return;
    setIsWorking(true);
    try {
      await removePlayerAsAdmin(id);
      toast.success("Player removed successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove player");
    } finally {
      setIsWorking(false);
    }
  };

  const handleConfirmPayment = async (id: string) => {
    setIsWorking(true);
    try {
      await confirmPayment(id, `ADMIN-MANUAL-${Date.now()}`);
      toast.success("Payment confirmed!");
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm payment");
    } finally {
      setIsWorking(false);
    }
  };

  const handleUpdateMaxPlayers = async () => {
    if (!tournament) return;
    if (newMaxPlayers < tournament.current_players) {
      toast.error("Cannot set max players below current registrations!");
      return;
    }
    setIsWorking(true);
    try {
      await updateTournamentSettings(TOURNAMENT_ID, { max_players: newMaxPlayers });
      toast.success("Max players updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setIsWorking(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!tournament) return;
    const newStatus = tournament.status === "open" ? "closed" : "open";
    setIsWorking(true);
    try {
      await updateTournamentSettings(TOURNAMENT_ID, { status: newStatus });
      toast.success(`Tournament ${newStatus === "open" ? "opened" : "closed"}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsWorking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch {}
    sessionStorage.removeItem("isAdminAuthenticated");
    sessionStorage.removeItem("adminLoginTime");
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const confirmedPlayers = registrations.filter((r) => r.payment_status === "confirmed");
  const pendingPlayers = registrations.filter((r) => r.payment_status === "pending");

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