import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { VisualizarCronogramaComponent } from './visualizar-cronograma.component';
import { CronogramaService } from '../../../core/services/cronograma.service';
import { CronogramaResponse, CronogramaJson } from '../../../core/models/cronograma.model';

// ─── Factories ────────────────────────────────────────────────────────────────

function makeCronogramaJson(overrides: Partial<CronogramaJson> = {}): CronogramaJson {
  return {
    sucesso: true,
    resumo: {
      periodo: { data_inicio: '2025-01-01', data_fim: '2025-03-31', horas_por_dia: 3 },
      total_dias_estudo: 60,
      total_slots: 120,
      slots_conteudo: 80,
      slots_simulados: 10,
      slots_redacao: 10,
      total_simulados: 10,
      total_redacoes: 10,
      total_topicos_incluidos: 50,
      disciplinas: [
        {
          slug: 'matematica',
          slots_alocados: 30,
          peso_bruto: 5,
          fracao_percentual: '25%',
          topicos_incluidos: 15,
          topicos_excluidos: 2,
          topicos_excluidos_lista: [],
        },
      ],
    },
    cronograma: [
      {
        data: '2025-01-10',
        dia_semana: 'sexta-feira',
        aulas: [
          { slot: 1, disciplina: 'matematica', topico_id: 1, topico: 'Funções', tipo: 'conteudo_novo', score: 0.9 },
        ],
      },
      {
        data: '2025-01-15',
        dia_semana: 'quarta',
        aulas: [
          { slot: 1, disciplina: 'fisica', topico_id: 2, topico: 'Cinemática', tipo: 'revisao', score: 0.7 },
        ],
      },
      {
        data: '2025-02-05',
        dia_semana: 'quarta',
        aulas: [
          { slot: 1, disciplina: 'historia', topico_id: 3, topico: 'Revolução Francesa', tipo: 'conteudo_novo', score: 0.8 },
        ],
      },
    ],
    alertas: [],
    ...overrides,
  };
}

