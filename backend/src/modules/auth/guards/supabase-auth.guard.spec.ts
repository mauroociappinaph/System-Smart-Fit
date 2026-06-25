import { SupabaseAuthGuard } from './supabase-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

const mockGetUser = jest.fn();

const mockSupabaseClient = {
  auth: {
    getUser: mockGetUser,
  },
} as any;

function createContext(headers: Record<string, string>): any {
  const request = { headers };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as any;
}

describe('SupabaseAuthGuard', () => {
  let guard: SupabaseAuthGuard;

  beforeEach(() => {
    mockGetUser.mockReset();
    guard = new SupabaseAuthGuard(mockSupabaseClient);
  });

  it('should throw UnauthorizedException when no authorization header is present', async () => {
    const context = createContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should inject request.user and return true when token is valid', async () => {
    const request = { headers: { authorization: 'Bearer valid-token' } };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;

    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'supabase-user-1',
          email: 'test@example.com',
          app_metadata: { role: 'ADMIN' },
        },
      },
      error: null,
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.user).toEqual({
      sub: 'supabase-user-1',
      email: 'test@example.com',
      role: 'ADMIN',
    });
  });

  it('should inject default USER role when app_metadata.role is missing', async () => {
    const request = { headers: { authorization: 'Bearer valid-token' } };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;

    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'supabase-user-2',
          email: 'user@example.com',
          app_metadata: {},
        },
      },
      error: null,
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.user).toEqual({
      sub: 'supabase-user-2',
      email: 'user@example.com',
      role: 'USER',
    });
  });

  it('should throw UnauthorizedException when token is invalid', async () => {
    const context = createContext({ authorization: 'Bearer invalid-token' });

    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
