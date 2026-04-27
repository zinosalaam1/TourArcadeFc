import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trophy, Clock, AlertTriangle, CheckCircle, Gamepad2, WifiOff } from "lucide-react";
import { Link } from "react-router";
import { RegistrationForm } from "./RegistrationForm";
import { TransferInstructions } from "./TransferInstructions";
import { LiveStatus } from "./LiveStatus";
import { toast } from "sonner";
import logoImage from "../../imports/trbg-1.png";
import { useTournamentSubscription } from "../../hooks/useTournamentSubscription";
import { registerPlayer } from "../../services/tournament";
import { initiatePaystackPayment, confirmPaymentInDB } from "../../services/payment";

const TOURNAMENT_ID = import.meta.env.VITE_TOURNAMENT_ID;

type PageState =
  | { view: "home" }
  | { view: "form" }
  | { view: "transfer"; playerName: string; amount: number; expiresAt: string };

export function TournamentPage() {
  const { tournament, error } = useTournamentSubscription(TOURNAMENT_ID);
  const [pageState, setPageState] = useState<PageState>({ view: "home" });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    if (tournament) setLastUpdate(Date.now());
  }, [tournament]);

  useEffect(() => {
    const interval = setInterval(() => setLastUpdate(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRegistration = async (
    playerName: string,
    phoneNumber: string,
    email: string,
    paymentMethod: "paystack" | "transfer"
  ) => {
    if (!tournament) return;
    setIsLoading(true);

    try {
      const registration = await registerPlayer(TOURNAMENT_ID, playerName, phoneNumber);

      if (paymentMethod === "transfer") {
        // Show transfer instructions — admin confirms manually
        setPageState({
          view: "transfer",
          playerName,
          amount: registration.amount,
          expiresAt: registration.expires_at,
        });
        setIsLoading(false);
      } else {
        // Open Paystack popup
        initiatePaystackPayment({
          email,
          amount: registration.amount,
          registrationId: registration.id,
          playerName,
          onSuccess: async (reference) => {
            try {
              await confirmPaymentInDB(registration.id, reference);
              toast.success("✅ Payment confirmed! You're in the tournament!", { duration: 6000 });
              setPageState({ view: "home" });
            } catch (err: any) {
              toast.error(`Payment received but confirmation failed. Save this reference: ${reference}`, { duration: 10000 });
            }
            setIsLoading(false);
          },
          onClose: () => {
            toast.warning("⚠️ Payment not completed. Your slot is reserved for 10 minutes.", { duration: 5000 });
            setPageState({ view: "home" });
            setIsLoading(false);
          },
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  const getPrice = (count: number) => {
    if (count < 10) return 1500;
    if (count < 22) return 2000;
    return 2500;
  };

  if (!TOURNAMENT_ID) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-lg bg-red-900/20 border border-red-500/50 rounded-2xl p-8">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-3">VITE_TOURNAMENT_ID not set</h2>
          <p className="text-slate-400 text-sm">Add <code className="bg-slate-800 px-2 py-1 rounded text-yellow-300">VITE_TOURNAMENT_ID=your-uuid</code> to your <code className="bg-slate-800 px-2 py-1 rounded text-yellow-300">.env</code> file and redeploy.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-lg bg-red-900/20 border border-red-500/50 rounded-2xl p-8">
          <WifiOff className="mx-auto mb-4 text-red-400" size={48} />
          <h2 className="text-2xl font-bold text-red-400 mb-3">Connection Error</h2>
          <p className="text-slate-400 text-sm mb-2">{error}</p>
          <p className="text-slate-500 text-xs">Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Connecting to Supabase...</p>
        </div>
      </div>
    );
  }

  const slotsLeft = tournament.max_players - tournament.current_players;
  const currentPrice = getPrice(tournament.current_players);

  if (tournament.status === "full") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-2xl">
          <div className="text-8xl mb-6">🚫</div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">TOURNAMENT FULL</h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-8">All {tournament.max_players} slots have been filled!</p>
        </motion.div>
      </div>
    );
  }

  if (tournament.status === "closed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-2xl">
          <div className="text-8xl mb-6">🔒</div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-slate-400 to-slate-600 bg-clip-text text-transparent">REGISTRATION CLOSED</h1>
          <p className="text-xl md:text-2xl text-slate-400">Registration is currently closed.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-16">
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="flex justify-center mb-6">
              <img src={logoImage} alt="Tour Arcade" className="h-16 md:h-24 w-auto brightness-0 invert opacity-90" />
            </div>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-30 animate-pulse" />
                <Trophy className="relative text-yellow-400" size={80} strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-3 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">{tournament.name}</h1>
            <div className="flex items-center justify-center gap-3 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                </span>
                <span className="text-lg md:text-xl font-semibold">Registration Open</span>
              </div>
              <span className="text-slate-600">•</span>
              <span className="text-lg md:text-xl font-semibold">Limited Slots</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 max-w-7xl mx-auto">
          <LiveStatus currentPlayers={tournament.current_players} maxPlayers={tournament.max_players} slotsLeft={slotsLeft} currentPrice={currentPrice} lastUpdate={lastUpdate} />

          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-800 shadow-2xl">

            {pageState.view === "home" && (
              <>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3"><CheckCircle className="text-green-400" />Secure Your Slot</h2>
                <div className="space-y-6">
                  <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800">
                    <div className="flex items-start gap-4">
                      <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-1" size={24} />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">⚡ Scarcity Alert</h3>
                        <p className="text-slate-400 text-sm">Slots are filling fast! Price increases as more players register.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-5 border border-orange-500/30">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="text-orange-400" size={24} />
                      <h3 className="font-semibold text-lg">10-Minute Payment Window</h3>
                    </div>
                    <p className="text-sm text-slate-300">Register → pay via transfer or Paystack → slot confirmed. Unpaid slots are released after 10 minutes.</p>
                  </div>
                  <button onClick={() => setPageState({ view: "form" })} disabled={slotsLeft === 0} className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-lg md:text-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/50">
                    {slotsLeft === 0 ? "No Slots Available" : `Register Now — ₦${currentPrice.toLocaleString()}`}
                  </button>
                </div>
              </>
            )}

            {pageState.view === "form" && (
              <RegistrationForm
                onSubmit={handleRegistration}
                onCancel={() => { setPageState({ view: "home" }); setIsLoading(false); }}
                currentPrice={currentPrice}
                isLoading={isLoading}
              />
            )}

            {pageState.view === "transfer" && (
              <TransferInstructions
                playerName={pageState.playerName}
                amount={pageState.amount}
                expiresAt={pageState.expiresAt}
                onDone={() => setPageState({ view: "home" })}
              />
            )}
          </motion.div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <Link to="/admin" className="block p-4 bg-slate-900 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700 hover:border-slate-600 group" title="Admin Panel">
          <Gamepad2 size={24} className="text-slate-400 group-hover:text-white transition-colors" />
        </Link>
      </div>
    </div>
  );
}
