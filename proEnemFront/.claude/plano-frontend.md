# Plano frontend: Salvar dados do wizard de cronograma de estudos
Data: 2026-03-28

## Objetivo
Implementar lógica no componente wizard existente para enviar dados preenchidos para API ao clicar em "Gerar Cronograma", com feedback de sucesso/erro.

## Arquivos a criar
- `src/app/core/services/cronograma.service.ts`: serviço HTTP para comunicação com API de cronogramas (POST /api/cronogramas)
- `src/app/core/models/cronograma.model.ts`: interface TypeScript para tipo Cronograma

## Arquivos a modificar
- `src/app/pages/cronograma/novo-cronograma/novo-cronograma.component.ts`:
  - injetar CronogramaService
  - implementar método gerarCronograma() para preparar payload e chamar service
  - adicionar controle de loading/erro
  - adicionar toast/snackbar de sucesso
- `src/app/pages/cronograma/novo-cronograma/novo-cronograma.component.html`:
  - adicionar spinner no botão durante loading
  - exibir mensagem de erro caso API retorne erro

## Payload enviado para API
```typescript
{
  data_inicio: string,        // formato YYYY-MM-DD
  data_fim: string,           // formato YYYY-MM-DD
  dias_semana: string[],      // ['seg', 'ter', ...]
  estudar_feriados: boolean,
  tirar_ferias: boolean,
  disciplinas_selecionadas: string[],  // ['Matemática', 'Física', ...]
  minutos_estudo_por_dia: number
}
```

## Feedback ao usuário
- Loading: botão "Gerar Cronograma" mostra spinner e fica disabled
- Sucesso: toast/snackbar verde + redirecionamento para /cronograma (lista) após 1s
- Erro de validação: exibir lista de erros abaixo do botão "Gerar Cronograma" com mensagens do backend
- Erro de rede/servidor: alert de erro genérico "Erro ao salvar cronograma. Tente novamente."

## Mapeamento de dados do componente para API
| Campo componente | Campo API | Transformação |
|------------------|-----------|---------------|
| dataInicio | data_inicio | - |
| dataFim | data_fim | - |
| diasSemana (array de objetos) | dias_semana | extrair campo 'valor' dos selecionados |
| estudarFeriados | estudar_feriados | - |
| tirarFerias | tirar_ferias | - |
| disciplinas (array de objetos) | disciplinas_selecionadas | extrair campo 'nome' das selecionadas |
| minutosEstudoPorDia | minutos_estudo_por_dia | - |

## Dúvidas
- nenhuma

## Prompt para acionar
```
@"frontend-writer (agent)" implemente conforme .claude/plano-frontend.md
```
