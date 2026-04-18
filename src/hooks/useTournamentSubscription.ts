import { useEffect, useState, useCallback } from 'react';
import { supabase, Tournament, Registration } from '../lib/supabase';

export function useTournamentSubscription(tournamentId: string) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const { data: tournamentData, error: tErr } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (tErr) {
        console.error('Tournament fetch error:', tErr);
        setError(tErr.message);
        return;
      }

      const { data: registrationsData, error: rErr } = await supabase
        .from('registrations')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('created_at', { ascending: false });

      if (rErr) {
        console.error('Registrations fetch error:', rErr);
      }

      if (tournamentData) setTournament(tournamentData);
      if (registrationsData) setRegistrations(registrationsData);
      setError(null);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchData();

    // Real-time subscription to tournament changes
    const tournamentSub = supabase
      .channel(`tournament-${tournamentId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments', filter: `id=eq.${tournamentId}` },
        (payload) => {
          if (payload.new) setTournament(payload.new as Tournament);
        }
      )
      .subscribe();

    // Real-time subscription to registrations
    const registrationSub = supabase
      .channel(`registrations-${tournamentId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations', filter: `tournament_id=eq.${tournamentId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRegistrations((prev) => [payload.new as Registration, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRegistrations((prev) => prev.map((r) => r.id === payload.new.id ? payload.new as Registration : r));
          } else if (payload.eventType === 'DELETE') {
            setRegistrations((prev) => prev.filter((r) => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Poll every 10s as fallback (in case realtime is not enabled in Supabase)
    const poll = setInterval(fetchData, 10000);

    return () => {
      tournamentSub.unsubscribe();
      registrationSub.unsubscribe();
      clearInterval(poll);
    };
  }, [tournamentId, fetchData]);

  return { tournament, registrations, error, refetch: fetchData };
}
