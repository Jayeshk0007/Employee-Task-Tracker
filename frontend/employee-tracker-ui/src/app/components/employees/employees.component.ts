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
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
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
