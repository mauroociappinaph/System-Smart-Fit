'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth.store';

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const loadSession = useAuthStore((s) => s.loadSession);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-800" />
          <p className="text-sm text-zinc-500">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
