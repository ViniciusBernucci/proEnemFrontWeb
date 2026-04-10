import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
/* import { environment } from '../../../environments/environment'; */

export interface StudyTask {
  id: number;
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
  // private apiUrl = `${environment.apiUrl}/tracker`;

  // Mock data for initial presentation
  private mockTasks: StudyTask[] = [
    { id: 1, subject: 'Matemática', topic: 'Funções de 1º Grau', duration: 45, completed: true, date: new Date().toISOString().split('T')[0], type: 'video' },
    { id: 2, subject: 'Física', topic: 'Cinemática', duration: 60, completed: false, date: new Date().toISOString().split('T')[0], type: 'reading' },
    { id: 3, subject: 'Redação', topic: 'Estrutura Dissertativa', duration: 90, completed: false, date: new Date().toISOString().split('T')[0], type: 'exercise' },
    { id: 4, subject: 'Química', topic: 'Estequiometria', duration: 30, completed: true, date: this.getOffsetDate(-1), type: 'exercise' },
    { id: 5, subject: 'Biologia', topic: 'Citologia', duration: 40, completed: false, date: this.getOffsetDate(1), type: 'video' },
    { id: 6, subject: 'História', topic: 'Revolução Francesa', duration: 45, completed: false, date: this.getOffsetDate(2), type: 'reading' }
  ];

  private getOffsetDate(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  getTasks(startDate: string, endDate: string): Observable<StudyTask[]> {
    const filtered = this.mockTasks.filter(t => t.date >= startDate && t.date <= endDate);
    return of(filtered); // .pipe(delay(600));
  }

  toggleTaskCompletion(id: number, completed: boolean): Observable<StudyTask> {
    const task = this.mockTasks.find(t => t.id === id);
    if (task) {
      task.completed = completed;
      return of(task); // .pipe(delay(300));
    }
    throw new Error('Task not found');
  }
}
