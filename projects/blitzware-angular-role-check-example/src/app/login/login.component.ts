import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlitzWareAuthService } from 'blitzware-angular-sdk';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, AsyncPipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  constructor(
    public auth: BlitzWareAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is already authenticated after component loads
    this.auth.isAuthenticated.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        // User is authenticated, redirect to dashboard
        this.router.navigate(['/dashboard']);
      }
    });
  }

  async login() {
    try {
      await this.auth.login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  }
}
