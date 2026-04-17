import { supabase, Tournament, Registration } from '../lib/supabase';

// ================================================
// GET TOURNAMENT STATUS
// ================================================
export async function getTournamentStatus(tournamentId: string) {
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (error) throw error;
  return tournament;
}

// ================================================
// REGISTER PLAYER
// ================================================
export async function registerPlayer(
  tournamentId: string,
  playerName: string,
  phoneNumber: string
) {
  // 1. Check if tournament is open and has slots
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (!tournament || tournament.current_players >= tournament.max_players) {
    throw new Error('Tournament is full');
  }

  if (tournament.status !== 'open') {
    throw new Error('Tournament registration is closed');
  }

  // 2. Calculate price based on current registrations
  const price = getPrice(tournament.current_players);

  // 3. Create registration (expires in 10 minutes)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  const { data: registration, error } = await supabase
    .from('registrations')
    .insert({
      tournament_id: tournamentId,
      player_name: playerName,
      phone_number: phoneNumber,
      payment_status: 'pending',
      expires_at: expiresAt.toISOString(),
      amount: price,
    })
    .select()
    .single();

  if (error) throw error;

  // 4. Increment tournament player count
  await supabase
    .from('tournaments')
    .update({
      current_players: tournament.current_players + 1,
      status: tournament.current_players + 1 >= tournament.max_players ? 'full' : 'open',
    })
    .eq('id', tournamentId);

  return registration;
}

// ================================================
// GET ALL REGISTRATIONS
// ================================================
export async function getRegistrations(tournamentId: string) {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ================================================
// CONFIRM PAYMENT
// ================================================
export async function confirmPayment(registrationId: string, paymentReference: string) {
  const { error } = await supabase
    .from('registrations')
    .update({
      payment_status: 'confirmed',
      payment_reference: paymentReference,
    })
    .eq('id', registrationId);

  if (error) throw error;
}

// ================================================
// CLEANUP EXPIRED REGISTRATIONS (Run via cron or Edge Function)
// ================================================
export async function cleanupExpiredRegistrations() {
  const now = new Date().toISOString();

  // Get expired pending registrations
  const { data: expired } = await supabase
    .from('registrations')
    .select('tournament_id')
    .eq('payment_status', 'pending')
    .lt('expires_at', now);

  // Delete expired registrations
  await supabase
    .from('registrations')
    .delete()
    .eq('payment_status', 'pending')
    .lt('expires_at', now);

  // Update tournament counts
  if (expired && expired.length > 0) {
    for (const reg of expired) {
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('current_players, max_players')
        .eq('id', reg.tournament_id)
        .single();

      if (tournament) {
        await supabase
          .from('tournaments')
          .update({
            current_players: Math.max(0, tournament.current_players - 1),
            status: tournament.current_players - 1 < tournament.max_players ? 'open' : 'full',
          })
          .eq('id', reg.tournament_id);
      }
    }
  }
}

// Dynamic pricing logic
function getPrice(currentPlayers: number): number {
  if (currentPlayers < 10) return 1500;
  if (currentPlayers < 22) return 2000;
  return 2500;
}