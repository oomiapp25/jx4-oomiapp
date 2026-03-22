import { useState, useEffect } from 'react';
import { supabase, UserProfile } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      setLoading(false);
      return;
    }

    const userEmail = session.user.email?.toLowerCase() || '';
    const isAdminEmail = userEmail === 'jjtovar1510@gmail.com';
    
    console.log('[Auth Debug] User Email:', userEmail, 'Is Admin Email:', isAdminEmail);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.log('[Auth Debug] Profile fetch error:', error.message);
      // Fallback: set basic user info from session even if profile fetch fails
      const fallbackUser: UserProfile = {
        id: session.user.id,
        email: userEmail,
        full_name: session.user.user_metadata?.full_name || 'Usuario',
        roles: isAdminEmail ? ['admin'] : ['customer'],
        created_at: new Date().toISOString()
      };
      
      setUser(fallbackUser);

      if (error.code === 'PGRST116') {
        console.log('[Auth Debug] Profile missing, creating...');
        // Try to create profile if missing
        await supabase
          .from('users')
          .upsert({
            id: session.user.id,
            email: userEmail,
            full_name: session.user.user_metadata?.full_name || 'Usuario',
            roles: isAdminEmail ? ['admin'] : ['customer']
          });
      }
    } else if (data) {
      const profile = data as UserProfile;
      console.log('[Auth Debug] Profile found:', profile.email, 'Roles:', profile.roles);
      // Ensure admin email always has admin role even if DB is out of sync
      if (isAdminEmail && !profile.roles.includes('admin')) {
        console.log('[Auth Debug] Injecting admin role for super admin');
        profile.roles = [...profile.roles, 'admin'];
      }
      setUser(profile);
    }
    setLoading(false);
  }

  return { user, loading };
}