function makeCronogramaResponse(overrides: Partial<CronogramaResponse> = {}): CronogramaResponse {
  return {
    id: 1,
    nome: 'Meu Cronograma',
    data_inicio: '2025-01-01',
    data_fim: '2025-03-31',
    dias_semana: ['seg', 'qua', 'sex'],
    estudar_feriados: false,
    tirar_ferias: false,
    disciplinas_selecionadas: ['matematica', 'fisica'],
    minutos_estudo_por_dia: 180,
    ativo: true,
    cronograma_json: makeCronogramaJson(),
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

describe('VisualizarCronogramaComponent', () => {
  let component: VisualizarCronogramaComponent;
  let fixture: ComponentFixture<VisualizarCronogramaComponent>;
  let cronogramaServiceSpy: { obterCronograma: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function setup(serviceReturn: Observable<any>) {
    cronogramaServiceSpy = { obterCronograma: vi.fn().mockReturnValue(serviceReturn) };
    routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [VisualizarCronogramaComponent],
      providers: [
        { provide: CronogramaService, useValue: cronogramaServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VisualizarCronogramaComponent);
    component = fixture.componentInstance;
  }

  // ─── 1. Estado inicial ───────────────────────────────────────────────────────

  describe('estado inicial', () => {
    it('deve iniciar com isLoading = true antes do observable resolver', async () => {
      // Usa um observable que nunca emite para capturar o estado antes da resposta
      const neverResolves$ = new Observable<CronogramaResponse>(() => {});
      await setup(neverResolves$);

      // Não chama detectChanges — queremos o estado antes do ngOnInit ter resposta
      expect(component.isLoading).toBe(true);
      expect(component.cronograma).toBeNull();
      expect(component.json).toBeNull();
      expect(component.diasPorMes).toEqual([]);
      expect(component.errorMessage).toBe('');
    });
  });

  // ─── 2. Carregamento com sucesso ─────────────────────────────────────────────

  describe('carregamento com sucesso', () => {
    beforeEach(async () => {
      const resposta = makeCronogramaResponse();
      await setup(of(resposta));
      fixture.detectChanges();
    });

    it('deve preencher cronograma e json apos a resposta do servico', () => {
      expect(component.cronograma).not.toBeNull();
      expect(component.cronograma?.id).toBe(1);
      expect(component.json).not.toBeNull();
      expect(component.json?.sucesso).toBe(true);
    });

    it('deve desligar isLoading apos receber os dados', () => {
      expect(component.isLoading).toBe(false);
    });

    it('deve agrupar os dias em dois meses distintos (janeiro e fevereiro)', () => {
      // makeCronogramaJson tem 2 dias em 2025-01 e 1 dia em 2025-02
      expect(component.diasPorMes).toHaveLength(2);
      expect(component.diasPorMes[0].chave).toBe('2025-01');
      expect(component.diasPorMes[0].dias).toHaveLength(2);
      expect(component.diasPorMes[1].chave).toBe('2025-02');
      expect(component.diasPorMes[1].dias).toHaveLength(1);
    });

    it('deve expandir automaticamente o primeiro mes apos carregar', () => {
      expect(component.isMesExpandido('2025-01')).toBe(true);
      expect(component.isMesExpandido('2025-02')).toBe(false);
    });

    it('deve chamar obterCronograma com o id correto extraido da rota', () => {
      expect(cronogramaServiceSpy.obterCronograma).toHaveBeenCalledWith(1);
    });
  });

  // ─── 3. Erro na requisicao ───────────────────────────────────────────────────

  describe('erro na requisicao', () => {
    it('deve preencher errorMessage com a mensagem da API quando disponivel', async () => {
      const erro = { error: { message: 'Cronograma não encontrado.' } };
      await setup(throwError(() => erro));
      fixture.detectChanges();

      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('Cronograma não encontrado.');
    });

    it('deve usar mensagem generica quando a API nao retorna message no erro', async () => {
      await setup(throwError(() => ({ error: {} })));
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Não foi possível carregar o cronograma.');
    });

    it('deve usar mensagem generica quando o erro nao tem propriedade error', async () => {
      await setup(throwError(() => ({})));
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Não foi possível carregar o cronograma.');
    });
  });

  // ─── 4. toggleMes ───────────────────────────────────────────────────────────

  describe('toggleMes', () => {
    beforeEach(async () => {
      await setup(of(makeCronogramaResponse()));
      fixture.detectChanges();
    });

    it('deve colapsar um mes que esta expandido', () => {
      // '2025-01' ja esta expandido pelo ngOnInit
      component.toggleMes('2025-01');
      expect(component.isMesExpandido('2025-01')).toBe(false);
    });

    it('deve expandir um mes que estava colapsado', () => {
      // '2025-02' começa colapsado
      component.toggleMes('2025-02');
      expect(component.isMesExpandido('2025-02')).toBe(true);
    });

    it('deve ser idempotente ao alternar duas vezes o mesmo mes', () => {
      component.toggleMes('2025-02');
      component.toggleMes('2025-02');
      expect(component.isMesExpandido('2025-02')).toBe(false);
    });
  });

  // ─── 5. slotsRevisao getter ──────────────────────────────────────────────────

  describe('slotsRevisao', () => {
    describe('com json preenchido', () => {
      beforeEach(async () => {
        await setup(of(makeCronogramaResponse()));
        fixture.detectChanges();
      });

      it('deve calcular slots de revisao como total menos conteudo, simulados e redacao', () => {
        // total=120, conteudo=80, simulados=10, redacao=10 → revisao=20
        expect(component.slotsRevisao).toBe(20);
      });
    });

    describe('quando cronograma_json e undefined', () => {
      beforeEach(async () => {
        await setup(of(makeCronogramaResponse({ cronograma_json: undefined })));
        fixture.detectChanges();
      });

      it('deve retornar 0 quando json e nulo', () => {
        expect(component.slotsRevisao).toBe(0);
      });
    });

    describe('quando slots excedem o total', () => {
      beforeEach(async () => {
        const json = makeCronogramaJson({
          resumo: {
            ...makeCronogramaJson().resumo,
            total_slots: 10,
            slots_conteudo: 8,
            slots_simulados: 5,
            slots_redacao: 5,
          },
        });
        await setup(of(makeCronogramaResponse({ cronograma_json: json })));
        fixture.detectChanges();
      });

      it('deve retornar 0 e nunca valor negativo', () => {
        expect(component.slotsRevisao).toBe(0);
      });
    });
  });

  // ─── 6. horasPorDia getter ───────────────────────────────────────────────────

  describe('horasPorDia', () => {
    it('deve retornar "0min" quando minutos_estudo_por_dia e zero', async () => {
      await setup(of(makeCronogramaResponse({ minutos_estudo_por_dia: 0 })));
      fixture.detectChanges();
      expect(component.horasPorDia).toBe('0min');
    });

    it('deve retornar "1h" quando minutos_estudo_por_dia e 60', async () => {
      await setup(of(makeCronogramaResponse({ minutos_estudo_por_dia: 60 })));
      fixture.detectChanges();
      expect(component.horasPorDia).toBe('1h');
    });

    it('deve retornar "1h 30min" quando minutos_estudo_por_dia e 90', async () => {
      await setup(of(makeCronogramaResponse({ minutos_estudo_por_dia: 90 })));
      fixture.detectChanges();
      expect(component.horasPorDia).toBe('1h 30min');
    });

    it('deve retornar "3h" quando minutos_estudo_por_dia e 180', async () => {
      await setup(of(makeCronogramaResponse({ minutos_estudo_por_dia: 180 })));
      fixture.detectChanges();
      expect(component.horasPorDia).toBe('3h');
    });

    it('deve retornar "45min" quando minutos_estudo_por_dia e 45', async () => {
      await setup(of(makeCronogramaResponse({ minutos_estudo_por_dia: 45 })));
      fixture.detectChanges();
      expect(component.horasPorDia).toBe('45min');
    });

    it('deve retornar "0min" quando cronograma e nulo (fallback para 0)', async () => {
      // Simula service retornando erro para cronograma ficar null
      await setup(throwError(() => ({})));
      fixture.detectChanges();
      expect(component.horasPorDia).toBe('0min');
    });
  });

  // ─── 7. formatarDisciplina ──────────────────────────────────────────────────

  describe('formatarDisciplina', () => {
    beforeEach(async () => {
      await setup(of(makeCronogramaResponse()));
    });

    it.each([
      ['matematica', 'Matemática'],
      ['portugues', 'Português'],
      ['literatura', 'Literatura'],
      ['ingles', 'Inglês'],
      ['espanhol', 'Espanhol'],
      ['redacao', 'Redação'],
      ['fisica', 'Física'],
      ['quimica', 'Química'],
      ['biologia', 'Biologia'],
      ['historia', 'História'],
      ['geografia', 'Geografia'],
      ['filosofia', 'Filosofia'],
      ['sociologia', 'Sociologia'],
      ['simulado', 'Simulado'],
    ])('deve mapear "%s" para "%s"', (slug, esperado) => {
      expect(component.formatarDisciplina(slug)).toBe(esperado);
    });

    it('deve retornar o proprio slug quando nao ha mapeamento', () => {
      expect(component.formatarDisciplina('slug-desconhecido')).toBe('slug-desconhecido');
    });
  });

  // ─── 8. labelTipo ───────────────────────────────────────────────────────────

  describe('labelTipo', () => {
    beforeEach(async () => {
      await setup(of(makeCronogramaResponse()));
    });

    it.each([
      ['conteudo_novo', 'Novo'],
      ['revisao', 'Revisão'],
      ['simulado', 'Simulado'],
      ['redacao', 'Redação'],
    ])('deve mapear tipo "%s" para label "%s"', (tipo, label) => {
      expect(component.labelTipo(tipo)).toBe(label);
    });

    it('deve retornar o proprio tipo quando nao ha mapeamento', () => {
      expect(component.labelTipo('tipo_inexistente')).toBe('tipo_inexistente');
    });
  });

  // ─── 9. voltar() ────────────────────────────────────────────────────────────

  describe('voltar', () => {
    beforeEach(async () => {
      await setup(of(makeCronogramaResponse()));
      fixture.detectChanges();
    });

    it('deve navegar para /simulados/listar ao chamar voltar()', () => {
      component.voltar();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/simulados/listar']);
    });

    it('deve chamar navigate exatamente uma vez', () => {
      component.voltar();
      expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
    });
  });

  // ─── 10. formatarDiaSemana ──────────────────────────────────────────────────

  describe('formatarDiaSemana', () => {
    beforeEach(async () => {
      await setup(of(makeCronogramaResponse()));
    });

    it.each([
      ['domingo', 'Dom'],
      ['segunda', 'Seg'],
      ['segunda-feira', 'Seg'],
      ['terca', 'Ter'],
      ['terça', 'Ter'],
      ['terça-feira', 'Ter'],
      ['quarta', 'Qua'],
      ['quarta-feira', 'Qua'],
      ['quinta', 'Qui'],
      ['quinta-feira', 'Qui'],
      ['sexta', 'Sex'],
      ['sexta-feira', 'Sex'],
      ['sabado', 'Sáb'],
      ['sábado', 'Sáb'],
    ])('deve normalizar "%s" para "%s"', (entrada, esperado) => {
      expect(component.formatarDiaSemana(entrada)).toBe(esperado);
    });

    it('deve usar os 3 primeiros caracteres como fallback para dia desconhecido', () => {
      expect(component.formatarDiaSemana('feriado')).toBe('fer');
    });
  });

  // ─── Extras: formatarData e diaDaData ───────────────────────────────────────

  describe('formatarData', () => {
    beforeEach(async () => {
      await setup(of(makeCronogramaResponse()));
    });

    it('deve converter "2025-01-15" para "15/01/2025"', () => {
      expect(component.formatarData('2025-01-15')).toBe('15/01/2025');
    });

    it('deve retornar "—" quando a string e undefined', () => {
      expect(component.formatarData(undefined)).toBe('—');
    });
  });

  describe('diaDaData', () => {
    beforeEach(async () => {
      await setup(of(makeCronogramaResponse()));
    });

    it('deve extrair o dia "15" de "2025-01-15"', () => {
      expect(component.diaDaData('2025-01-15')).toBe('15');
    });
  });

  // ─── disciplineColor ─────────────────────────────────────────────────────────

  describe('disciplineColor', () => {
    beforeEach(async () => {
      await setup(of(makeCronogramaResponse()));
    });

    it('deve retornar a cor do indice 0', () => {
      expect(component.disciplineColor(0)).toBe('#6366f1');
    });

    it('deve fazer wrap circular quando o indice ultrapassa o tamanho da palette', () => {
      // palette tem 13 cores; indice 13 deve ser igual ao indice 0
      expect(component.disciplineColor(13)).toBe(component.disciplineColor(0));
    });
  });

  // ─── scrollToMes ─────────────────────────────────────────────────────────────

  describe('scrollToMes', () => {
    beforeEach(async () => {
      await setup(of(makeCronogramaResponse()));
      fixture.detectChanges();
    });

    it('deve adicionar a chave ao Set de meses expandidos imediatamente', () => {
      component.scrollToMes('2025-02');
      expect(component.isMesExpandido('2025-02')).toBe(true);
    });

    it('deve manter o mes expandido mesmo apos o timeout do scroll', async () => {
      // jsdom nao implementa scrollIntoView — stub para evitar TypeError
      const scrollIntoViewMock = vi.fn();
      vi.spyOn(document, 'getElementById').mockReturnValue({
        scrollIntoView: scrollIntoViewMock,
      } as unknown as HTMLElement);

      vi.useFakeTimers();
      component.scrollToMes('2025-02');
      await vi.runAllTimersAsync();
      vi.useRealTimers();
      vi.restoreAllMocks();

      expect(component.isMesExpandido('2025-02')).toBe(true);
    });
  });

  // ─── mesAbreviation ──────────────────────────────────────────────────────────

  describe('mesAbreviation', () => {
    beforeEach(async () => {
      await setup(of(makeCronogramaResponse()));
    });

    it('deve retornar a primeira palavra do titulo do mes', () => {
      expect(component.mesAbreviation('Janeiro 2025')).toBe('Janeiro');
    });

    it('deve lidar com titulo de uma unica palavra', () => {
      expect(component.mesAbreviation('Janeiro')).toBe('Janeiro');
    });
  });
});
