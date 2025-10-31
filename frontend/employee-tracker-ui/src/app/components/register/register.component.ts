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
		templateUrl: './register.component.html',
		styleUrls: ['./register.component.css']
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
