import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function AdminAuth({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast.error('Invalid credentials');
      return;
    }
    
    // Verify user is in admin_users table
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (!adminUser) {
      toast.error('Unauthorized');
      await supabase.auth.signOut();
      return;
    }
    
    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('email', email);
    
    onAuthenticated();
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-xl border border-slate-800 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Admin Login</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-lg mb-4 text-white"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-lg mb-4 text-white"
        />
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
}