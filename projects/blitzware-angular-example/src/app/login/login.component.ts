import { Component } from '@angular/core';
import { BlitzWareAuthService } from 'blitzware-angular-sdk';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, AsyncPipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  constructor(public auth: BlitzWareAuthService) {}

  login() {
    this.auth.login();
  }
}
