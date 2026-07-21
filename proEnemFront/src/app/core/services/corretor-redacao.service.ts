import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';

export interface CorrecaoRedacaoResultado {
  status: 'recebida';
  mensagem: string;
}

@Injectable({
  providedIn: 'root'
})
export class CorretorRedacaoService {
  private http = inject(HttpClient);

  enviarRedacao(arquivos: File[]): Observable<CorrecaoRedacaoResultado> {
    const resultado: CorrecaoRedacaoResultado = {
      status: 'recebida',
      mensagem: 'Sua redação foi recebida! A correção automática por IA ainda está em desenvolvimento e em breve trará sua nota e feedback detalhado por competência.'
    };
    return of(resultado).pipe(delay(1200));
  }
}
