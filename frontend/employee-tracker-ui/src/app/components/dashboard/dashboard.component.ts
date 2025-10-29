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
  styles: [`
    .header{margin:16px 0}
    .sub{color:#666}
    .grid{display:grid;grid-template-columns:repeat(4, minmax(160px,1fr));gap:16px}
    @media (max-width: 900px){ .grid{grid-template-columns:repeat(2,1fr)} }
    @media (max-width: 520px){ .grid{grid-template-columns:1fr} }
    .card{padding:16px; transition: transform .18s ease, box-shadow .18s ease}
    .hoverable:hover{ transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.12); }
    .label{font-size:14px;color:#555;margin-bottom:6px}
    .value{font-size:28px;font-weight:700}
    .pending{border-left:4px solid #f59e0b}
    .inprogress{border-left:4px solid #3b82f6}
    .completed{border-left:4px solid #10b981}
    .total{border-left:4px solid #6b7280}

    .activities{ margin-top: 20px; }
    .activities-title{ display:flex; align-items:center; gap:8px; font-size:18px; margin: 8px 0 12px; }
    .activity-list{ display:flex; flex-direction:column; gap:10px; }
    .activity-item{ display:flex; gap:10px; align-items:flex-start; padding:10px 12px; border-radius:8px; background:#fafafa; border:1px solid #eee; }
    .activity-item .dot{ width:10px; height:10px; border-radius:50%; margin-top:6px; }
    .activity-item .dot.taskcreated{ background:#3b82f6; }
    .activity-item .dot.taskstatusupdated{ background:#f59e0b; }
    .activity-item .dot.taskdeleted{ background:#ef4444; }
    .activity-item .text .msg{ font-size:14px; }
    .activity-item .text .when{ font-size:12px; color:#6b7280; margin-top:2px; }
  `]
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
