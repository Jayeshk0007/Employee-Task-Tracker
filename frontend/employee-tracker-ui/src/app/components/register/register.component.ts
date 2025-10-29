import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
	selector: 'app-register',
	standalone: true,
	imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatIconModule, MatSnackBarModule],
	animations: [
		trigger('fadeSlide', [
			transition(':enter', [
				style({ opacity: 0, transform: 'translateY(16px)' }),
				animate('240ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
			])
		])
	],
		template: `
		<div class="bg">
			<mat-card class="auth-card mat-elevation-z6" [@fadeSlide]>
				<div class="header">
					<div class="icon-circle"><mat-icon>person_add</mat-icon></div>
					<h2 class="title">Create your account</h2>
					<p class="subtitle">Join Employee Tracker to get started</p>
				</div>
			<form (ngSubmit)="onRegister()" #registerForm="ngForm" class="form-grid">
				<mat-form-field appearance="outline" class="full">
					<mat-label>Email</mat-label>
					<input matInput type="email" [(ngModel)]="model.email" name="email" required email #emailCtrl="ngModel" />
					<mat-error *ngIf="emailCtrl.touched && emailCtrl.invalid">
						<span *ngIf="emailCtrl.errors?.['required']">Email is required.</span>
						<span *ngIf="emailCtrl.errors?.['email']">Enter a valid email address.</span>
					</mat-error>
				</mat-form-field>
				<mat-form-field appearance="outline" class="full">
					<mat-label>Password</mat-label>
					<input matInput [type]="hidePassword ? 'password' : 'text'" [(ngModel)]="model.password" name="password" required minlength="6" #pwdCtrl="ngModel" />
					<button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" [attr.aria-label]="hidePassword ? 'Show password' : 'Hide password'" [attr.aria-pressed]="!hidePassword">
						<mat-icon>{{ hidePassword ? 'visibility' : 'visibility_off' }}</mat-icon>
					</button>
					<mat-hint align="start">Minimum 6 characters</mat-hint>
					<mat-error *ngIf="pwdCtrl.touched && pwdCtrl.invalid">
						<span *ngIf="pwdCtrl.errors?.['required']">Password is required.</span>
						<span *ngIf="pwdCtrl.errors?.['minlength']">Password must be at least 6 characters.</span>
					</mat-error>
				</mat-form-field>
				<mat-form-field appearance="outline" class="full">
					<mat-label>Confirm password</mat-label>
					<input matInput [type]="hideConfirm ? 'password' : 'text'" [(ngModel)]="confirmPassword" name="confirmPassword" required #confirmCtrl="ngModel" />
					<button mat-icon-button matSuffix type="button" (click)="hideConfirm = !hideConfirm" [attr.aria-label]="hideConfirm ? 'Show password' : 'Hide password'" [attr.aria-pressed]="!hideConfirm">
						<mat-icon>{{ hideConfirm ? 'visibility' : 'visibility_off' }}</mat-icon>
					</button>
					<mat-error *ngIf="confirmCtrl.touched && confirmCtrl.invalid">Confirm password is required.</mat-error>
					<mat-error *ngIf="confirmPassword && !passwordsMatch()">Passwords do not match.</mat-error>
				</mat-form-field>

				<mat-form-field appearance="outline" class="full">
					<mat-label>Role</mat-label>
					<mat-select [(ngModel)]="model.role" name="role" required #roleCtrl="ngModel">
						<mat-option value="Employee">Employee</mat-option>
						<mat-option value="Manager">Manager</mat-option>
					</mat-select>
					<mat-error *ngIf="roleCtrl.touched && roleCtrl.invalid">Role is required.</mat-error>
				</mat-form-field>

				<ng-container *ngIf="model.role === 'Employee'">
					<mat-form-field appearance="outline">
						<mat-label>First name</mat-label>
						<input matInput [(ngModel)]="model.firstName" name="firstName" [required]="model.role === 'Employee'" minlength="2" #firstCtrl="ngModel" />
						<mat-error *ngIf="firstCtrl.touched && firstCtrl.invalid">
							<span *ngIf="firstCtrl.errors?.['required']">First name is required.</span>
							<span *ngIf="firstCtrl.errors?.['minlength']">Please enter at least 2 characters.</span>
						</mat-error>
					</mat-form-field>
					<mat-form-field appearance="outline">
						<mat-label>Last name</mat-label>
						<input matInput [(ngModel)]="model.lastName" name="lastName" [required]="model.role === 'Employee'" minlength="2" #lastCtrl="ngModel" />
						<mat-error *ngIf="lastCtrl.touched && lastCtrl.invalid">
							<span *ngIf="lastCtrl.errors?.['required']">Last name is required.</span>
							<span *ngIf="lastCtrl.errors?.['minlength']">Please enter at least 2 characters.</span>
						</mat-error>
					</mat-form-field>
					<mat-form-field appearance="outline">
						<mat-label>Title (optional)</mat-label>
						<input matInput [(ngModel)]="model.title" name="title" />
					</mat-form-field>
				</ng-container>

				<div class="actions">
					<button mat-stroked-button type="button" (click)="goLogin()">Back to Login</button>
					<button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid || !passwordsMatch()">Register</button>
				</div>
				<div *ngIf="error" class="error">{{error}}</div>
			</form>
		</mat-card>
	</div>
	`,
		styles: [`
			.bg{ min-height:100vh; padding: 24px; display:flex; align-items:center; justify-content:center; background: radial-gradient(1200px 600px at 10% 10%, #f4f4ff 0%, transparent 70%), linear-gradient(135deg, #ece9f0 0%, #ffffff 100%); }
			.auth-card{ width:100%; max-width: 560px; padding: 20px 24px 16px; }
			.header{ display:flex; flex-direction:column; align-items:center; gap:6px; margin-top: 8px; }
			.icon-circle{ width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; background: #3f51b5; color:white; }
			.title{ text-align:center; margin: 8px 0 4px; }
			.subtitle{ text-align:center; margin: 0 0 12px; color: rgba(0,0,0,.6); font-size: 14px; }
			.form-grid{ display:grid; grid-template-columns: 1fr; gap:16px; margin-top:12px; }
			.form-grid .full{ grid-column: 1 / -1; }
			.form-grid .mat-form-field{ width:100%; }
			.actions{ display:flex; justify-content:space-between; align-items:center; margin-top: 4px; }
			.error{ color:#c62828; margin-top: 8px; text-align:center; }
			.hint{ color:#d32f2f; font-size: 12px; margin-top: -6px; }
			@media (min-width: 720px){
				.form-grid{ grid-template-columns: 1fr 1fr; }
				.form-grid .full{ grid-column: 1 / -1; }
			}
		`]
})
export class RegisterComponent {
	model: any = { email: '', password: '', role: 'Employee', firstName: '', lastName: '', title: '' };
	error?: string;
	hidePassword = true;
	hideConfirm = true;
	confirmPassword = '';
	constructor(private auth: AuthService, private router: Router, private snack: MatSnackBar){}

