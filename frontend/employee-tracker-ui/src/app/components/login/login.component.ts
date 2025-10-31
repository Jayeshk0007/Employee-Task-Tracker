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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
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
