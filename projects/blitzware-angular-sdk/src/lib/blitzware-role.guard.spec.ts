import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { BlitzWareAuthService } from './blitzware-auth.service';
import { BlitzWareRoleGuard } from './blitzware-role.guard';

describe('BlitzWareRoleGuard', () => {
  let guard: BlitzWareRoleGuard;
  let authService: jasmine.SpyObj<BlitzWareAuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('BlitzWareAuthService', ['hasRole'], {
      isLoading: of(false),
      isAuthenticatedValue: true,
      currentUserValue: { id: '1', roles: ['admin'] }
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        BlitzWareRoleGuard,
        { provide: BlitzWareAuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(BlitzWareRoleGuard);
    authService = TestBed.inject(BlitzWareAuthService) as jasmine.SpyObj<BlitzWareAuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should allow access when user has required role', async () => {
      authService.hasRole.and.returnValue(true);

      const mockRoute = { data: { role: 'admin' } } as any;
      const mockState = {} as any;

      const result = await guard.canActivate(mockRoute, mockState);
      expect(result).toBe(true);
      expect(authService.hasRole).toHaveBeenCalledWith('admin', false);
    });

    it('should deny access when user does not have required role', async () => {
      authService.hasRole.and.returnValue(false);

      const mockRoute = { data: { role: 'admin' } } as any;
      const mockState = {} as any;

      const result = await guard.canActivate(mockRoute, mockState);
      expect(result).toBe(false);
      expect(authService.hasRole).toHaveBeenCalledWith('admin', false);
      expect(router.navigate).toHaveBeenCalledWith(['/'], {
        queryParams: { error: 'access_denied' },
      });
    });

    it('should redirect to login when user is not authenticated', async () => {
      // Reset TestBed with unauthenticated service for this test
      TestBed.resetTestingModule();
      
      const unauthenticatedSpy = jasmine.createSpyObj('BlitzWareAuthService', ['hasRole'], {
        isLoading: of(false),
        isAuthenticatedValue: false,
        currentUserValue: null
      });
      const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

      TestBed.configureTestingModule({
        providers: [
          BlitzWareRoleGuard,
          { provide: BlitzWareAuthService, useValue: unauthenticatedSpy },
          { provide: Router, useValue: routerSpy }
        ]
      });

      const testGuard = TestBed.inject(BlitzWareRoleGuard);
      const testRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

      const mockRoute = { data: { role: 'admin' } } as any;
      const mockState = { url: '/protected' } as any;

      const result = await testGuard.canActivate(mockRoute, mockState);
      expect(result).toBe(false);
      expect(testRouter.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/protected' },
      });
    });

    it('should handle multiple roles with OR logic', async () => {
      authService.hasRole.and.returnValue(true);

      const mockRoute = { 
        data: { 
          role: ['admin', 'moderator'], 
          requireAllRoles: false 
        } 
      } as any;
      const mockState = {} as any;

      const result = await guard.canActivate(mockRoute, mockState);
      expect(result).toBe(true);
      expect(authService.hasRole).toHaveBeenCalledWith(['admin', 'moderator'], false);
    });

    it('should handle multiple roles with AND logic', async () => {
      authService.hasRole.and.returnValue(false);

      const mockRoute = { 
        data: { 
          role: ['admin', 'premium'], 
          requireAllRoles: true 
        } 
      } as any;
      const mockState = {} as any;

      const result = await guard.canActivate(mockRoute, mockState);
      expect(result).toBe(false);
      expect(authService.hasRole).toHaveBeenCalledWith(['admin', 'premium'], true);
    });

    it('should allow access when no role is specified', async () => {
      const mockRoute = { data: {} } as any;
      const mockState = {} as any;

      const result = await guard.canActivate(mockRoute, mockState);
      expect(result).toBe(true);
      expect(authService.hasRole).not.toHaveBeenCalled();
    });

    it('should handle empty role array', async () => {
      authService.hasRole.and.returnValue(true);

      const mockRoute = { data: { role: [] } } as any;
      const mockState = {} as any;

      const result = await guard.canActivate(mockRoute, mockState);
      expect(result).toBe(true);
      expect(authService.hasRole).toHaveBeenCalledWith([], false);
    });
  });
});
