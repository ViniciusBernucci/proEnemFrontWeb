import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MeusDadosComponent } from './meus-dados/meus-dados.component';
import { MeuPlanoComponent } from './meu-plano/meu-plano.component';

type AbaConfiguracoes = 'meus-dados' | 'meu-plano';

@Component({
  selector: 'app-configuracoes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MeusDadosComponent, MeuPlanoComponent],
  templateUrl: './configuracoes.component.html',
  styleUrl: './configuracoes.component.scss',
})
export class ConfiguracoesComponent {
  readonly abaAtiva = signal<AbaConfiguracoes>('meus-dados');

  selecionarAba(aba: AbaConfiguracoes): void {
    this.abaAtiva.set(aba);
  }
}
