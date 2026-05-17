import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CronogramaService } from '../../../core/services/cronograma.service';
import { CronogramaResponse, CronogramaJson, DiaCronograma } from '../../../core/models/cronograma.model';

interface MesGroup {
  chave: string;
  titulo: string;
  dias: DiaCronograma[];
}

@Component({
  selector: 'app-visualizar-cronograma',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualizar-cronograma.component.html',
  styleUrl: './visualizar-cronograma.component.scss',
})
export class VisualizarCronogramaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cronogramaService = inject(CronogramaService);
  private cdr = inject(ChangeDetectorRef);

  cronograma: CronogramaResponse | null = null;
  json: CronogramaJson | null = null;
  diasPorMes: MesGroup[] = [];
  isLoading = true;
  errorMessage = '';
  mesesExpandidos = new Set<string>();

  private readonly DISCIPLINA_LABELS: Record<string, string> = {
    matematica: 'Matemática', portugues: 'Português', literatura: 'Literatura',
    ingles: 'Inglês', espanhol: 'Espanhol', redacao: 'Redação',
    fisica: 'Física', quimica: 'Química', biologia: 'Biologia',
    historia: 'História', geografia: 'Geografia', filosofia: 'Filosofia',
    sociologia: 'Sociologia', simulado: 'Simulado',
  };

  private readonly PALETTE = [
    '#6366f1', '#3b82f6', '#0ea5e9', '#10b981', '#f59e0b',
    '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
    '#84cc16', '#06b6d4', '#a855f7',
  ];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cronogramaService.obterCronograma(id).subscribe({
      next: (data) => {
        this.cronograma = data;
        this.json = data.cronograma_json ?? null;
        this.diasPorMes = this.agruparPorMes(this.json?.cronograma ?? []);
        if (this.diasPorMes.length > 0) {
          this.mesesExpandidos.add(this.diasPorMes[0].chave);
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message ?? 'Não foi possível carregar o cronograma.';
        this.cdr.markForCheck();
      },
    });
  }

  private agruparPorMes(dias: DiaCronograma[]): MesGroup[] {
    const meses = new Map<string, MesGroup>();
    for (const dia of dias) {
      const [ano, mes] = dia.data.split('-');
      const chave = `${ano}-${mes}`;
      if (!meses.has(chave)) {
        const d = new Date(Number(ano), Number(mes) - 1, 1);
        const titulo = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        meses.set(chave, {
          chave,
          titulo: titulo.charAt(0).toUpperCase() + titulo.slice(1),
          dias: [],
        });
      }
      meses.get(chave)!.dias.push(dia);
    }
    return Array.from(meses.values());
  }

  toggleMes(chave: string): void {
    if (this.mesesExpandidos.has(chave)) {
      this.mesesExpandidos.delete(chave);
    } else {
      this.mesesExpandidos.add(chave);
    }
    this.cdr.markForCheck();
  }

  isMesExpandido(chave: string): boolean {
    return this.mesesExpandidos.has(chave);
  }

  scrollToMes(chave: string): void {
    this.mesesExpandidos.add(chave);
    this.cdr.markForCheck();
    setTimeout(() => {
      document.getElementById(`mes-${chave}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  get slotsRevisao(): number {
    const r = this.json?.resumo;
    if (!r) return 0;
    return Math.max(0, r.total_slots - r.slots_conteudo - r.slots_simulados - r.slots_redacao);
  }

  get horasPorDia(): string {
    const min = this.cronograma?.minutos_estudo_por_dia ?? 0;
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  }

  voltar(): void {
    this.router.navigate(['/simulados/listar']);
  }

  formatarData(dataStr: string | undefined): string {
    if (!dataStr) return '—';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  diaDaData(dataStr: string): string {
    return dataStr.split('-')[2] ?? '';
  }

  formatarDiaSemana(dia: string): string {
    const mapa: Record<string, string> = {
      domingo: 'Dom', segunda: 'Seg', 'segunda-feira': 'Seg',
      terca: 'Ter', 'terça': 'Ter', 'terça-feira': 'Ter',
      quarta: 'Qua', 'quarta-feira': 'Qua',
      quinta: 'Qui', 'quinta-feira': 'Qui',
      sexta: 'Sex', 'sexta-feira': 'Sex',
      sabado: 'Sáb', 'sábado': 'Sáb',
    };
    return mapa[dia.toLowerCase()] ?? dia.substring(0, 3);
  }

  formatarDisciplina(slug: string): string {
    return this.DISCIPLINA_LABELS[slug] ?? slug;
  }

  labelTipo(tipo: string): string {
    const mapa: Record<string, string> = {
      conteudo_novo: 'Novo', revisao: 'Revisão',
      simulado: 'Simulado', redacao: 'Redação',
    };
    return mapa[tipo] ?? tipo;
  }

  disciplineColor(index: number): string {
    return this.PALETTE[index % this.PALETTE.length];
  }

  mesAbreviation(titulo: string): string {
    return titulo.split(' ')[0];
  }
}
