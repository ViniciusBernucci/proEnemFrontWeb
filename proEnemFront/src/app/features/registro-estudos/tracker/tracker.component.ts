import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TrackerService, StudyTask } from '../../../core/services/tracker.service';
import { Subject, takeUntil, finalize } from 'rxjs';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.scss'
})
export class TrackerComponent implements OnInit, OnDestroy {
  private trackerService = inject(TrackerService);
  private destroy$ = new Subject<void>();

  viewMode: 'daily' | 'weekly' = 'daily';
  isLoading = false;
  error: string | null = null;

  dailyTasks: StudyTask[] = [];
  weeklyTasks: { date: string, tasks: StudyTask[] }[] = [];
  
  today = new Date().toISOString().split('T')[0];
  weekDates: string[] = [];
  selectedDate: string | null = null;

  ngOnInit(): void {
    this.calculateWeekDates();
    this.loadData();
  }

  calculateWeekDates() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day == 0 ? -6 : 1); // Monday is first day
    const monday = new Date(d.setDate(diff));
    
    this.weekDates = [];
    for (let i = 0; i < 7; i++) {
        const next = new Date(monday);
        next.setDate(monday.getDate() + i);
        this.weekDates.push(next.toISOString().split('T')[0]);
    }
  }

  loadData() {
    this.isLoading = true;
    this.error = null;

    const startDate = this.viewMode === 'daily' ? this.today : this.weekDates[0];
    const endDate = this.viewMode === 'daily' ? this.today : this.weekDates[6];

    this.trackerService.getTasks(startDate, endDate)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (tasks: StudyTask[]) => {
          if (this.viewMode === 'daily') {
             this.dailyTasks = tasks;
          } else {
             this.weeklyTasks = this.weekDates.map(date => ({
                date,
                tasks: tasks.filter((t: StudyTask) => t.date === date)
             }));
          }
        },
        error: (err: any) => {
           this.error = err?.error?.message || 'Erro ao carregar os dados do tracker.';
        }
      });
  }

  setViewMode(mode: 'daily' | 'weekly') {
    if (this.viewMode !== mode) {
      this.viewMode = mode;
      if (mode === 'weekly' && !this.selectedDate) {
        this.selectedDate = this.weekDates.includes(this.today) ? this.today : this.weekDates[0];
      }
      this.loadData();
    }
  }

  selectDate(date: string) {
    this.selectedDate = date;
  }

  getSelectedDayTasks(): StudyTask[] {
    const day = this.weeklyTasks.find(w => w.date === this.selectedDate);
    return day ? day.tasks : [];
  }

  toggleTask(task: StudyTask) {
    if (this.isLoading) return;
    const previousState = task.completed;
    task.completed = !previousState;

    if (task.completed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#818cf8', '#22c55e', '#facc15', '#ec4899']
      });
    }

    this.trackerService.toggleTaskCompletion(task.id, task.completed)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { /* optimistic update handled */ },
        error: () => {
           task.completed = previousState; // Revert
           this.error = 'Erro ao atualizar o status da tarefa';
        }
      });
  }

  getProgressPercentage(): number {
    const tasks = this.viewMode === 'daily' ? this.dailyTasks : this.weeklyTasks.flatMap(w => w.tasks);
    if (!tasks.length) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit' }).format(d);
  }

  getTypeLabel(type: string): string {
    switch(type) {
      case 'video': return 'Vídeo';
      case 'reading': return 'Leitura';
      case 'exercise': return 'Exercício';
      default: return 'Atividade';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
