import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { BlitzWareAuthService } from './blitzware-auth.service';
import { delay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BlitzWareAuthGuard implements CanActivate {
  constructor(
    private authService: BlitzWareAuthService,
    private router: Router
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    await this.authService.checkAuthState();

    return new Promise((resolve) => {
      this.authService.isAuthenticated.subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          resolve(true);
        } else {
          this.authService.isLoading.subscribe((isLoading) => {
            if (!isLoading) {
              resolve(false);
              this.router.navigate(['/login']);
            }
          });
        }
      });
    });
  }
}
