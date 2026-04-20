import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

export interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  duration: number; // minutes
  completed: boolean;
  date: string; // YYYY-MM-DD
  type: 'video' | 'reading' | 'exercise'; 
}

@Injectable({
  providedIn: 'root'
})
export class TrackerService {
  private http = inject(HttpClient);
  private apiUrl = API_CONFIG.baseUrl;

  getTasks(startDate: string, endDate: string): Observable<StudyTask[]> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.http.get<{ data: StudyTask[] }>(`${this.apiUrl}/tracker/tasks`, { params })
      .pipe(map(response => response.data ?? []));
  }

  toggleTaskCompletion(id: string, completed: boolean): Observable<StudyTask> {
    return this.http.patch<{ data: StudyTask }>(`${this.apiUrl}/tracker/tasks/${id}/toggle`, {})
      .pipe(map(response => response.data));
  }
}
