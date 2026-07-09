import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

import App from './App.tsx';
import { useAuthStore } from './features/auth';
import { supabase } from './lib/supabase';
import { router } from './router';

async function bootstrap() {
  const { data } = await supabase.auth.getSession();
  useAuthStore.getState().setSession(data.session);
  useAuthStore.getState().setInitialized(true);

  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
    router.invalidate();
  });

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
