import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BlitzWareAuthService } from 'blitzware-angular-sdk';
import { NgIf, AsyncPipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, AsyncPipe, JsonPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  constructor(public auth: BlitzWareAuthService, private router: Router) {}

  get hasAdminRole(): boolean {
    return this.auth.hasRole('admin');
  }

  get hasPremiumRole(): boolean {
    return this.auth.hasRole('premium');
  }

  async logout() {
    try {
      await this.auth.logout();
      // Redirect to login page after successful logout
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login page
      this.router.navigate(['/login']);
    }
  }
}
