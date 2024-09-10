import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { BlitzWareAuthService } from './blitzware-auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BlitzWareAuthGuard implements CanActivate {
  constructor(
    private authService: BlitzWareAuthService,
    private router: Router
  ) {}

  canActivate() {
    return this.authService.isAuthenticated.pipe(
      map((isAuthenticated) => {
        if (!isAuthenticated) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      })
    );
  }
}
