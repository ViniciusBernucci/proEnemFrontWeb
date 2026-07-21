import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { CorretorRedacaoService, CorrecaoRedacaoResultado } from '../../../core/services/corretor-redacao.service';
import { Subject, takeUntil, finalize } from 'rxjs';

const EXTENSOES_ACEITAS = ['.pdf', '.doc', '.docx', '.txt'];

const ACCEPT = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  ...EXTENSOES_ACEITAS,
].join(',');

const TAMANHO_MAXIMO_BYTES = 10 * 1024 * 1024; // 10MB

@Component({
  selector: 'app-corretor-redacao',
  standalone: true,
  imports: [CommonModule, NgxDropzoneModule],
  templateUrl: './corretor-redacao.component.html',
  styleUrl: './corretor-redacao.component.scss'
})
export class CorretorRedacaoComponent implements OnDestroy {
  private corretorRedacaoService = inject(CorretorRedacaoService);
  private destroy$ = new Subject<void>();

  readonly extensoesAceitas = EXTENSOES_ACEITAS.join(', ');
  readonly accept = ACCEPT;
  readonly maxFileSize = TAMANHO_MAXIMO_BYTES;

  arquivos: File[] = [];
  erro: string | null = null;
  isEnviando = false;
  resultado: CorrecaoRedacaoResultado | null = null;

  onSelect(event: { addedFiles: File[]; rejectedFiles: File[] }) {
    this.erro = null;
    this.resultado = null;

    this.arquivos.push(...event.addedFiles);

    if (event.rejectedFiles.length > 0) {
      this.erro = 'Formato inválido. Envie apenas arquivos .docx, .pdf ou .txt de até 10MB.';
    }
  }

  onRemover(arquivo: File) {
    this.arquivos.splice(this.arquivos.indexOf(arquivo), 1);
    this.resultado = null;
  }

  enviarParaCorrecao() {
    if (this.arquivos.length === 0 || this.isEnviando) return;

    this.isEnviando = true;
    this.erro = null;
    this.resultado = null;

    this.corretorRedacaoService.enviarRedacao(this.arquivos)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isEnviando = false)
      )
      .subscribe({
        next: (resultado) => this.resultado = resultado,
        error: () => this.erro = 'Não foi possível enviar sua redação agora. Tente novamente em instantes.'
      });
  }

  formatarTamanho(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  iconeArquivo(arquivo: File): string {
    const nome = arquivo.name.toLowerCase();
    if (nome.endsWith('.pdf')) return 'ti-file-type-pdf';
    if (nome.endsWith('.doc') || nome.endsWith('.docx')) return 'ti-file-type-docx';
    return 'ti-file-text';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
