import { supabase } from '../lib/supabase';

// Paystack public key - safe to use in frontend
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

interface PaystackOptions {
  key: string;
  email: string;
  amount: number; // in kobo
  reference: string;
  metadata?: Record<string, any>;
  callback: (response: { reference: string; status: string }) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: PaystackOptions) => { openIframe: () => void };
    };
  }
}

export function initiatePaystackPayment({
  email,
  amount,
  registrationId,
  playerName,
  onSuccess,
  onClose,
}: {
  email: string;
  amount: number;
  registrationId: string;
  playerName: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}) {
  if (!window.PaystackPop) {
    throw new Error('Paystack script not loaded. Check your internet connection.');
  }

  if (!PAYSTACK_PUBLIC_KEY) {
    throw new Error('VITE_PAYSTACK_PUBLIC_KEY is not set in your .env file.');
  }

  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: amount * 100, // convert naira to kobo
    reference: `TRFC-${registrationId}-${Date.now()}`,
    metadata: {
      registration_id: registrationId,
      player_name: playerName,
      custom_fields: [
        { display_name: 'Player Name', variable_name: 'player_name', value: playerName },
      ],
    },
    callback: (response) => {
      onSuccess(response.reference);
    },
    onClose,
  });

  handler.openIframe();
}

export async function confirmPaymentInDB(registrationId: string, reference: string) {
  const { error } = await supabase
    .from('registrations')
    .update({
      payment_status: 'confirmed',
      payment_reference: reference,
    })
    .eq('id', registrationId);

  if (error) throw error;

  // Recalculate tournament confirmed count
  const { data: reg } = await supabase
    .from('registrations')
    .select('tournament_id')
    .eq('id', registrationId)
    .single();

  if (reg) {
    const { count } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', reg.tournament_id)
      .eq('payment_status', 'confirmed');

    const { data: tournament } = await supabase
      .from('tournaments')
      .select('max_players')
      .eq('id', reg.tournament_id)
      .single();

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
