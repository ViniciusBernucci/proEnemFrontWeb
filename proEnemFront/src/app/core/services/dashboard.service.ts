import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

export interface DashboardStats {
  nome_usuario: string;
  dias_para_enem: number;
  meta_hoje: number;
  meta_semana: number;
  estudados_semana: number;
  ultimo_simulado: string | number;
  weekly_chart: number[];
  monthly_chart: number[];
  subject_chart: { series: number[], labels: string[] };
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = API_CONFIG.baseUrl;

  getStats(): Observable<DashboardStats> {
    return this.http.get<{ data: DashboardStats }>(`${this.apiUrl}/dashboard/stats`)
      .pipe(map(response => response.data));
  }
}
