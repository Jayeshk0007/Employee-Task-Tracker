import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

interface Employee { id: number; firstName: string; lastName: string; title?: string; email: string; }

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
  <mat-card>
    <h2 class="title">Employees</h2>
    <form (ngSubmit)="add()" #f="ngForm" style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;align-items:end;">
      <mat-form-field appearance="outline">
        <mat-label>First</mat-label>
        <input matInput [(ngModel)]="form.firstName" name="firstName" required />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Last</mat-label>
        <input matInput [(ngModel)]="form.lastName" name="lastName" required />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Title</mat-label>
        <input matInput [(ngModel)]="form.title" name="title" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input matInput [(ngModel)]="form.email" name="email" required />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Password</mat-label>
        <input matInput [(ngModel)]="form.password" name="password" required />
      </mat-form-field>
      <div class="actions-center"><button mat-raised-button color="primary" type="submit">Add</button></div>
    </form>
  </mat-card>

  <mat-card>
    <table class="table">
      <thead><tr><th>Name</th><th>Title</th><th>Email</th><th>Actions</th></tr></thead>
      <tbody>
        <tr *ngFor="let e of employees">
          <td>{{e.firstName}} {{e.lastName}}</td>
          <td>{{e.title}}</td>
          <td>{{e.email}}</td>
          <td><button mat-button color="warn" (click)="remove(e.id)">Delete</button></td>
        </tr>
      </tbody>
    </table>
  </mat-card>
  `,
  styles: [`
    .title{ text-align:center; margin: 12px 0 12px; }
    .actions-center{ grid-column: 1 / -1; display:flex; justify-content:center; margin-top: 4px; margin-bottom: 12px; }
    /* add space between the two cards */
    mat-card + mat-card { margin-top: 12px; }
  `]
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  form = { firstName: '', lastName: '', title: '', email: '', password: '' };
  private baseUrl = 'http://localhost:5278/api';
  constructor(private http: HttpClient, public auth: AuthService){}
  ngOnInit(){ this.load(); }
  load(){ this.http.get<Employee[]>(`${this.baseUrl}/Employees`).subscribe(r => this.employees = r); }
  add(){ this.http.post<Employee>(`${this.baseUrl}/Employees`, this.form).subscribe(_ => { this.form = { firstName: '', lastName: '', title: '', email: '', password: '' }; this.load(); }); }
  remove(id: number){ this.http.delete(`${this.baseUrl}/Employees/${id}`).subscribe(_ => this.load()); }
}
