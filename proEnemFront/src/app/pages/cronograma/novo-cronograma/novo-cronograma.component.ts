import { Component, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { CronogramaService } from '../../../core/services/cronograma.service';
import { CronogramaPayload } from '../../../core/models/cronograma.model';

interface Disciplina {
  nome: string;
  area: string;
  selecionada: boolean;
}

@Component({
  selector: 'app-novo-cronograma',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './novo-cronograma.component.html',
  styleUrl: './novo-cronograma.component.scss',
})
export class NovoCronogramaComponent {
  private cronogramaService = inject(CronogramaService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  etapaAtual = 1;
  totalEtapas = 5;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  errorMessages: string[] = [];

  // Nome do cronograma
  nomeCronograma = '';

  // Etapa 1 - Período
  dataInicio = '';
  dataFim = '';

  // Etapa 2 - Dias da semana
  diasSemana = [
    { label: 'Segunda', valor: 'seg', selecionado: false },
    { label: 'Terça', valor: 'ter', selecionado: false },
    { label: 'Quarta', valor: 'qua', selecionado: false },
    { label: 'Quinta', valor: 'qui', selecionado: false },
    { label: 'Sexta', valor: 'sex', selecionado: false },
    { label: 'Sábado', valor: 'sab', selecionado: false },
    { label: 'Domingo', valor: 'dom', selecionado: false },
  ];
  estudarFeriados = false;
  tirarFerias = false;

  // Etapa 4 - Carga horária
  minutosEstudoPorDia = 120;

  get horasEstudoLabel(): string {
    const h = Math.floor(this.minutosEstudoPorDia / 60);
    const m = this.minutosEstudoPorDia % 60;
    if (h === 0) return `${m} minutos`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  }

  // Etapa 3 - Disciplinas
  disciplinas: Disciplina[] = [
    { nome: 'Matemática', area: 'Matemática e suas Tecnologias', selecionada: false },
    { nome: 'Língua Portuguesa', area: 'Linguagens, Códigos e suas Tecnologias', selecionada: false },
    { nome: 'Literatura', area: 'Linguagens, Códigos e suas Tecnologias', selecionada: false },
    { nome: 'Inglês', area: 'Linguagens, Códigos e suas Tecnologias', selecionada: false },
    { nome: 'Espanhol', area: 'Linguagens, Códigos e suas Tecnologias', selecionada: false },
    { nome: 'Redação', area: 'Linguagens, Códigos e suas Tecnologias', selecionada: false },
    { nome: 'Física', area: 'Ciências da Natureza e suas Tecnologias', selecionada: false },
    { nome: 'Química', area: 'Ciências da Natureza e suas Tecnologias', selecionada: false },
    { nome: 'Biologia', area: 'Ciências da Natureza e suas Tecnologias', selecionada: false },
    { nome: 'História', area: 'Ciências Humanas e suas Tecnologias', selecionada: false },
    { nome: 'Geografia', area: 'Ciências Humanas e suas Tecnologias', selecionada: false },
    { nome: 'Filosofia', area: 'Ciências Humanas e suas Tecnologias', selecionada: false },
    { nome: 'Sociologia', area: 'Ciências Humanas e suas Tecnologias', selecionada: false },
  ];

  get areas(): string[] {
    return [...new Set(this.disciplinas.map((d) => d.area))];
  }

  disciplinasPorArea(area: string): Disciplina[] {
    return this.disciplinas.filter((d) => d.area === area);
  }

  get disciplinasSelecionadas(): Disciplina[] {
    return this.disciplinas.filter((d) => d.selecionada);
  }

  get diasSelecionados() {
    return this.diasSemana.filter((d) => d.selecionado);
  }

  get diasSelecionadosLabel(): string {
    return this.diasSelecionados.map((d) => d.label).join(', ');
  }

  get disciplinasSelecionadasNomes(): string {
    return this.disciplinasSelecionadas.map((d) => d.nome).join(', ');
  }

  etapaConcluida(etapa: number): boolean {
    return etapa < this.etapaAtual;
  }

  etapaAtiva(etapa: number): boolean {
    return etapa === this.etapaAtual;
  }

  podeProsseguir(): boolean {
    switch (this.etapaAtual) {
      case 1:
        return !!this.nomeCronograma.trim() && !!this.dataInicio && !!this.dataFim && this.dataFim >= this.dataInicio;
      case 2:
        return this.diasSelecionados.length > 0;
      case 3:
        return this.disciplinasSelecionadas.length > 0;
      case 4:
        return true;
      default:
        return true;
    }
  }

  proximaEtapa(): void {
    if (this.etapaAtual < this.totalEtapas && this.podeProsseguir()) {
      this.etapaAtual++;
    }
  }

  etapaAnterior(): void {
    if (this.etapaAtual > 1) {
      this.etapaAtual--;
    }
  }

  gerarCronograma(): void {
    if (!this.podeProsseguir()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.errorMessages = [];

    const payload: CronogramaPayload = {
      nome: this.nomeCronograma.trim(),
      data_inicio: this.dataInicio,
      data_fim: this.dataFim,
      dias_semana: this.diasSelecionados.map(d => d.valor),
      estudar_feriados: this.estudarFeriados,
      tirar_ferias: this.tirarFerias,
      disciplinas_selecionadas: this.disciplinasSelecionadas.map(d => d.nome),
      minutos_estudo_por_dia: this.minutosEstudoPorDia,
    };

    this.cronogramaService.criarCronograma(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Cronograma criado com sucesso!';
          setTimeout(() => this.router.navigate(['/cronograma']), 1500);
        },
        error: (error) => {
          if (error.status === 422 && error.error?.errors) {
            this.errorMessages = Object.values(error.error.errors).flat() as string[];
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Erro ao salvar cronograma. Tente novamente.';
          }
        }
      });
  }
}
