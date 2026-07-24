export interface Plano {
  nome: string;
  descricao: string;
  preco: string;
  periodicidade: string;
  dataRenovacao: string | null;
  recursos: string[];
}
