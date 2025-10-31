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
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
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
