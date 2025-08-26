import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BlitzWareAuthService } from 'blitzware-angular-sdk';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, AsyncPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  constructor(public auth: BlitzWareAuthService, private router: Router) {}

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
