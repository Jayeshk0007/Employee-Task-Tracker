import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(18px)' }),
        animate('260ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerIn', [
      transition(':enter', [
        query('.stagger', [
          style({ opacity: 0, transform: 'translateY(8px)' }),
          stagger(90, [ animate('180ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })) ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
  <div class="bg">
    <mat-card class="auth-card mat-elevation-z6" [@fadeSlide]>
      <div class="header">
        <div class="icon-circle"><mat-icon>assignment_ind</mat-icon></div>
        <h2 class="title">Welcome back</h2>
        <p class="subtitle">Sign in to continue to Employee Tracker</p>
      </div>
      <form (ngSubmit)="onSubmit()" #f="ngForm" class="form-grid" [@staggerIn]>
        <mat-form-field appearance="outline" class="stagger">
          <mat-label>Email</mat-label>
          <mat-icon matPrefix>mail</mat-icon>
          <input matInput [(ngModel)]="email" name="email" type="email" required email #emailCtrl="ngModel" />
          <mat-error *ngIf="emailCtrl.touched && emailCtrl.invalid">
            <span *ngIf="emailCtrl.errors?.['required']">Email is required.</span>
            <span *ngIf="emailCtrl.errors?.['email']">Enter a valid email address.</span>
          </mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="stagger">
          <mat-label>Password</mat-label>
          <mat-icon matPrefix>lock</mat-icon>
          <input matInput [type]="hidePassword ? 'password' : 'text'" [(ngModel)]="password" name="password" required minlength="6" #pwdCtrl="ngModel" />
          <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" [attr.aria-label]="hidePassword ? 'Show password' : 'Hide password'" [attr.aria-pressed]="!hidePassword">
            <mat-icon>{{ hidePassword ? 'visibility' : 'visibility_off' }}</mat-icon>
          </button>
          <mat-error *ngIf="pwdCtrl.touched && pwdCtrl.invalid">
            <span *ngIf="pwdCtrl.errors?.['required']">Password is required.</span>
            <span *ngIf="pwdCtrl.errors?.['minlength']">Password must be at least 6 characters.</span>
          </mat-error>
        </mat-form-field>
        <div class="row stagger">
          <mat-checkbox [(ngModel)]="remember" name="remember">Remember me</mat-checkbox>
        </div>
        <div class="actions stagger">
          <button mat-stroked-button type="button" (click)="goRegister()">Sign up</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="f.invalid">Login</button>
        </div>
        <div *ngIf="error" class="error stagger">{{error}}</div>
      </form>
    </mat-card>
  </div>
  `,
  styles: [`
    .bg{ min-height:100vh; padding: 24px; display:flex; align-items:center; justify-content:center; background: radial-gradient(1200px 600px at 10% 10%, #f4f4ff 0%, transparent 70%), linear-gradient(135deg, #ece9f0 0%, #ffffff 100%); }
    .auth-card{ width: 100%; max-width: 520px; padding: 20px 24px 16px; }
    .header{ display:flex; flex-direction:column; align-items:center; gap:6px; margin-top: 8px; }
    .icon-circle{ width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; background: #3f51b5; color:white; }
    .title{ text-align:center; margin: 8px 0 4px; }
    .subtitle{ text-align:center; margin: 0 0 12px; color: rgba(0,0,0,.6); font-size: 14px; }
    .form-grid{ display:grid; grid-template-columns: 1fr; gap:16px; margin-top:12px; }
    .form-grid .mat-form-field{ width:100%; }
    .row{ display:flex; align-items:center; gap:12px; padding: 0 2px; }
    .link{ color:#3f51b5; margin-left:auto; }
    .actions{ display:flex; justify-content:space-between; align-items:center; margin-top: 4px; }
    .error{ color:#c62828; margin-top: 8px; text-align:center; }
  `]
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  remember = false;
  hidePassword = true;
  error?: string;
  constructor(private auth: AuthService, private router: Router){}
  ngOnInit(){
    const remembered = localStorage.getItem('ett_remember_email');
    if (remembered){ this.email = remembered; this.remember = true; }
  }
  onSubmit(){
    this.error = undefined;
    this.auth.login({email: this.email, password: this.password}).subscribe({
      next: (resp) => {
        this.auth.setSession(resp);
        if (this.remember) localStorage.setItem('ett_remember_email', this.email);
        else localStorage.removeItem('ett_remember_email');
        this.router.navigateByUrl('/');
      },
      error: (err) => { this.error = 'Invalid credentials'; }
    });
  }
  goRegister(){ this.router.navigateByUrl('/register'); }
}
