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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile missing - fallback to session data
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || 'Usuario',
            role: 'customer'
          })
          .select()
          .single();
        
        if (!insertError && newProfile) {
          setUser(newProfile as UserProfile);
        }
      }
    } else if (!error && data) {
      setUser(data as UserProfile);
    }
    setLoading(false);
  }

  return { user, loading };
}
