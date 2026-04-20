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
  isGeneratingPdf = false;

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

  toggleAtivo(event: Event, cronograma: CronogramaListItem): void {
    // Evita que o checkbox se altere visualmente antes da confirmação
    event.preventDefault();

    if (cronograma.ativo) return; // Ja esta ativo, nao faz nada

    const atual = this.cronogramas.find(c => c.ativo);
    if (atual) {
      const confirmar = confirm(`O cronograma "${atual.nome}" está atualmente ativo.\n\nAo ativar este novo, o método anterior será desabilitado no seu Tracker de Estudos. Você perderá temporariamente a visão do progresso antigo.\n\nDeseja continuar?`);
      if (!confirmar) return;
    }

    this.cronogramaService.ativarCronograma(cronograma.id).subscribe({
      next: () => {
        // Atualiza a lista localmente (Angular cuidará do render agora verdadeiro)
        this.cronogramas.forEach(c => {
          c.ativo = (c.id === cronograma.id);
        });
        alert(`Sucesso! O cronograma "${cronograma.nome}" agora é o seu plano de estudos principal no Tracker!`);
      },
      error: () => {
        alert('Erro ao ativar o cronograma. Tente novamente.');
      }
    });
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
      },
      error: () => {
        this.isGeneratingPdf = false;
        alert('Erro ao gerar o PDF. Verifique se o cronograma já foi renderizado pelas tarefas.');
      }
    });
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
