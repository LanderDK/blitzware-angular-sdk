import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { BlitzWareAuthService } from './blitzware-auth.service';
import { firstValueFrom } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BlitzWareRoleGuard implements CanActivate {
  constructor(
    private authService: BlitzWareAuthService,
    private router: Router
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      // Wait for loading to complete
      await firstValueFrom(
        this.authService.isLoading.pipe(
          filter((loading) => !loading),
          take(1)
        )
      );

      // Check authentication status first
      const isAuthenticated = this.authService.isAuthenticatedValue;

      if (!isAuthenticated) {
        // Redirect to login page
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: state.url },
        });
        return false;
      }

      // Get role requirements from route data
      const requiredRole = next.data['role'] as string | string[] | undefined;
      const requireAllRoles = next.data['requireAllRoles'] as boolean || false;

      // If no role requirement, allow access (just authentication required)
      if (!requiredRole) {
        return true;
      }

      // Check if user has required roles
      const user = this.authService.currentUserValue;
      const hasRequiredRole = this.authService.hasRole(requiredRole, requireAllRoles);

      if (hasRequiredRole) {
        return true;
      } else {
        // User is authenticated but doesn't have required role
        // You can customize this behavior - redirect to access denied page, home, etc.
        console.warn('Access denied: User does not have required role(s)', {
          requiredRole,
          userRoles: user?.roles || [],
          requireAllRoles
        });
        
        // Redirect to home or access denied page
        this.router.navigate(['/'], {
          queryParams: { error: 'access_denied' },
        });
        return false;
      }
    } catch (error) {
      console.error('Role guard error:', error);
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }
  }
}
