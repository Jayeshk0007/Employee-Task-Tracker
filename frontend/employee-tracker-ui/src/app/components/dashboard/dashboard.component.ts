import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

interface DashboardSummaryResponse {
  role: 'Manager' | 'Employee';
  pending: number;
  inProgress: number;
  completed: number;
  total: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
  <div class="header">
    <h2>{{summary?.role}} Dashboard</h2>
    <div class="sub">Overview of your tasks</div>
  </div>

  <div class="grid" *ngIf="summary as s">
    <mat-card class="card pending hoverable">
      <div class="label">Pending</div>
      <div class="value">{{s.pending}}</div>
    </mat-card>
    <mat-card class="card inprogress hoverable">
      <div class="label">In Progress</div>
      <div class="value">{{s.inProgress}}</div>
    </mat-card>
    <mat-card class="card completed hoverable">
      <div class="label">Completed</div>
      <div class="value">{{s.completed}}</div>
    </mat-card>
    <mat-card class="card total hoverable">
      <div class="label">Total</div>
      <div class="value">{{s.total}}</div>
    </mat-card>
  </div>

  <div class="activities" *ngIf="activities.length">
    <h3 class="activities-title"><mat-icon>history</mat-icon> Recent activities</h3>
    <div class="activity-list">
      <div class="activity-item" *ngFor="let a of activities">
        <div class="dot" [ngClass]="a.type.toLowerCase()"></div>
        <div class="text">
          <div class="msg">{{a.message}}</div>
          <div class="when">{{ a.createdAt | date:'short' }}</div>
        </div>
      </div>
    </div>
  </div>
  `,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  summary?: DashboardSummaryResponse;
  activities: { createdAt: string | Date; type: string; message: string }[] = [];
  private baseUrl = 'http://localhost:5278/api';
  constructor(private http: HttpClient, public auth: AuthService){}
  ngOnInit(){ this.load(); this.loadRecent(); }
  load(){ this.http.get<DashboardSummaryResponse>(`${this.baseUrl}/Dashboard`).subscribe(r => this.summary = r); }
  loadRecent(){ this.http.get<any[]>(`${this.baseUrl}/Dashboard/recent?take=10`).subscribe(r => this.activities = r || []); }
}
