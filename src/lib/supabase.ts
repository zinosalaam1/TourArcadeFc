import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

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