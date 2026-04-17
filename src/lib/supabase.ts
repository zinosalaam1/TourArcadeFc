import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Tournament {
  id: string;
  name: string;
  max_players: number;
  current_players: number;
  status: 'open' | 'full' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  tournament_id: string;
  player_name: string;
  phone_number: string;
  payment_status: 'pending' | 'confirmed' | 'failed';
  created_at: string;
  expires_at: string;
  payment_reference: string | null;
  amount: number;
}

export async function getCachedTournament(id: string) {
  const cacheKey = `tournament-${id}`;
  const cached = sessionStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    // Cache for 5 seconds
    if (Date.now() - timestamp < 5000) {
      return data;
    }
  }
  
  const { data } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single();
  
  sessionStorage.setItem(cacheKey, JSON.stringify({
    data,
    timestamp: Date.now(),
  }));
  
  return data;
}
