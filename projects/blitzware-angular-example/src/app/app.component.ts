import { Component } from '@angular/core';
import { BlitzWareAuthService } from 'blitzware-angular-sdk'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'blitzware-angular-example';

  constructor(public authService: BlitzWareAuthService) {}

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }
}
