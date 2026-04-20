import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CronogramaService } from '../../../core/services/cronograma.service';
import { CronogramaListItem } from '../../../core/models/cronograma.model';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  detail: string;
}

export interface ConfirmConfig {
  title: string;
  message: string;
  confirmLabel: string;
  confirmStyle: 'danger' | 'primary';
  onConfirm: () => void;
}

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
  private cdr = inject(ChangeDetectorRef);

  cronogramas: CronogramaListItem[] = [];
  isLoading = true;
  errorMessage = '';
  isGeneratingPdf = false;

  toasts: ToastMessage[] = [];
  private toastCounter = 0;

  confirmConfig: ConfirmConfig | null = null;

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
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 404 || error.name === 'TimeoutError' || error.status === 0) {
            this.cronogramas = [];
          } else {
            this.errorMessage = error.error?.message ?? 'Erro ao carregar cronogramas.';
          }
          this.cdr.markForCheck();
        }
      });
  }

  verCronograma(id: number): void {
    this.router.navigate(['/simulados', id]);
  }

  deletarCronograma(cronograma: CronogramaListItem): void {
    this.confirmConfig = {
      title: 'Excluir cronograma',
      message: `Deseja realmente excluir o cronograma <strong>${cronograma.nome}</strong>? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      confirmStyle: 'danger',
      onConfirm: () => {
        this.cronogramaService.deletarCronograma(cronograma.id).subscribe({
          next: () => {
            this.showToast('success', 'Cronograma excluído', `"${cronograma.nome}" foi removido com sucesso.`);
            this.carregarCronogramas();
          },
          error: () => {
            this.showToast('error', 'Erro ao excluir', 'Não foi possível excluir o cronograma. Tente novamente.');
          }
        });
      }
    };
    this.cdr.markForCheck();
  }

  toggleAtivo(event: Event, cronograma: CronogramaListItem): void {
    event.preventDefault();
    if (cronograma.ativo) return;

    const atual = this.cronogramas.find(c => c.ativo);

    const doAtivacao = () => {
      this.cronogramaService.ativarCronograma(cronograma.id).subscribe({
        next: () => {
          this.cronogramas = this.cronogramas.map(c => ({ ...c, ativo: c.id === cronograma.id }));
          this.showToast('success', 'Cronograma ativado!', `"${cronograma.nome}" agora é seu plano de estudos principal no Tracker.`);
        },
        error: () => {
          this.showToast('error', 'Erro ao ativar', 'Não foi possível ativar o cronograma. Tente novamente.');
        }
      });
    };

    if (atual) {
      this.confirmConfig = {
        title: 'Trocar cronograma ativo',
        message: `O cronograma <strong>${atual.nome}</strong> está ativo no momento.<br><br>Ao ativar este novo, o anterior será desabilitado no Tracker e você perderá temporariamente a visão do progresso antigo.`,
        confirmLabel: 'Sim, ativar',
        confirmStyle: 'primary',
        onConfirm: doAtivacao
      };
      this.cdr.markForCheck();
    } else {
      doAtivacao();
    }
  }

  gerarPdf(cronograma: CronogramaListItem): void {
    if (this.isGeneratingPdf) return;
    this.isGeneratingPdf = true;

    this.cronogramaService.exportarPdf(cronograma.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cronograma_${cronograma.nome.replace(/\s+/g, '_').toLowerCase()}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isGeneratingPdf = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isGeneratingPdf = false;
        this.showToast('error', 'Erro ao gerar PDF', 'Verifique se o cronograma já foi renderizado pelas tarefas.');
        this.cdr.markForCheck();
      }
    });
  }

  novoCronograma(): void {
    this.router.navigate(['/simulados/criar']);
  }

  dismissConfirm(): void {
    this.confirmConfig = null;
    this.cdr.markForCheck();
  }

  acceptConfirm(): void {
    if (!this.confirmConfig) return;
    const fn = this.confirmConfig.onConfirm;
    this.confirmConfig = null;
    fn();
  }

  showToast(type: ToastMessage['type'], title: string, detail: string): void {
    const id = ++this.toastCounter;
    this.toasts = [...this.toasts, { id, type, title, detail }];
    this.cdr.markForCheck();
    setTimeout(() => this.removeToast(id), 4000);
  }

  removeToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.markForCheck();
  }

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