	goLogin(){ this.router.navigateByUrl('/login'); }

		onRegister(){
		this.error = undefined;
		if (!this.passwordsMatch()){
			this.error = 'Passwords do not match';
			return;
		}
		if (this.model.role === 'Employee' && (!this.model.firstName || !this.model.lastName)){
			this.error = 'First and last name are required for Employee';
			return;
		}
			const payload = {
				email: (this.model.email || '').trim(),
				password: this.model.password,
				role: this.model.role,
				firstName: (this.model.firstName || '').trim() || undefined,
				lastName: (this.model.lastName || '').trim() || undefined,
				title: (this.model.title || '').trim() || undefined
			};
			this.auth.register(payload as any).subscribe({
				next: (_) => {
					// Do NOT auto-login after registration. Redirect to login instead.
					this.snack.open('Registration successful. Please log in.', 'Close', { duration: 3500 });
					this.router.navigateByUrl('/login');
				},
				error: (err) => {
					const serverMsg = (err?.error && (err.error.detail || err.error.title || err.error.message)) || err?.error;
					if (err?.status === 409) this.error = 'Email already exists';
					else if (typeof serverMsg === 'string' && serverMsg) this.error = serverMsg;
					else this.error = `Could not register. Please check details and try again${err?.status ? ' (HTTP ' + err.status + ')' : ''}.`;
					console.error('Register error', err);
				}
			});
	}
	canSubmit(){
		if (!this.model.email || !this.model.password || !this.model.role) return false;
		if (this.model.role === 'Employee' && (!this.model.firstName || !this.model.lastName)) return false;
		if (!this.passwordsMatch()) return false;
		return true;
	}
	passwordsMatch(){ return this.model.password && this.confirmPassword && this.model.password === this.confirmPassword; }
}
