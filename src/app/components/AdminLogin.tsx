import { useState } from "react";
import { motion } from "motion/react";
import { Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const ADMIN_PASSWORD = "tourarcade2027"; 

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate slight delay for security
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        // Store authentication in sessionStorage (clears on browser close)
        sessionStorage.setItem("isAdminAuthenticated", "true");
        sessionStorage.setItem("adminLoginTime", Date.now().toString());
        toast.success("✅ Access granted!");
        navigate("/admin");
      } else {
        toast.error("❌ Invalid password");
        setPassword("");
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full border-2 border-blue-500/50 mb-4">
            <ShieldCheck className="text-blue-400" size={40} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Access</h1>
          <p className="text-slate-400">Enter password to continue</p>
        </div>

        {/* Warning Banner */}
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-amber-200">
            <strong className="font-semibold">Demo Mode:</strong>For Admin's only
            Goodluck
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-800 shadow-2xl">
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-slate-300 flex items-center gap-2">
              <Lock size={16} />
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-slate-500 pr-12"
                autoFocus
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-bold shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isLoading ? "Verifying..." : "Access Admin Panel"}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Gunners<code className="px-2 py-1 bg-slate-800 rounded text-slate-300">For Life</code></p>
          <p className="mt-2">Change password <code className="text-slate-400">at senate building</code></p>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Tournament
          </button>
        </div>
      </motion.div>
    </div>
  );
}
