import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  setInitialized: (initialized: boolean) => void;
}

// Plain module-level store (not just a hook) so router `beforeLoad` guards can
// read auth state synchronously via `useAuthStore.getState()` outside React.
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initialized: false,
  setSession: (session) => set({ session }),
  setInitialized: (initialized) => set({ initialized }),
}));
