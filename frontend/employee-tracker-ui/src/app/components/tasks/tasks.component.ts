import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDialogComponent } from './confirm-dialog.component';

interface Task { id: number; title: string; description?: string; status: string; assignedToEmployeeId: number; }
interface Employee { id: number; firstName: string; lastName: string; title?: string; email: string; }
@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    
  ],
  template: `
  <mat-card>
    <div class="card-header">
      <h2>Tasks</h2>
      <div class="filters">
        <mat-form-field appearance="outline" class="filter-field" floatLabel="auto">
          <mat-label>Search</mat-label>
          <input matInput [(ngModel)]="search" (ngModelChange)="applyFilter()" placeholder="Title or description" />
          <button *ngIf="search" mat-icon-button matSuffix aria-label="Clear" (click)="clearSearch()"><mat-icon>close</mat-icon></button>
        </mat-form-field>
        <mat-form-field appearance="outline" class="filter-field" floatLabel="auto">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (ngModelChange)="applyFilter()">
            <mat-option [value]="''">All</mat-option>
            <mat-option value="Pending">Pending</mat-option>
            <mat-option value="InProgress">In Progress</mat-option>
            <mat-option value="Completed">Completed</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </div>

    <div *ngIf="auth.role() === 'Manager'" class="add-form">
      <form (ngSubmit)="add()" #f="ngForm" class="grid-form">
        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput [(ngModel)]="form.title" name="title" required />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <input matInput [(ngModel)]="form.description" name="description" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Assign To</mat-label>
          <mat-select [(ngModel)]="form.assignedToEmployeeId" name="assignedToEmployeeId" required>
            <mat-option *ngFor="let e of employees" [value]="e.id">{{e.firstName}} {{e.lastName}}</mat-option>
          </mat-select>
        </mat-form-field>
        <!-- Centered button below Description (second column) -->
        <div class="actions-center">
          <button mat-raised-button color="primary" type="submit" [disabled]="!form.title || !form.assignedToEmployeeId">Add Task</button>
        </div>
      </form>
    </div>

    <div class="table-wrapper colorful">
  <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z2 colorful-table">
        <!-- Title -->
        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>
            <mat-icon class="h-icon">task</mat-icon>
            <span>Title</span>
          </th>
          <td mat-cell *matCellDef="let t" [ngClass]="'row-' + statusClass(t.status)">
            <div class="title-cell">
              <mat-icon [ngClass]="['status-dot', statusClass(t.status)]">{{ statusIcon(t.status) }}</mat-icon>
              <span class="title-text" [matTooltip]="t.title">{{t.title}}</span>
            </div>
          </td>
        </ng-container>

        <!-- Description -->
        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>
            <mat-icon class="h-icon">notes</mat-icon>
            <span>Description</span>
          </th>
          <td mat-cell *matCellDef="let t">
            <span class="desc" [matTooltip]="t.description || ''">{{t.description || '-'}} </span>
          </td>
        </ng-container>

        <!-- Assigned To (manager only) -->
        <ng-container matColumnDef="assignedTo">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Assigned To </th>
          <td mat-cell *matCellDef="let t"> {{ assignedName(t.assignedToEmployeeId) }} </td>
        </ng-container>

        <!-- Status: Employee can edit, Manager sees read-only badge -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
          <td mat-cell *matCellDef="let t">
            <ng-container *ngIf="auth.role() === 'Employee'; else readOnlyStatus">
              <mat-form-field appearance="fill" class="status-select">
                <mat-label>Status</mat-label>
                <mat-select [(ngModel)]="t.status" (ngModelChange)="update(t)" name="status-{{t.id}}">
                  <mat-option value="Pending">Pending</mat-option>
                  <mat-option value="InProgress">In Progress</mat-option>
                  <mat-option value="Completed">Completed</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-chip-set class="status-chip-set">
                <mat-chip [ngClass]="['chip', statusClass(t.status)]" selected>{{ prettyStatus(t.status) }}</mat-chip>
              </mat-chip-set>
            </ng-container>
            <ng-template #readOnlyStatus>
              <mat-chip [ngClass]="['chip', statusClass(t.status)]" selected>{{ prettyStatus(t.status) }}</mat-chip>
            </ng-template>
          </td>
        </ng-container>

        <!-- Actions: Manager-only delete -->
        <ng-container *ngIf="auth.role() === 'Manager'" matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Actions </th>
          <td mat-cell *matCellDef="let t">
            <button mat-icon-button color="warn" aria-label="Delete task" (click)="delete(t)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        

        <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true" class="thead"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="trow" [ngClass]="'row-' + statusClass(row.status)"></tr>
        <tr class="empty" *ngIf="dataSource.data.length === 0">
          <td [attr.colspan]="displayedColumns.length">No tasks to show</td>
        </tr>
      </table>
      <mat-paginator [pageSize]="10" [pageSizeOptions]="[5,10,25]" showFirstLastButtons />
    </div>
  </mat-card>
  `
  ,
  styles: [`
    .card-header{ display:flex; align-items:center; gap:16px; justify-content:space-between; }
    .card-header h2{ margin-left: 12px; }
    .filters{ display:flex; gap:12px; align-items:center; }
    .filter-field{ width:220px; }
    .add-form{ margin-top: 12px; }
    .grid-form{ display:grid; grid-template-columns: 2fr 3fr 2fr; gap:12px; align-items:end; grid-auto-rows: auto; }
    .actions-center{ grid-column: 2; justify-self: center; align-self: start; margin-top: 4px; }
    .table-wrapper{ margin-top:12px; border-radius:12px; overflow:hidden; }
    .table-wrapper.colorful{ background: linear-gradient(180deg, rgba(25,118,210,0.06), rgba(25,118,210,0.02)); }
    table { width: 100%; border-collapse: separate; border-spacing: 0; }
    th.mat-header-cell, td.mat-cell{ padding: 12px 16px; }
    .thead th.mat-header-cell{ background: linear-gradient(180deg, rgba(25,118,210,0.15), rgba(25,118,210,0.05)); color: #0d47a1; font-weight: 700; border-bottom: 1px solid rgba(0,0,0,.08); }
    .h-icon{ font-size:18px; vertical-align: middle; margin-right:6px; }
    .trow:nth-child(even) td{ background: rgba(0,0,0,0.02); }
    .trow:hover td{ background: rgba(25,118,210,0.08); transition: background .2s ease; }
    .title-cell{ display:flex; align-items:center; gap:10px; }
    .title-text{ font-weight:600; }
    .desc{ color: rgba(0,0,0,.8); }
    tr.empty td { text-align:center; padding: 24px; color: rgba(0,0,0,.54); }
    .status-select { width: 180px; margin-right:8px; }
    .chip{ color:#fff; font-weight:700; }
    .chip.pending{ background:#f59e0b; }
    .chip.inprogress{ background:#3b82f6; }
    .chip.completed{ background:#10b981; }
    .status-dot{ font-size: 18px; width:18px; height:18px; border-radius:50%; }
    .status-dot.pending{ color:#f59e0b; }
    .status-dot.inprogress{ color:#3b82f6; }
    .status-dot.completed{ color:#10b981; }
    .row-pending td{ box-shadow: inset 3px 0 0 #f59e0b22; }
    .row-inprogress td{ box-shadow: inset 3px 0 0 #3b82f622; }
    .row-completed td{ box-shadow: inset 3px 0 0 #10b98122; }
    @media (max-width: 900px){
  .grid-form{ grid-template-columns: 1fr; }
  .actions-center{ grid-column: 1; }
      .filter-field{ width: 160px; }
    }
  `]
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  employees: Employee[] = [];
  form = { title: '', description: '', assignedToEmployeeId: 0 };
  private baseUrl = 'http://localhost:5278/api';
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<Task>([]);
  deletingIds = new Set<number>();
  search = '';
  statusFilter: '' | 'Pending' | 'InProgress' | 'Completed' = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient, public auth: AuthService, private dialog: MatDialog, private snack: MatSnackBar){}
  ngOnInit(){
    // Columns differ for manager (shows assignedTo)
    this.displayedColumns = this.auth.role() === 'Manager'
      ? ['title','description','assignedTo','status','actions']
      : ['title','description','status'];
    this.setupFilterPredicate();
    this.load();
  }

  ngAfterViewInit(){
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private setupFilterPredicate(){
    this.dataSource.filterPredicate = (data: Task, filter: string) => {
      const f = JSON.parse(filter) as { text: string; status: string };
      const textMatch = (data.title + ' ' + (data.description || '')).toLowerCase().includes(f.text);
      const statusMatch = !f.status || data.status === f.status;
      return textMatch && statusMatch;
    };
  }

  applyFilter(){
    const filt = { text: (this.search || '').trim().toLowerCase(), status: this.statusFilter };
    this.dataSource.filter = JSON.stringify(filt);
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }
  clearSearch(){ this.search = ''; this.applyFilter(); }

  load(){
    this.http.get<Task[]>(`${this.baseUrl}/Tasks`).subscribe(r => {
      this.tasks = r;
      this.dataSource.data = r;
      this.applyFilter();
    });
    if(this.auth.role() === 'Manager'){
      this.http.get<Employee[]>(`${this.baseUrl}/Employees`).subscribe(r => this.employees = r);
    }
  }
  add(){
    this.http.post<Task>(`${this.baseUrl}/Tasks`, this.form).subscribe(_ => {
      this.form = { title: '', description: '', assignedToEmployeeId: 0 };
      this.load();
    });
  }
  update(t: Task){
    this.http.put<Task>(`${this.baseUrl}/Tasks/${t.id}/status`, { status: t.status }).subscribe(_ => this.load());
  }
  delete(t: Task){
    if (!t || !t.id) {
      console.warn('Delete requested with invalid task payload:', t);
      this.snack.open('Cannot delete: missing task id.', 'Close', { duration: 3000 });
      return;
    }
    const titleStr = t.title?.trim() ? `"${t.title.trim()}"` : `#${t.id}`;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '560px',
      maxWidth: '90vw',
      data: {
        title: 'Delete task',
        message: `Delete task ${titleStr}? This cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        icon: 'delete',
        color: 'warn'
      }
    });
    ref.afterClosed().subscribe(ok => {
            if (!ok) return;
            this.deletingIds.add(t.id);
            const url = `${this.baseUrl}/Tasks/${t.id}`;
            console.log('Deleting task via', url, 'payload:', t);
            this.http.delete<void>(url).subscribe({
        next: () => {
          this.load();
          this.snack.open(`Task ${titleStr} deleted`, 'Close', { duration: 3000 });
        },
        error: err => {
          console.error('Delete failed', err);
          const status = err?.status;
          const serverMsg = (err?.error && typeof err.error === 'string') ? err.error : (err?.error?.message || '');
          let msg = 'Failed to delete task. Please try again.';
          if (status === 401) {
            msg = 'Session expired. Please log in again.';
          } else if (status === 403) {
            msg = 'Only managers can delete tasks.';
                } else if (status === 405) {
                  msg = 'Delete not allowed by server (HTTP 405). Please ensure the API is updated and running, then retry.';
          } else if (status === 404) {
            msg = 'Task not found (it may have been deleted already).';
          } else if (serverMsg) {
            msg = `Failed to delete task: ${serverMsg}`;
          } else if (status) {
            msg = `Failed to delete task (HTTP ${status}).`;
          }
          this.snack.open(msg, 'Close', { duration: 4500 });
          if (status === 401) {
            setTimeout(() => this.auth.logout(), 800);
          }
        },
              complete: () => this.deletingIds.delete(t.id)
      });
    });
  }
  prettyStatus(status: string){
    return status === 'InProgress' ? 'In Progress' : status;
  }
  statusClass(status: string){
    switch(status){
      case 'Completed': return 'completed';
      case 'InProgress': return 'inprogress';
      case 'Pending':
      default: return 'pending';
    }
  }
  statusIcon(status: string){
    switch(status){
      case 'Completed': return 'check_circle';
      case 'InProgress': return 'autorenew';
      case 'Pending':
      default: return 'schedule';
    }
  }
  
  assignedName(empId: number){
    if (!empId) return '-';
    const e = this.employees.find(x => x.id === empId);
    return e ? `${e.firstName} ${e.lastName}` : `#${empId}`;
  }
  logout(){ this.auth.logout(); }
}
