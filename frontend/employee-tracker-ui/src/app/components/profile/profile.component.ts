import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

interface ProfileResponse {
  userId: number;
  email: string;
  role: 'Manager' | 'Employee';
  employeeId?: number | null;
  firstName?: string | null;
  lastName?: string | null;
  title?: string | null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
  <mat-card class="profile-card">
    <div class="header">
      <div class="avatar">
        <mat-icon>account_circle</mat-icon>
      </div>
      <div class="titles">
        <h2>Profile</h2>
        <div class="sub">Your account details</div>
      </div>
    </div>
    <div *ngIf="profile as p" class="grid">
      <div class="row"><span class="label">Name</span><span class="value">{{ displayName(p) }}</span></div>
      <div class="row"><span class="label">Role</span><span class="value">{{p.role}}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">{{p.email}}</span></div>
      <ng-container *ngIf="p.role === 'Employee'">
        <div class="row"><span class="label">Employee ID</span><span class="value">{{p.employeeId}}</span></div>
        <div class="row"><span class="label">First name</span><span class="value">{{p.firstName || '-'}}</span></div>
        <div class="row"><span class="label">Last name</span><span class="value">{{p.lastName || '-'}}</span></div>
        <div class="row"><span class="label">Title</span><span class="value">{{p.title || '-'}}</span></div>
      </ng-container>
    </div>
  </mat-card>
  `,
  styles: [`
    .profile-card{ max-width: 720px; margin: 16px auto; padding: 16px 18px; }
    .header{ display:flex; align-items:center; gap:12px; margin-bottom: 8px; }
    .avatar{ width:56px; height:56px; display:flex; align-items:center; justify-content:center; color:#3f51b5; }
    .avatar mat-icon{ font-size:56px; width:56px; height:56px; }
    .sub{ color:#666; }
    .grid{ margin-top: 10px; display:grid; grid-template-columns: 1fr; gap:10px; }
    .row{ display:flex; gap:12px; }
    .row .label{ width: 160px; color:#555; }
    .row .value{ font-weight:600; }
  `]
})
export class ProfileComponent implements OnInit {
  profile?: ProfileResponse;
  private baseUrl = 'http://localhost:5278/api';
  constructor(private http: HttpClient, public auth: AuthService){}
  ngOnInit(){
    this.http.get<ProfileResponse>(`${this.baseUrl}/Profile`).subscribe(p => this.profile = p);
  }

  displayName(p: ProfileResponse): string {
    const fn = (p.firstName || '').trim();
    const ln = (p.lastName || '').trim();
    if (fn || ln) return `${fn}${fn && ln ? ' ' : ''}${ln}`;
    // Fallback: derive a readable name from email local-part
    const local = (p.email || '').split('@')[0] || '';
    const cleaned = local.replace(/[._-]+/g, ' ').trim();
    if (!cleaned) return '-';
    return cleaned.split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}
