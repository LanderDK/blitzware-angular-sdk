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
export class BlitzWareLoginGuard implements CanActivate {
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

      // Check authentication status
      const isAuthenticated = this.authService.isAuthenticatedValue;

      if (!isAuthenticated) {
        // User is not authenticated, allow access to login page
        return true;
      } else {
        // User is already authenticated, redirect to dashboard
        const returnUrl = next.queryParams['returnUrl'] || '/dashboard';
        this.router.navigate([returnUrl]);
        return false;
      }
    } catch (error) {
      console.error('Login guard error:', error);
      // On error, allow access to login page
      return true;
    }
  }
}
