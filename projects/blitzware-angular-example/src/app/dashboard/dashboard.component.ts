import { Component } from '@angular/core';
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
  constructor(public auth: BlitzWareAuthService) {}

  logout() {
    this.auth.logout();
  }
}
