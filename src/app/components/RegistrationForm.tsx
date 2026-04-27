import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Phone, Mail, CreditCard, Building2, Lock, Copy, CheckCircle2, Clock } from "lucide-react";

interface RegistrationFormProps {
  onSubmit: (playerName: string, phoneNumber: string, email: string, paymentMethod: "paystack" | "transfer") => void;
  onCancel: () => void;
  currentPrice: number;
  isLoading?: boolean;
}

// Bank details — update these in one place
const BANK_DETAILS = {
  bankName: import.meta.env.VITE_BANK_NAME || "First Bank",
  accountNumber: import.meta.env.VITE_ACCOUNT_NUMBER || "0123456789",
  accountName: import.meta.env.VITE_ACCOUNT_NAME || "Tour Arcade FC",
};

export function RegistrationForm({ onSubmit, onCancel, currentPrice, isLoading = false }: RegistrationFormProps) {
  const [playerName, setPlayerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "transfer">("transfer");
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<{ playerName?: string; phoneNumber?: string; email?: string }>({});

  const validateForm = () => {
    const newErrors: { playerName?: string; phoneNumber?: string; email?: string } = {};
    if (!playerName.trim()) newErrors.playerName = "Player name is required";
    else if (playerName.trim().length < 2) newErrors.playerName = "Name must be at least 2 characters";
    if (!phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    else if (!/^0\d{10}$/.test(phoneNumber.replace(/\s/g, ""))) newErrors.phoneNumber = "Enter a valid 11-digit number (e.g. 08012345678)";
    if (paymentMethod === "paystack") {
      if (!email.trim()) newErrors.email = "Email is required for Paystack";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) onSubmit(playerName.trim(), phoneNumber.trim(), email.trim(), paymentMethod);
  };

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-5">
      {/* Player Name */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-300 flex items-center gap-2">
          <User size={16} className="text-slate-400" />Player Name
        </label>
        <input type="text" value={playerName} onChange={(e) => { setPlayerName(e.target.value); setErrors((p) => ({ ...p, playerName: undefined })); }} placeholder="Enter your full name" disabled={isLoading} className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-white placeholder-slate-500 disabled:opacity-50" />
        {errors.playerName && <p className="text-red-400 text-sm mt-1">{errors.playerName}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-300 flex items-center gap-2">
          <Phone size={16} className="text-slate-400" />Phone Number
        </label>
        <input type="tel" value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); setErrors((p) => ({ ...p, phoneNumber: undefined })); }} placeholder="08012345678" disabled={isLoading} className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-white placeholder-slate-500 disabled:opacity-50" />
        {errors.phoneNumber && <p className="text-red-400 text-sm mt-1">{errors.phoneNumber}</p>}
      </div>

      {/* Payment Method Toggle */}
      <div>
        <label className="block text-sm font-semibold mb-3 text-slate-300">Payment Method</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod("transfer")}
            disabled={isLoading}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${paymentMethod === "transfer" ? "border-blue-500 bg-blue-500/10 text-white" : "border-slate-700 bg-slate-950/50 text-slate-400 hover:border-slate-600"}`}
          >
            <Building2 size={22} />
            <span className="font-semibold text-sm">Bank Transfer</span>
            <span className="text-xs opacity-70">Pay & await confirmation</span>
          </button>
          <div className="relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-800 bg-slate-950/30 text-slate-600 cursor-not-allowed opacity-60">
            <CreditCard size={22} />
            <span className="font-semibold text-sm">Pay Online</span>
            <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Paystack: email field */}
      <AnimatePresence>
        {paymentMethod === "paystack" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <label className="block text-sm font-semibold mb-2 text-slate-300 flex items-center gap-2">
              <Mail size={16} className="text-slate-400" />Email <span className="text-slate-500 font-normal">(for receipt)</span>
            </label>
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }} placeholder="you@example.com" disabled={isLoading} className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-white placeholder-slate-500 disabled:opacity-50" />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer: bank details preview */}
      <AnimatePresence>
        {paymentMethod === "transfer" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <div className="bg-blue-500/10 border-2 border-blue-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-1">
                <Building2 size={16} />Transfer Details
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank</span>
                  <span className="text-white font-semibold">{BANK_DETAILS.bankName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Account No.</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold font-mono tracking-wider">{BANK_DETAILS.accountNumber}</span>
                    <button type="button" onClick={copyAccountNumber} className="p-1.5 bg-slate-800 rounded hover:bg-slate-700 transition-all">
                      {copied ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} className="text-slate-400" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Name</span>
                  <span className="text-white font-semibold">{BANK_DETAILS.accountName}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-green-400 font-bold text-base">₦{currentPrice.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-500/10 rounded-lg p-2 border border-amber-500/20">
                <Clock size={12} className="flex-shrink-0 mt-0.5" />
                <span>Your slot is reserved for 10 minutes after registering. Transfer within this time — an admin will confirm your payment.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Price summary */}
      <div className="flex justify-between items-center px-1">
        <span className="text-slate-400 text-sm">Entry Fee</span>
        <span className="text-green-400 font-bold text-xl">₦{currentPrice.toLocaleString()}</span>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
        <Lock size={14} className="flex-shrink-0 mt-0.5" />
        <p>{paymentMethod === "paystack" ? "Payments processed securely by Paystack. We never store your card details." : "After transferring, an admin will verify and confirm your slot."}</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button type="button" onClick={onCancel} disabled={isLoading} className="flex-1 py-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all font-semibold border border-slate-700 disabled:opacity-50">Cancel</button>
        <button type="submit" disabled={isLoading} className={`flex-1 py-3 rounded-lg font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all ${paymentMethod === "paystack" ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"}`}>
          {isLoading
            ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Reserving...</>)
            : paymentMethod === "paystack" ? "Pay with Paystack →" : "Reserve Slot →"}
        </button>
      </div>
    </motion.form>
  );
}
