export interface CronogramaPayload {
  nome: string;
  data_inicio: string;
  data_fim: string;
  dias_semana: string[];
  estudar_feriados: boolean;
  tirar_ferias: boolean;
  disciplinas_selecionadas: number[];
  minutos_estudo_por_dia: number;
}

export interface Aula {
  slot: number;
  disciplina: string;
  topico_id: number | null;
  topico: string;
  tipo: 'conteudo_novo' | 'revisao' | 'redacao' | 'simulado';
  score: number | null;
}

export interface DiaCronograma {
  data: string;
  dia_semana: string;
  aulas: Aula[];
}

export interface DisciplinaResumo {
  slug: string;
  slots_alocados: number;
  peso_bruto: number;
  fracao_percentual: string;
  topicos_incluidos: number;
  topicos_excluidos: number;
  topicos_excluidos_lista: string[];
}

export interface CronogramaJson {
  sucesso: boolean;
  resumo: {
    periodo: { data_inicio: string; data_fim: string; horas_por_dia: number };
    total_dias_estudo: number;
    total_slots: number;
    slots_conteudo: number;
    slots_simulados: number;
    slots_redacao: number;
    total_simulados: number;
    total_redacoes: number;
    total_topicos_incluidos: number;
    disciplinas: DisciplinaResumo[];
  };
  cronograma: DiaCronograma[];
  alertas: string[];
}

export interface CronogramaResponse {
  id: number;
  nome: string;
  data_inicio: string;
  data_fim: string;
  dias_semana: string[];
  estudar_feriados: boolean;
  tirar_ferias: boolean;
  disciplinas_selecionadas: string[];
  minutos_estudo_por_dia: number;
  ativo: boolean;
  cronograma_json?: CronogramaJson;
  created_at: string;
  updated_at: string;
}

export interface CronogramaListItem {
  id: number;
  nome: string;
  data_inicio: string;
  data_fim: string;
  dias_semana: string[];
  disciplinas_selecionadas: string[];
  minutos_estudo_por_dia: number;
  ativo: boolean;
  created_at: string;
}
