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
  created_at: string;
}
