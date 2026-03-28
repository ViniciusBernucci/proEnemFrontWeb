import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DisciplinaItem } from '../models/disciplina.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class DisciplinaService {
  private http = inject(HttpClient);
  private apiUrl = API_CONFIG.baseUrl;

  listarDisciplinas(): Observable<DisciplinaItem[]> {
    return this.http
      .get<{ data: DisciplinaItem[] }>(`${this.apiUrl}/disciplinas`)
      .pipe(map(response => response.data ?? []));
  }
}
