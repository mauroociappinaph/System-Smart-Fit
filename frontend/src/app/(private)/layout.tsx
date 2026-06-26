import { AuthGuard } from '@/components/auth-guard';
import { Navbar } from '@/components/navbar';
import type { ReactNode } from 'react';

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <Navbar />
      <main className="mx-auto max-w-4xl p-4">{children}</main>
    </AuthGuard>
  );
}
