import { supabase } from '@/lib/supabase';
import useAuthStore from '@/store/auth/authStore';

class AuthService {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    const userId = data.user.id;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    useAuthStore.getState().login(
      profile,
      data.session.access_token,
      data.session.refresh_token
    );

    return {
      user: profile,
      token: data.session.access_token,
    };
  }

  async logout() {
    await supabase.auth.signOut();
    useAuthStore.getState().logout();
  }

  async verifySession() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      useAuthStore.getState().logout();
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      useAuthStore.getState().updateUser(profile);
    }

    return profile;
  }
}

export const authService = new AuthService();