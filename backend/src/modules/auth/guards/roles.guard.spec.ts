import { RolesGuard } from './roles.guard';
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

const mockGetAllAndOverride = jest.fn();

const mockReflector = {
  getAllAndOverride: mockGetAllAndOverride,
} as any;

function createContext(user?: {
  sub: string;
  email: string;
  role: string;
}): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as any;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    mockGetAllAndOverride.mockReset();
    guard = new RolesGuard(mockReflector);
  });

  it('should return true when no roles metadata is set', () => {
    mockGetAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(createContext({ sub: 'u1', email: 'a@b.com', role: 'USER' }));

    expect(result).toBe(true);
  });

  it('should return true when user has the required role', () => {
    mockGetAllAndOverride.mockReturnValue(['ADMIN']);

    const result = guard.canActivate(
      createContext({ sub: 'u1', email: 'a@b.com', role: 'ADMIN' }),
    );

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user lacks the required role', () => {
    mockGetAllAndOverride.mockReturnValue(['ADMIN']);

    expect(() =>
      guard.canActivate(
        createContext({ sub: 'u1', email: 'a@b.com', role: 'USER' }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('should throw UnauthorizedException when request.user is undefined', () => {
    mockGetAllAndOverride.mockReturnValue(['ADMIN']);

    expect(() => guard.canActivate(createContext(undefined))).toThrow(
      UnauthorizedException,
    );
  });
});
