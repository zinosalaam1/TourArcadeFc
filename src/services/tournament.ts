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
export async function registerPlayer(tournamentId: string, playerName: string, phoneNumber: string) {
  // 1. Check tournament state
  const { data: tournament, error: tErr } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (tErr) throw new Error('Could not load tournament. Check your Supabase connection.');
  if (!tournament) throw new Error('Tournament not found. Check VITE_TOURNAMENT_ID.');
  if (tournament.status !== 'open') throw new Error('Tournament registration is closed.');
  if (tournament.current_players >= tournament.max_players) throw new Error('Tournament is full.');

  // 2. Calculate price
  const price = getPrice(tournament.current_players);

  // 3. Insert registration
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { data: registration, error: rErr } = await supabase
    .from('registrations')
    .insert({
      tournament_id: tournamentId,
      player_name: playerName,
      phone_number: phoneNumber,
      payment_status: 'pending',
      expires_at: expiresAt,
      amount: price,
    })
    .select()
    .single();

  if (rErr) throw rErr;

  // 4. Update tournament player count
  const newCount = tournament.current_players + 1;
  await supabase
    .from('tournaments')
    .update({
      current_players: newCount,
      status: newCount >= tournament.max_players ? 'full' : 'open',
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
    .update({ payment_status: 'confirmed', payment_reference: paymentReference })
    .eq('id', registrationId);

  if (error) throw error;

  // Also update tournament current_players to reflect confirmed count
  const { data: reg } = await supabase.from('registrations').select('tournament_id').eq('id', registrationId).single();
  if (reg) {
    const { count } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', reg.tournament_id)
      .eq('payment_status', 'confirmed');

    const { data: tournament } = await supabase.from('tournaments').select('max_players').eq('id', reg.tournament_id).single();
    const confirmedCount = count ?? 0;
    await supabase
      .from('tournaments')
      .update({
        current_players: confirmedCount,
        status: confirmedCount >= (tournament?.max_players ?? 32) ? 'full' : 'open',
      })
      .eq('id', reg.tournament_id);
  }
}

// Dynamic pricing logic
function getPrice(currentPlayers: number): number {
  if (currentPlayers < 10) return 1500;
  if (currentPlayers < 22) return 2000;
  return 2500;
}
