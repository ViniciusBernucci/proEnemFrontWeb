import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_at: string | null;
  user: AuthUser;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private _user  = signal<AuthUser | null>(this.loadUser());

  readonly isAuthenticated = computed(() => !!this._token());
  readonly currentUser     = computed(() => this._user());

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_CONFIG.baseUrl}/auth/login`, {
        email:    payload.email,
        password: payload.password,
        remember: payload.remember,
      })
      .pipe(
        tap(res => this.persist(res)),
        catchError(this.handleError),
      );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_CONFIG.baseUrl}/auth/register`, payload)
      .pipe(
        tap(res => this.persist(res)),
        catchError(this.handleError),
      );
  }

  logout(): void {
    const token = this._token();
    if (token) {
      this.http
        .post(`${API_CONFIG.baseUrl}/auth/logout`, {})
        .subscribe({
          next: () => this.clearSession(),
          error: () => this.clearSession(),
        });
    } else {
      this.clearSession();
    }
  }

  loginWithGoogle(): void {
    window.location.href = `${API_CONFIG.baseUrl}/auth/google/redirect`;
  }

  handleOAuthCallback(token: string, user: AuthUser): void {
    this._token.set(token);
    this._user.set(user);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getToken(): string | null {
    return this._token();
  }

  private persist(res: AuthResponse): void {
    this._token.set(res.access_token);
    this._user.set(res.user);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
  }

  private clearSession(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    let message = 'Ocorreu um erro. Tente novamente.';
    if (err.status === 401) {
      message = 'Email ou senha incorretos.';
    } else if (err.status === 422 && err.error?.fields) {
      const fields = err.error.fields as Record<string, string[]>;
      message = Object.values(fields).flat().join(' ');
    } else if (err.error?.message) {
      message = err.error.message;
    }
    return throwError(() => new Error(message));
  }
}
