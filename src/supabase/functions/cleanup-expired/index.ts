import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const now = new Date().toISOString();

  // Delete expired registrations
  const { data: deleted } = await supabase
    .from('registrations')
    .delete()
    .eq('payment_status', 'pending')
    .lt('expires_at', now)
    .select('tournament_id');

  // Update tournament counts
  if (deleted) {
    // Group by tournament
    const tournamentIds = [...new Set(deleted.map(r => r.tournament_id))];
    
    for (const tournamentId of tournamentIds) {
      const count = deleted.filter(r => r.tournament_id === tournamentId).length;
      
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('current_players, max_players')
        .eq('id', tournamentId)
        .single();

      if (tournament) {
        await supabase
          .from('tournaments')
          .update({
            current_players: Math.max(0, tournament.current_players - count),
            status: tournament.current_players - count < tournament.max_players ? 'open' : 'full',
          })
          .eq('id', tournamentId);
      }
    }
  }

  return new Response(JSON.stringify({ cleaned: deleted?.length || 0 }), {
    headers: { 'Content-Type': 'application/json' },
  });
});