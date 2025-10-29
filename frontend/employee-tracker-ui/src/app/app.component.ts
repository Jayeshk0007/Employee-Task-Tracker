import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, MatToolbarModule, MatButtonModule],
  template: `
  <mat-toolbar color="primary">
    <a mat-button routerLink="/" style="font-weight:700;color:white">Employee Task Tracker</a>
    <span class="spacer"></span>
    <a mat-button routerLink="/dashboard" *ngIf="auth.isAuthenticated()">Dashboard</a>
    <a mat-button routerLink="/employees" *ngIf="auth.role() === 'Manager'">Employees</a>
    <a mat-button routerLink="/tasks" *ngIf="auth.isAuthenticated()">Tasks</a>
    <a mat-button routerLink="/profile" *ngIf="auth.isAuthenticated()">Profile</a>
    <a mat-button routerLink="/login" *ngIf="!auth.isAuthenticated()">Login</a>
    <button mat-raised-button color="accent" (click)="logout()" *ngIf="auth.isAuthenticated()">Logout</button>
  </mat-toolbar>
  <div class="container">
    <router-outlet />
  </div>
  `,
  styles: [`
    .spacer{flex:1 1 auto}
  `]
})
export class AppComponent {
  constructor(public auth: AuthService) {}
  logout(){ this.auth.logout(); }
}
