import { supabase } from './supabase';

export async function loginAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function logoutAdmin() {
  await supabase.auth.signOut();
}

export async function isAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  // Check if user email matches admin email
  return user?.email === process.env.VITE_ADMIN_EMAIL;
}

