import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { BlitzWareAuthService } from './blitzware-auth.service';
import { BLITZWARE_AUTH_PARAMS } from './types';
import { BlitzWareAuthUser } from './types';

// Mock global objects
const mockLocalStorage = {
  getItem: jasmine.createSpy('getItem').and.returnValue(null),
  setItem: jasmine.createSpy('setItem'),
  removeItem: jasmine.createSpy('removeItem'),
};

const mockWindow = {
  location: {
    search: '',
  },
  crypto: {
    getRandomValues: jasmine.createSpy('getRandomValues').and.returnValue(new Uint8Array(32)),
    subtle: {
      digest: jasmine.createSpy('digest').and.returnValue(Promise.resolve(new ArrayBuffer(32))),
    },
  },
};

// Mock fetch function
const mockFetch = jasmine.createSpy('fetch').and.returnValue(
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

describe('BlitzWareAuthService', () => {
  let service: BlitzWareAuthService;
  const mockAuthParams = {
    clientId: 'test-client-id',
    redirectUri: 'http://localhost:4200/callback'
  };

  beforeEach(() => {
    // Setup global mocks
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    Object.defineProperty(window, 'crypto', {
      value: mockWindow.crypto,
      writable: true,
    });
    (window as any).fetch = mockFetch;

    TestBed.configureTestingModule({
      providers: [
        BlitzWareAuthService,
        { provide: BLITZWARE_AUTH_PARAMS, useValue: mockAuthParams }
      ]
    });
    service = TestBed.inject(BlitzWareAuthService);
  });

  afterEach(() => {
    // Reset mocks
    mockLocalStorage.getItem.calls.reset();
    mockLocalStorage.setItem.calls.reset();
    mockLocalStorage.removeItem.calls.reset();
    mockFetch.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('hasRole method', () => {
    beforeEach(() => {
      // Reset the user state
      service['user'].next(null);
    });

    it('should return false when user is null', () => {
      const result = service.hasRole('admin');
      expect(result).toBe(false);
    });

    it('should return false when user has no roles', () => {
      const userWithoutRoles: BlitzWareAuthUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com'
      };
      service['user'].next(userWithoutRoles);

      const result = service.hasRole('admin');
      expect(result).toBe(false);
    });

    it('should return false when user has empty roles array', () => {
      const userWithEmptyRoles: BlitzWareAuthUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: []
      };
      service['user'].next(userWithEmptyRoles);

      const result = service.hasRole('admin');
      expect(result).toBe(false);
    });

    it('should return false when no role is specified', () => {
      const userWithRoles: BlitzWareAuthUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['admin', 'user']
      };
      service['user'].next(userWithRoles);

      const result = service.hasRole();
      expect(result).toBe(false);
    });

    it('should return true when user has the required role', () => {
      const userWithRoles: BlitzWareAuthUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['admin', 'user']
      };
      service['user'].next(userWithRoles);

      const result = service.hasRole('admin');
      expect(result).toBe(true);
    });

    it('should return false when user does not have the required role', () => {
      const userWithRoles: BlitzWareAuthUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user']
      };
      service['user'].next(userWithRoles);

      const result = service.hasRole('admin');
      expect(result).toBe(false);
    });

    describe('multiple roles with OR logic (default)', () => {
      it('should return true when user has any of the required roles', () => {
        const userWithRoles: BlitzWareAuthUser = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['moderator', 'user']
        };
        service['user'].next(userWithRoles);

        const result = service.hasRole(['admin', 'moderator']);
        expect(result).toBe(true);
      });

      it('should return false when user has none of the required roles', () => {
        const userWithRoles: BlitzWareAuthUser = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['user']
        };
        service['user'].next(userWithRoles);

        const result = service.hasRole(['admin', 'moderator']);
        expect(result).toBe(false);
      });
    });

    describe('multiple roles with AND logic', () => {
      it('should return true when user has all required roles', () => {
        const userWithRoles: BlitzWareAuthUser = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['admin', 'moderator', 'user']
        };
        service['user'].next(userWithRoles);

        const result = service.hasRole(['admin', 'moderator'], true);
        expect(result).toBe(true);
      });

      it('should return false when user does not have all required roles', () => {
        const userWithRoles: BlitzWareAuthUser = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['admin', 'user']
        };
        service['user'].next(userWithRoles);

        const result = service.hasRole(['admin', 'moderator'], true);
        expect(result).toBe(false);
      });

      it('should return true when single role is provided with AND logic', () => {
        const userWithRoles: BlitzWareAuthUser = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['admin', 'user']
        };
        service['user'].next(userWithRoles);

        const result = service.hasRole('admin', true);
        expect(result).toBe(true);
      });
    });

    describe('edge cases', () => {
      it('should handle empty role array parameter', () => {
        const userWithRoles: BlitzWareAuthUser = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['admin', 'user']
        };
        service['user'].next(userWithRoles);

        const result = service.hasRole([]);
        expect(result).toBe(false);
      });

      it('should be case sensitive', () => {
        const userWithRoles: BlitzWareAuthUser = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['admin']
        };
        service['user'].next(userWithRoles);

        const result = service.hasRole('Admin');
        expect(result).toBe(false);
      });
    });
  });

  describe('observables', () => {
    it('should provide authentication state observable', (done: DoneFn) => {
      service.isAuthenticated.pipe(take(1)).subscribe((isAuth: boolean) => {
        expect(typeof isAuth).toBe('boolean');
        done();
      });
    });

    it('should provide user observable', (done: DoneFn) => {
      service.currentUser.pipe(take(1)).subscribe((user: BlitzWareAuthUser | null) => {
        // User can be null or BlitzWareAuthUser
        expect(user === null || typeof user === 'object').toBe(true);
        done();
      });
    });

    it('should provide loading state observable', (done: DoneFn) => {
      service.isLoading.pipe(take(1)).subscribe((isLoading: boolean) => {
        expect(typeof isLoading).toBe('boolean');
        done();
      });
    });
  });
});
