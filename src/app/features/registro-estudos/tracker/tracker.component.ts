import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TrackerService, StudyTask } from '../../../core/services/tracker.service';
import { Subject, takeUntil, finalize } from 'rxjs';
import confetti from 'canvas-confetti';

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface DayTasks {
  date: string;
  tasks: StudyTask[];
}

interface MonthCell {
  date: string;
  dayNumber: number;
  isToday: boolean;
  tasks: StudyTask[];
}

interface MonthSummary {
  year: number;
  month: number;
  label: string;
  totalTasks: number;
  completedTasks: number;
  percentage: number;
}

@Component({
  selector: 'app-tracker',
  imports: [],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackerComponent implements OnInit, OnDestroy {
  private trackerService = inject(TrackerService);
  private destroy$ = new Subject<void>();

  private readonly loadedRanges = new Set<string>();
  private readonly tasks = signal<StudyTask[]>([]);
  private noActiveCronograma = signal(false);

  viewMode = signal<ViewMode>('daily');
  isLoading = signal(false);
  error = signal<string | null>(null);

  readonly today = this.formatToYYYYMMDD(new Date());
  readonly weekDates = this.buildWeekDates(new Date());

  monthAnchor = signal<Date>(this.startOfMonth(new Date()));
  yearAnchor = signal<number>(new Date().getFullYear());

  selectedWeekDate = signal<string | null>(null);
  selectedMonthDate = signal<string | null>(null);

  dailyTasks = computed(() => this.tasks().filter(task => task.date === this.today));

  weeklyTasks = computed<DayTasks[]>(() =>
    this.weekDates.map(date => ({
      date,
      tasks: this.tasks().filter(task => task.date === date)
    }))
  );

  selectedWeekDayTasks = computed(() => {
    const date = this.selectedWeekDate();
    const day = this.weeklyTasks().find(w => w.date === date);
    return day ? day.tasks : [];
  });

  monthLabel = computed(() =>
    this.capitalize(new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(this.monthAnchor()))
  );

  monthCells = computed<(MonthCell | null)[]>(() => {
    const anchor = this.monthAnchor();
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;
    const allTasks = this.tasks();

    const cells: (MonthCell | null)[] = [];

    for (let i = 0; i < leadingBlanks; i++) {
      cells.push(null);
    }

    for (let dayNumber = 1; dayNumber <= totalDaysInMonth; dayNumber++) {
      const date = this.formatToYYYYMMDD(new Date(year, month, dayNumber));
      cells.push({
        date,
        dayNumber,
        isToday: date === this.today,
        tasks: allTasks.filter(task => task.date === date)
      });
    }

    const trailingBlanks = (7 - (cells.length % 7)) % 7;
    for (let i = 0; i < trailingBlanks; i++) {
      cells.push(null);
    }

    return cells;
  });

  monthProgressPercentage = computed(() =>
    this.calculatePercentage(this.monthCells().flatMap(cell => cell?.tasks ?? []))
  );

  selectedMonthDayTasks = computed(() => {
    const date = this.selectedMonthDate();
    const cell = this.monthCells().find(c => c?.date === date);
    return cell ? cell.tasks : [];
  });

  yearMonths = computed<MonthSummary[]>(() => {
    const year = this.yearAnchor();
    const allTasks = this.tasks();

    return Array.from({ length: 12 }, (_, month) => {
      const monthTasks = allTasks.filter(task => {
        const taskDate = new Date(task.date + 'T00:00:00');
        return taskDate.getFullYear() === year && taskDate.getMonth() === month;
      });

      return {
        year,
        month,
        label: this.capitalize(new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(year, month, 1))),
        totalTasks: monthTasks.length,
        completedTasks: this.getCompletedCount(monthTasks),
        percentage: this.calculatePercentage(monthTasks)
      };
    });
  });

  yearProgressPercentage = computed(() =>
    this.calculatePercentage(this.yearMonths().flatMap(m =>
      this.tasks().filter(task => {
        const taskDate = new Date(task.date + 'T00:00:00');
        return taskDate.getFullYear() === m.year && taskDate.getMonth() === m.month;
      })
    ))
  );

  progressLabel = computed<string>(() => {
    switch (this.viewMode()) {
      case 'daily': return 'Progresso do Dia';
      case 'weekly': return 'Progresso da Semana';
      case 'monthly': return 'Progresso do Mês';
      case 'yearly': return 'Progresso do Ano';
    }
  });

  progressPercentage = computed<number>(() => {
    switch (this.viewMode()) {
      case 'daily': return this.calculatePercentage(this.dailyTasks());
      case 'weekly': return this.calculatePercentage(this.weeklyTasks().flatMap(day => day.tasks));
      case 'monthly': return this.monthProgressPercentage();
      case 'yearly': return this.yearProgressPercentage();
    }
  });

  ngOnInit(): void {
    this.loadRange(this.weekDates[0], this.weekDates[6], `week:${this.weekDates[0]}`);
  }

  setViewMode(mode: ViewMode): void {
    if (this.viewMode() === mode) return;
    this.viewMode.set(mode);

    if (mode === 'weekly' && !this.selectedWeekDate()) {
      this.selectedWeekDate.set(this.weekDates.includes(this.today) ? this.today : this.weekDates[0]);
    }

    if (mode === 'monthly') {
      this.ensureMonthLoaded(this.monthAnchor());
      if (!this.selectedMonthDate() && this.isCurrentMonth(this.monthAnchor())) {
        this.selectedMonthDate.set(this.today);
      }
    }

    if (mode === 'yearly') {
      this.ensureYearLoaded(this.yearAnchor());
    }
  }

  selectWeekDate(date: string): void {
    this.selectedWeekDate.set(date);
  }

  selectMonthDate(date: string): void {
    this.selectedMonthDate.set(date);
  }

  selectMonthFromYear(monthSummary: MonthSummary): void {
    const anchor = new Date(monthSummary.year, monthSummary.month, 1);
    this.monthAnchor.set(anchor);
    this.selectedMonthDate.set(this.isCurrentMonth(anchor) ? this.today : null);
    this.ensureMonthLoaded(anchor);
    this.viewMode.set('monthly');
  }

  goToPreviousMonth(): void {
    this.navigateMonth(-1);
  }

  goToNextMonth(): void {
    this.navigateMonth(1);
  }

  goToCurrentMonth(): void {
    const current = this.startOfMonth(new Date());
    this.monthAnchor.set(current);
    this.selectedMonthDate.set(this.today);
    this.ensureMonthLoaded(current);
  }

  goToPreviousYear(): void {
    this.navigateYear(-1);
  }

  goToNextYear(): void {
    this.navigateYear(1);
  }

  goToCurrentYear(): void {
    const year = new Date().getFullYear();
    this.yearAnchor.set(year);
    this.ensureYearLoaded(year);
  }

  private navigateMonth(offset: number): void {
    const anchor = this.monthAnchor();
    const next = new Date(anchor.getFullYear(), anchor.getMonth() + offset, 1);
    this.monthAnchor.set(next);
    this.selectedMonthDate.set(this.isCurrentMonth(next) ? this.today : null);
    this.ensureMonthLoaded(next);
  }

  private navigateYear(offset: number): void {
    const year = this.yearAnchor() + offset;
    this.yearAnchor.set(year);
    this.ensureYearLoaded(year);
  }

  private ensureMonthLoaded(anchor: Date): void {
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const startDate = this.formatToYYYYMMDD(new Date(year, month, 1));
    const endDate = this.formatToYYYYMMDD(new Date(year, month + 1, 0));
    this.loadRange(startDate, endDate, `month:${year}-${month}`);
  }

  private ensureYearLoaded(year: number): void {
    const startDate = this.formatToYYYYMMDD(new Date(year, 0, 1));
    const endDate = this.formatToYYYYMMDD(new Date(year, 11, 31));
    this.loadRange(startDate, endDate, `year:${year}`);
  }

  private isCurrentMonth(date: Date): boolean {
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }

  private loadRange(startDate: string, endDate: string, rangeKey: string): void {
    if (this.loadedRanges.has(rangeKey) || this.noActiveCronograma()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.trackerService.getTasks(startDate, endDate)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (fetchedTasks: StudyTask[]) => {
          this.loadedRanges.add(rangeKey);
          this.mergeTasks(fetchedTasks);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 404) {
            this.noActiveCronograma.set(true);
            this.error.set('Você ainda não ativou nenhum cronograma. Vá na listagem de Cronogramas e ative um para acompanhar seus estudos.');
          } else {
            this.error.set(err?.error?.message || 'Erro ao carregar os dados do tracker.');
          }
        }
      });
  }

  private mergeTasks(fetchedTasks: StudyTask[]): void {
    this.tasks.update(current => {
      const byId = new Map(current.map(task => [task.id, task]));
      for (const task of fetchedTasks) {
        byId.set(task.id, task);
      }
      return Array.from(byId.values());
    });
  }

  toggleTask(task: StudyTask): void {
    if (this.isLoading()) return;
    const previousCompleted = task.completed;
    const nextCompleted = !previousCompleted;

    this.setTaskCompleted(task.id, nextCompleted);

    if (nextCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#818cf8', '#22c55e', '#facc15', '#ec4899']
      });
    }

    this.trackerService.toggleTaskCompletion(task.id, nextCompleted)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { /* optimistic update já aplicado */ },
        error: () => {
          this.setTaskCompleted(task.id, previousCompleted);
          this.error.set('Erro ao atualizar o status da tarefa');
        }
      });
  }

  private setTaskCompleted(taskId: string, completed: boolean): void {
    this.tasks.update(current => current.map(task => task.id === taskId ? { ...task, completed } : task));
  }

  getCompletedCount(tasks: StudyTask[]): number {
    return tasks.filter(task => task.completed).length;
  }

  private calculatePercentage(tasks: StudyTask[]): number {
    if (!tasks.length) return 0;
    return Math.round((this.getCompletedCount(tasks) / tasks.length) * 100);
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit' }).format(d);
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'video': return 'Vídeo';
      case 'reading': return 'Leitura';
      case 'exercise': return 'Exercício';
      default: return 'Atividade';
    }
  }

  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  private formatToYYYYMMDD(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private buildWeekDates(reference: Date): string[] {
    const d = new Date(reference);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday é o primeiro dia
    const monday = new Date(d.setDate(diff));

    return Array.from({ length: 7 }, (_, i) => {
      const next = new Date(monday);
      next.setDate(monday.getDate() + i);
      return this.formatToYYYYMMDD(next);
    });
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
