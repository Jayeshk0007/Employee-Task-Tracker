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
import { EditTaskDialogComponent } from './edit-task-dialog.component';

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
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
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
  edit(t: Task){
    const ref = this.dialog.open(EditTaskDialogComponent, { width: '560px', data: { id: t.id, title: t.title, description: t.description, assignedToEmployeeId: t.assignedToEmployeeId, employees: this.employees } });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      const payload = { title: result.title, description: result.description, assignedToEmployeeId: result.assignedToEmployeeId };
      this.http.put<Task>(`${this.baseUrl}/Tasks/${t.id}`, payload).subscribe({
        next: () => { this.snack.open('Task updated', 'Close', { duration: 2000 }); this.load(); },
        error: err => {
          console.error('Update failed', err);
          const status = err?.status;
          const serverMsg = (err?.error && typeof err.error === 'string') ? err.error : (err?.error?.message || '');
          let msg = 'Failed to update task.';
          if (serverMsg) msg += ` ${serverMsg}`;
          if (status) msg += ` (HTTP ${status})`;
          this.snack.open(msg, 'Close', { duration: 5000 });
          if (status === 401) setTimeout(() => this.auth.logout(), 800);
        }
      });
    });
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
