import { supabase } from '../lib/supabase';

export async function initiatePayment(
  email: string,
  amount: number,
  registrationId: string
) {
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VITE_PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: amount * 100, // Convert to kobo
      reference: registrationId,
      callback_url: `${window.location.origin}/payment/verify`,
      metadata: {
        registration_id: registrationId,
      },
    }),
  });

  const data = await response.json();
  return data.data.authorization_url;
}

export async function verifyPayment(reference: string) {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      'Authorization': `Bearer ${process.env.VITE_PAYSTACK_SECRET_KEY}`,
    },
  });

  const data = await response.json();

  if (data.data.status === 'success') {
    // Update registration status
    await supabase
      .from('registrations')
      .update({
        payment_status: 'confirmed',
        payment_reference: reference,
      })
      .eq('id', reference);

    return true;
  }

  return false;
}