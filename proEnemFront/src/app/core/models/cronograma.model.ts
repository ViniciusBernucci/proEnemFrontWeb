export interface CronogramaPayload {
  data_inicio: string;
  data_fim: string;
  dias_semana: string[];
  estudar_feriados: boolean;
  tirar_ferias: boolean;
  disciplinas_selecionadas: string[];
  minutos_estudo_por_dia: number;
}

export interface CronogramaResponse {
  id: number;
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
  data_inicio: string;
  data_fim: string;
  dias_semana: string[];
  disciplinas_selecionadas: string[];
  minutos_estudo_por_dia: number;
  created_at: string;
}
