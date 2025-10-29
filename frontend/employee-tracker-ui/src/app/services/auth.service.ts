import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface LoginRequest { email: string; password: string; }
interface LoginResponse { token: string; role: 'Manager'|'Employee'; email: string; employeeId?: number; }
interface RegisterRequest { email: string; password: string; role: 'Manager'|'Employee'; firstName?: string; lastName?: string; title?: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:5278/api';
  private _tokenKey = 'ett_token';
  private _roleKey = 'ett_role';

  constructor(private http: HttpClient) {}

  login(req: LoginRequest){
    return this.http.post<LoginResponse>(`${this.baseUrl}/Auth/login`, req);
  }
  register(req: RegisterRequest){
    return this.http.post<LoginResponse>(`${this.baseUrl}/Auth/register`, req);
  }
  setSession(resp: LoginResponse){
    localStorage.setItem(this._tokenKey, resp.token);
    localStorage.setItem(this._roleKey, resp.role);
  }
  clearSession(){
    localStorage.removeItem(this._tokenKey);
    localStorage.removeItem(this._roleKey);
  }
  logout(){
    this.clearSession();
    location.href = '/login';
  }
  token(){ return localStorage.getItem(this._tokenKey); }
  role(){ return localStorage.getItem(this._roleKey) as any; }

  private parseJwt(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch {
      return null;
    }
  }

  private isTokenValid(): boolean {
    const t = this.token();
    if (!t) return false;
    const payload = this.parseJwt(t);
    if (!payload || !payload.exp) return false;
    const expiresAt = payload.exp * 1000; // seconds -> ms
    return Date.now() < expiresAt;
  }

  isAuthenticated(){
    const valid = this.isTokenValid();
    if (!valid) {
      // clear any stale/expired token so guards redirect properly
      this.clearSession();
    }
    return valid;
  }
}
