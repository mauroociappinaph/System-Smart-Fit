'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';

const NAV_LINKS = [
  { href: '/insights', label: 'Dashboard' },
  { href: '/telemetry', label: 'Registrar Métrica' },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    localStorage.clear();
    router.push('/login');
  }

  function isActive(href: string) {
    return pathname.startsWith(href);
  }

  const linkClasses = (href: string) =>
    `transition-colors px-3 py-2 rounded-lg text-sm font-medium ${
      isActive(href)
        ? 'bg-zinc-100 text-zinc-900'
        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <button
          onClick={() => router.push('/insights')}
          className="text-lg font-bold tracking-tight text-zinc-900"
        >
          Smart Fit
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className={linkClasses(link.href)}
            >
              {link.label}
            </button>
          ))}

          {/* User info + logout */}
          <span className="ml-4 mr-2 text-sm text-zinc-400">|</span>
          <span className="mr-2 text-sm text-zinc-500">
            {user?.name ?? user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Cerrar sesión
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center justify-center rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 md:hidden"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile slide-in panel */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          {/* Panel */}
          <nav className="fixed inset-y-0 right-0 z-50 flex w-64 flex-col border-l border-zinc-200 bg-white shadow-xl md:hidden">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-4">
              <span className="font-semibold text-zinc-900">Menú</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100"
                aria-label="Cerrar menú"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-1 px-3 py-4">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => {
                    router.push(link.href);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left ${
                    isActive(link.href)
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  } rounded-lg px-3 py-2.5 text-sm font-medium transition-colors`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="border-t border-zinc-100 px-4 py-4">
              <p className="mb-1 text-sm text-zinc-500">
                {user?.name ?? user?.email}
              </p>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                Cerrar sesión
              </button>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
