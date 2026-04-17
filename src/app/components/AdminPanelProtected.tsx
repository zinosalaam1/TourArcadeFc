import { useState, useEffect } from 'react';
import { AdminPanel } from './AdminPanel';
import { AdminAuth } from './AdminAuth';
import { getCurrentAdmin } from '../services/admin';

export function AdminPanelProtected({ onBack }: { onBack: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const admin = await getCurrentAdmin();
      setIsAuthenticated(!!admin);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return <AdminPanel onBack={onBack} />;
}
