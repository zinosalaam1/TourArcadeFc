import { supabase } from '../lib/supabase';

// ================================================
// ADMIN AUTHENTICATION
// ================================================
export async function loginAdmin(email: string, password: string) {
  // Sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) throw authError;

  // Verify user is an admin
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

  // Update last login
  await supabase
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', adminUser.id);

  return adminUser;
}

export async function logoutAdmin() {
  await supabase.auth.signOut();
}

export async function getCurrentAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', user.email)
    .eq('is_active', true)
    .single();

  return adminUser;
}

export async function addPlayerAsAdmin(
  tournamentId: string,
  playerName: string,
  phoneNumber: string
) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');

  // Add player
  const { data: registration, error } = await supabase
    .from('registrations')
    .insert({
      tournament_id: tournamentId,
      player_name: playerName,
      phone_number: phoneNumber,
      payment_status: 'confirmed',
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      amount: 0, // Admin added = free entry
    })
    .select()
    .single();

  if (error) throw error;

  // Update tournament count
  await supabase.rpc('increment_tournament_players', { 
    tournament_id: tournamentId 
  });

  // Log activity
  await logAdminActivity(admin.id, 'add_player', 'registration', registration.id, {
    player_name: playerName,
    phone_number: phoneNumber,
  });

  return registration;
}

export async function removePlayerAsAdmin(registrationId: string) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');

  // Get registration details before deletion
  const { data: registration } = await supabase
    .from('registrations')
    .select('*')
    .eq('id', registrationId)
    .single();

  if (!registration) throw new Error('Registration not found');

  // Delete registration
  await supabase
    .from('registrations')
    .delete()
    .eq('id', registrationId);

  // Update tournament count
  await supabase.rpc('decrement_tournament_players', { 
    tournament_id: registration.tournament_id 
  });

  // Log activity
  await logAdminActivity(admin.id, 'remove_player', 'registration', registrationId, {
    player_name: registration.player_name,
  });
}

export async function updateTournamentSettings(
  tournamentId: string,
  settings: Partial<{ max_players: number; status: string }>
) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('tournaments')
    .update(settings)
    .eq('id', tournamentId);

  if (error) throw error;

  // Log activity
  await logAdminActivity(admin.id, 'update_tournament', 'tournament', tournamentId, settings);
}

// ================================================
// ACTIVITY LOGGING
// ================================================
async function logAdminActivity(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: any
) {
  await supabase.from('admin_activity_log').insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  });
}

export async function getAdminActivityLog(limit: number = 50) {
  const { data, error } = await supabase
    .from('admin_activity_log')
    .select(`
      *,
      admin_users (
        email,
        full_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}