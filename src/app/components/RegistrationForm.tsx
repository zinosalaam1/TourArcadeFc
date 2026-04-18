import { useState } from "react";
import { motion } from "motion/react";
import { User, Phone, Mail, CreditCard, Lock } from "lucide-react";

interface RegistrationFormProps {
  onSubmit: (playerName: string, phoneNumber: string, email: string) => void;
  onCancel: () => void;
  currentPrice: number;
  isLoading?: boolean;
}

export function RegistrationForm({ onSubmit, onCancel, currentPrice, isLoading = false }: RegistrationFormProps) {
  const [playerName, setPlayerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ playerName?: string; phoneNumber?: string; email?: string }>({});

  const validateForm = () => {
    const newErrors: { playerName?: string; phoneNumber?: string; email?: string } = {};
    if (!playerName.trim()) newErrors.playerName = "Player name is required";
    else if (playerName.trim().length < 2) newErrors.playerName = "Name must be at least 2 characters";
    if (!phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    else if (!/^0\d{10}$/.test(phoneNumber.replace(/\s/g, ""))) newErrors.phoneNumber = "Enter a valid 11-digit number (e.g. 08012345678)";
    if (!email.trim()) newErrors.email = "Email is required for payment";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Enter a valid email address";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) onSubmit(playerName.trim(), phoneNumber.trim(), email.trim());
  };

  return (
    <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-5">
      {/* Player Name */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-300 flex items-center gap-2">
          <User size={16} className="text-slate-400" />Player Name
        </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => { setPlayerName(e.target.value); setErrors((p) => ({ ...p, playerName: undefined })); }}
          placeholder="Enter your full name"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-white placeholder-slate-500 disabled:opacity-50"
        />
        {errors.playerName && <p className="text-red-400 text-sm mt-1">{errors.playerName}</p>}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-300 flex items-center gap-2">
          <Phone size={16} className="text-slate-400" />Phone Number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => { setPhoneNumber(e.target.value); setErrors((p) => ({ ...p, phoneNumber: undefined })); }}
          placeholder="08012345678"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-white placeholder-slate-500 disabled:opacity-50"
        />
        {errors.phoneNumber && <p className="text-red-400 text-sm mt-1">{errors.phoneNumber}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-300 flex items-center gap-2">
          <Mail size={16} className="text-slate-400" />Email <span className="text-slate-500 font-normal">(for payment receipt)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
          placeholder="you@example.com"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-white placeholder-slate-500 disabled:opacity-50"
        />
        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Payment Summary */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-5 border-2 border-green-500/30">
        <div className="flex items-start gap-3 mb-3">
          <CreditCard className="text-green-400 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-lg mb-1">Payment Summary</h3>
            <p className="text-sm text-slate-400">
              Entry Fee: <span className="text-green-400 font-bold text-xl">₦{currentPrice.toLocaleString()}</span>
            </p>
          </div>
        </div>
        <div className="text-sm text-slate-400 space-y-1">
          <p>• You'll be redirected to Paystack to complete payment</p>
          <p>• Complete payment within 10 minutes or slot is released</p>
          <p>• Receipt will be sent to your email</p>
        </div>
      </div>

      {/* Security */}
      <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
        <Lock size={14} className="flex-shrink-0 mt-0.5" />
        <p>Payments are processed securely by Paystack. We never store your card details.</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all font-semibold border border-slate-700 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading
            ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</>)
            : "Reserve & Pay →"}
        </button>
      </div>
    </motion.form>
  );
}
