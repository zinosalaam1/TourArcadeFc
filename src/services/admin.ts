import { supabase } from '../lib/supabase';

// ================================================
// ADMIN AUTHENTICATION (Supabase Auth - optional)
// ================================================
export async function loginAdmin(email: string, password: string) {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError) throw authError;

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .single();

  if (adminError || !adminUser) {
    await supabase.auth.signOut();
    throw new Error('Unauthorized: Not an admin user');
  }

  await supabase.from('admin_users').update({ last_login: new Date().toISOString() }).eq('id', adminUser.id);
  return adminUser;
}

export async function logoutAdmin() {
  await supabase.auth.signOut();
}

export async function getCurrentAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: adminUser } = await supabase.from('admin_users').select('*').eq('email', user.email).eq('is_active', true).single();
  return adminUser;
}

// ================================================
// ADMIN PLAYER MANAGEMENT
// These work with sessionStorage-based auth (no Supabase Auth required)
// ================================================

export async function addPlayerAsAdmin(tournamentId: string, playerName: string, phoneNumber: string) {
  // 1. Get current tournament state
  const { data: tournament, error: tErr } = await supabase
    .from('tournaments')
    .select('current_players, max_players')
    .eq('id', tournamentId)
    .single();

  if (tErr || !tournament) throw new Error('Tournament not found');

  // 2. Insert registration as confirmed (admin-added = auto confirmed)
  const { data: registration, error: rErr } = await supabase
    .from('registrations')
    .insert({
      tournament_id: tournamentId,
      player_name: playerName,
      phone_number: phoneNumber,
      payment_status: 'confirmed',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      amount: 0,
    })
    .select()
    .single();

  if (rErr) throw rErr;

  // 3. Update tournament player count directly
  const newCount = tournament.current_players + 1;
  const { error: uErr } = await supabase
    .from('tournaments')
    .update({
      current_players: newCount,
      status: newCount >= tournament.max_players ? 'full' : 'open',
    })
    .eq('id', tournamentId);

  if (uErr) throw uErr;

  return registration;
}

export async function removePlayerAsAdmin(registrationId: string) {
  // 1. Get registration to find tournament_id
  const { data: registration, error: rErr } = await supabase
    .from('registrations')
    .select('*')
    .eq('id', registrationId)
    .single();

  if (rErr || !registration) throw new Error('Registration not found');

  // 2. Delete registration
  const { error: dErr } = await supabase.from('registrations').delete().eq('id', registrationId);
  if (dErr) throw dErr;

  // 3. Recalculate count from actual confirmed registrations (source of truth)
  const { count } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', registration.tournament_id)
    .eq('payment_status', 'confirmed');

  const { data: tournament } = await supabase.from('tournaments').select('max_players').eq('id', registration.tournament_id).single();

  const confirmedCount = count ?? 0;
  await supabase
    .from('tournaments')
    .update({
      current_players: confirmedCount,
      status: confirmedCount >= (tournament?.max_players ?? 32) ? 'full' : 'open',
    })
    .eq('id', registration.tournament_id);
}

export async function updateTournamentSettings(
  tournamentId: string,
  settings: Partial<{ max_players: number; status: string }>
) {
  const { error } = await supabase.from('tournaments').update(settings).eq('id', tournamentId);
  if (error) throw error;
}

export async function getAdminActivityLog(limit: number = 50) {
  const { data, error } = await supabase
    .from('admin_activity_log')
    .select('*, admin_users(email, full_name)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
