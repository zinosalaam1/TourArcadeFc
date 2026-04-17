import { useEffect, useState } from 'react';
import { supabase, Tournament, Registration } from '../lib/supabase';

export function useTournamentSubscription(tournamentId: string) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Subscribe to tournament changes
    const tournamentSubscription = supabase
      .channel(`tournament:${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments',
          filter: `id=eq.${tournamentId}`,
        },
        (payload) => {
          setTournament(payload.new as Tournament);
        }
      )
      .subscribe();

    // Subscribe to registration changes
    const registrationSubscription = supabase
      .channel(`registrations:${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRegistrations((prev) => [payload.new as Registration, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRegistrations((prev) =>
              prev.map((reg) => (reg.id === payload.new.id ? (payload.new as Registration) : reg))
            );
          } else if (payload.eventType === 'DELETE') {
            setRegistrations((prev) => prev.filter((reg) => reg.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      tournamentSubscription.unsubscribe();
      registrationSubscription.unsubscribe();
    };
  }, [tournamentId]);

  async function fetchData() {
    const { data: tournamentData } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    const { data: registrationsData } = await supabase
      .from('registrations')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: false });

    if (tournamentData) setTournament(tournamentData);
    if (registrationsData) setRegistrations(registrationsData);
  }

  return { tournament, registrations };
}