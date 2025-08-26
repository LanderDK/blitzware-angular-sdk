import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BlitzWareAuthGuard, BlitzWareLoginGuard } from 'blitzware-angular-sdk';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [BlitzWareLoginGuard], // Prevent authenticated users from seeing login
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [BlitzWareAuthGuard], // Protect dashboard for authenticated users only
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }, // Redirect to dashboard first
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
