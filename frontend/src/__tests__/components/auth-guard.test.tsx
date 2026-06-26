import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthGuard } from '@/components/auth-guard';
import { useAuthStore } from '@/stores/auth.store';

const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

beforeEach(() => {
  replaceMock.mockClear();
  useAuthStore.setState({
    user: null,
    token: null,
    isLoading: false,
    error: null,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    loadSession: vi.fn().mockResolvedValue(undefined),
  });
});

describe('AuthGuard', () => {
  it('renders children when user is authenticated', () => {
    useAuthStore.setState({
      user: {
        id: '1',
        email: 'a@b.com',
        role: 'user',
        name: 'Test',
        weightKg: 75,
        heightCm: 180,
        birthDate: 0,
        goal: 'Fitness',
        registeredAt: 0,
      },
      isLoading: false,
    });

    render(
      <AuthGuard>
        <p>Protected Content</p>
      </AuthGuard>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('shows loading spinner while loading', () => {
    useAuthStore.setState({ isLoading: true, user: null });

    render(
      <AuthGuard>
        <p>Protected Content</p>
      </AuthGuard>,
    );

    expect(screen.getByText('Cargando sesión...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('redirects to /login when not authenticated', () => {
    useAuthStore.setState({ isLoading: false, user: null });

    render(
      <AuthGuard>
        <p>Protected Content</p>
      </AuthGuard>,
    );

    expect(replaceMock).toHaveBeenCalledWith('/login');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
