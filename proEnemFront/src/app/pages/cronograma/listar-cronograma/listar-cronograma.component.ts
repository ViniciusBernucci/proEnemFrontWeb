import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CronogramaService } from '../../../core/services/cronograma.service';
import { CronogramaListItem } from '../../../core/models/cronograma.model';

@Component({
  selector: 'app-listar-cronograma',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listar-cronograma.component.html',
  styleUrl: './listar-cronograma.component.scss',
})
export class ListarCronogramaComponent implements OnInit {
  private cronogramaService = inject(CronogramaService);
  private router = inject(Router);

  cronogramas: CronogramaListItem[] = [];
  isLoading = true;
  errorMessage = '';

  // Cronograma selecionado para impressão (PDF)
  cronogramaSelecionadoPdf: CronogramaListItem | null = null;

  ngOnInit(): void {
    this.carregarCronogramas();
  }

  carregarCronogramas(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.cronogramaService.listarCronogramas()
      .subscribe({
        next: (data) => {
          this.cronogramas = data;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 404 || error.name === 'TimeoutError' || error.status === 0) {
            this.cronogramas = [];
          } else {
            this.errorMessage = error.error?.message ?? 'Erro ao carregar cronogramas.';
          }
        }
      });
  }

  verCronograma(id: number): void {
    this.router.navigate(['/simulados', id]);
  }

  deletarCronograma(cronograma: CronogramaListItem): void {
    const confirmar = confirm(`Deseja realmente excluir o cronograma "${cronograma.nome}"?`);
    if (!confirmar) return;

    this.cronogramaService.deletarCronograma(cronograma.id)
      .subscribe({
        next: () => {
          this.carregarCronogramas();
        },
        error: () => {
          alert('Erro ao excluir o cronograma. Tente novamente.');
        }
      });
  }

  gerarPdf(cronograma: CronogramaListItem): void {
    this.cronogramaSelecionadoPdf = cronograma;
    // Aguarda o DOM atualizar antes de imprimir
    setTimeout(() => {
      window.print();
      this.cronogramaSelecionadoPdf = null;
    }, 100);
  }

  novoCronograma(): void {
    this.router.navigate(['/simulados/criar']);
  }

  // Helpers de formatação
  formatarData(dataStr: string): string {
    if (!dataStr) return '—';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  formatarHoras(minutos: number): string {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    if (h === 0) return `${m}min/dia`;
    if (m === 0) return `${h}h/dia`;
    return `${h}h ${m}min/dia`;
  }

  formatarDias(dias: string[]): string {
    const mapa: Record<string, string> = {
      seg: 'Seg', ter: 'Ter', qua: 'Qua',
      qui: 'Qui', sex: 'Sex', sab: 'Sáb', dom: 'Dom'
    };
    return dias.map(d => mapa[d] ?? d).join(', ');
  }
}
