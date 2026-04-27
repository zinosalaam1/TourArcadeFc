import { motion } from "motion/react";
import { Building2, Copy, CheckCircle2, Clock, MessageCircle } from "lucide-react";
import { useState } from "react";

interface TransferInstructionsProps {
  playerName: string;
  amount: number;
  expiresAt: string;
  onDone: () => void;
}

const BANK_DETAILS = {
  bankName: import.meta.env.VITE_BANK_NAME || "First Bank",
  accountNumber: import.meta.env.VITE_ACCOUNT_NUMBER || "0123456789",
  accountName: import.meta.env.VITE_ACCOUNT_NAME || "Tour Arcade FC",
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || "",
};

export function TransferInstructions({ playerName, amount, expiresAt, onDone }: TransferInstructionsProps) {
  const [copied, setCopied] = useState(false);

  const minutesLeft = Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 60000));

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hi, I just registered for the FC Tournament and have made my transfer.\n\nName: ${playerName}\nAmount: ₦${amount.toLocaleString()}\n\nPlease confirm my slot. Thank you!`
  );

  const whatsappLink = `https://wa.me/${BANK_DETAILS.whatsappNumber}?text=${whatsappMessage}`;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
      {/* Header */}
      <div className="text-center py-2">
        <div className="text-5xl mb-3">🎮</div>
        <h3 className="text-xl font-bold text-white mb-1">Slot Reserved!</h3>
        <p className="text-slate-400 text-sm">Follow the steps below to secure your spot</p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {/* Step 1 */}
        <div className="flex gap-3 items-start bg-slate-950/60 border border-slate-800 rounded-xl p-4">
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">1</div>
          <div className="flex-1">
            <p className="text-white font-semibold mb-2 flex items-center gap-2">
              <Building2 size={16} className="text-blue-400" />Transfer ₦{amount.toLocaleString()} to:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Bank</span>
                <span className="text-white font-semibold">{BANK_DETAILS.bankName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Account No.</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold font-mono tracking-widest">{BANK_DETAILS.accountNumber}</span>
                  <button onClick={copyAccountNumber} className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all">
                    {copied ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} className="text-slate-400" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Name</span>
                <span className="text-white font-semibold">{BANK_DETAILS.accountName}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Amount</span>
                <span className="text-green-400 font-bold text-lg">₦{amount.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 text-xs text-yellow-400">
              💡 Use <span className="font-bold">{playerName}</span> as your transfer narration/remark
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-3 items-start bg-slate-950/60 border border-[#25D366]/30 rounded-xl p-4">
          <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">2</div>
          <div className="flex-1">
            <p className="text-white font-semibold mb-1 flex items-center gap-2">
              <MessageCircle size={16} className="text-[#25D366]" />Message the admin on WhatsApp
            </p>
            <p className="text-slate-400 text-xs mb-3">
              After making your transfer, you <span className="text-white font-semibold">must</span> message the admin on WhatsApp to get your payment confirmed and slot approved.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] rounded-xl text-white font-bold hover:bg-[#20BA5A] transition-all shadow-lg shadow-[#25D366]/20 text-sm"
            >
              <MessageCircle size={18} />
              Message Admin on WhatsApp
            </a>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-3 items-start bg-slate-950/60 border border-slate-800 rounded-xl p-4">
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">3</div>
          <div className="flex-1">
            <p className="text-white font-semibold mb-1">Wait for admin confirmation</p>
            <p className="text-slate-400 text-xs">The admin will verify your transfer and confirm your slot. You'll be added to the registered players list.</p>
          </div>
        </div>
      </div>

      {/* Countdown */}
      <div className="flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
        <Clock size={16} className="text-amber-400 animate-pulse" />
        <span className="text-amber-400 font-semibold text-sm">Slot reserved for ~{minutesLeft} minutes — act fast!</span>
      </div>

      {/* Done */}
      <button onClick={onDone} className="w-full py-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all font-semibold border border-slate-700 text-slate-300 text-sm">
        Back to home
      </button>
    </motion.div>
  );
}
