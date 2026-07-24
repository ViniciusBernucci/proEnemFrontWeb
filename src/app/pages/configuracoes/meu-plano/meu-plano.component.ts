import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Plano } from '../../../core/models/plano.model';

const PLANO_ATUAL_MOCK: Plano = {
  nome: 'Gratuito',
  descricao: 'Acesso aos recursos essenciais para começar sua preparação para o ENEM.',
  preco: 'R$ 0,00',
  periodicidade: 'para sempre',
  dataRenovacao: null,
  recursos: [
    'Cronograma de estudos personalizado',
    'Registro de estudos e tracker de progresso',
    'Mentor de Estudos (chat)',
  ],
};

@Component({
  selector: 'app-meu-plano',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './meu-plano.component.html',
  styleUrl: './meu-plano.component.scss',
})
export class MeuPlanoComponent {
  readonly plano = PLANO_ATUAL_MOCK;
}
