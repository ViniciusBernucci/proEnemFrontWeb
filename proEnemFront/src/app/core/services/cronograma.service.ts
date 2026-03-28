import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, timeout } from 'rxjs/operators';
import { CronogramaPayload, CronogramaResponse, CronogramaListItem } from '../models/cronograma.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class CronogramaService {
  private http = inject(HttpClient);
  private apiUrl = API_CONFIG.baseUrl;

  criarCronograma(payload: CronogramaPayload): Observable<CronogramaResponse> {
    return this.http.post<{ data: CronogramaResponse; message: string }>(`${this.apiUrl}/cronogramas`, payload)
      .pipe(map(response => response.data));
  }

  listarCronogramas(): Observable<CronogramaListItem[]> {
    return this.http.get<{ data: CronogramaListItem[] }>(`${this.apiUrl}/cronogramas`)
      .pipe(
        timeout(8000),
        map(response => response.data ?? [])
      );
  }

  obterCronograma(id: number): Observable<CronogramaResponse> {
    return this.http.get<{ data: CronogramaResponse }>(`${this.apiUrl}/cronogramas/${id}`)
      .pipe(map(response => response.data));
  }

  deletarCronograma(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cronogramas/${id}`);
  }
}
