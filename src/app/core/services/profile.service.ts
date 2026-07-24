import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';
import { UpdatePasswordPayload, UpdateProfilePayload, UserProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = API_CONFIG.baseUrl;

  getProfile(): Observable<UserProfile> {
    return this.http
      .get<{ data: UserProfile }>(`${this.apiUrl}/user`)
      .pipe(map(response => response.data));
  }

  updateProfile(payload: UpdateProfilePayload): Observable<UserProfile> {
    return this.http
      .put<{ data: UserProfile }>(`${this.apiUrl}/user`, payload)
      .pipe(map(response => response.data));
  }

  updatePassword(payload: UpdatePasswordPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/user/password`, payload);
  }

  uploadAvatar(arquivo: File): Observable<string> {
    const formData = new FormData();
    formData.append('avatar', arquivo);

    return this.http
      .post<{ data: { avatar_url: string } }>(`${this.apiUrl}/user/avatar`, formData)
      .pipe(map(response => response.data.avatar_url));
  }
}
