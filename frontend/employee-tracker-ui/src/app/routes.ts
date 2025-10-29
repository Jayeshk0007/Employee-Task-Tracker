import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './components/login/login.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { TasksComponent } from './components/tasks/tasks.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';

const managerOnly = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);
  return auth.role() === 'Manager' ? true : router.createUrlTree(['/login']);
};

const authOnly = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authOnly] },
  { path: 'employees', component: EmployeesComponent, canActivate: [managerOnly] },
  { path: 'tasks', component: TasksComponent, canActivate: [authOnly] },
  { path: 'profile', component: ProfileComponent, canActivate: [authOnly] },
  { path: '**', redirectTo: 'tasks' }
];
