# Wizard de Cronograma de Estudos (Frontend)

> Última atualização: 2026-03-28 | Commit: b959495

## O que é

Interface wizard de 5 etapas que guia o usuário na criação de um cronograma de estudos personalizado. O componente coleta preferências de período, dias de estudo, disciplinas, carga horária e exibe um resumo final antes de enviar os dados ao backend via API REST protegida por autenticação.

A experiência é progressiva, validando cada etapa antes de permitir o avanço, com feedback visual claro e mensagens de erro detalhadas.

## Como funciona

Fluxo completo da feature:

```
Usuário acessa /simulados/criar
  ↓ AuthGuard verifica localStorage.getItem('auth_token')
  ↓ Se não autenticado → redireciona para /auth/login
NovoCronogramaComponent carregado
  ↓ Etapa 1: seleciona datas (data_inicio, data_fim)
  ↓ podeProsseguir() valida → proximaEtapa()
  ↓ Etapa 2: seleciona dias da semana + opções feriados/férias
  ↓ podeProsseguir() valida → proximaEtapa()
  ↓ Etapa 3: seleciona disciplinas por área
  ↓ podeProsseguir() valida → proximaEtapa()
  ↓ Etapa 4: ajusta slider de carga horária (50-720 min)
  ↓ podeProsseguir() valida → proximaEtapa()
  ↓ Etapa 5: exibe resumo completo
  ↓ gerarCronograma() clicado
CronogramaService.criarCronograma(payload)
  ↓ HttpClient POST /api/cronogramas
  ↓ AuthInterceptor adiciona header Authorization: Bearer {token}
Backend processa
  ↓ 201 Created { data: {...}, message: "..." }
Component exibe spinner → sucesso
  ↓ setTimeout 1s → Router.navigate(['/cronograma'])
```

## Arquivos envolvidos

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/app/pages/cronograma/novo-cronograma/novo-cronograma.component.ts` | Lógica do wizard: navegação entre etapas, validação, submit |
| `src/app/pages/cronograma/novo-cronograma/novo-cronograma.component.html` | Template com stepper visual e 5 etapas interativas |
| `src/app/core/services/cronograma.service.ts` | Chamada HTTP POST /api/cronogramas com tipagem |
| `src/app/core/models/cronograma.model.ts` | Interfaces CronogramaPayload e CronogramaResponse |
| `src/app/core/config/api.config.ts` | URL base da API (localhost:8000/api) |
| `src/app/core/interceptors/auth.interceptor.ts` | Adiciona token Bearer em todas requisições |
| `src/app/core/guards/auth.guard.ts` | Protege rotas, redireciona não autenticados |
| `src/app/app.config.ts` | Registra HttpClient e AuthInterceptor |
| `src/app/app.routes.ts` | Rota /simulados/criar com canActivate: [authGuard] |

## Estrutura do Wizard

### Etapa 1 - Período do Cronograma

**Campos:**
- `dataInicio` (string, formato YYYY-MM-DD)
- `dataFim` (string, formato YYYY-MM-DD)

**Validação:**
```typescript
podeProsseguir(): boolean {
  return !!this.dataInicio && !!this.dataFim && this.dataFim >= this.dataInicio;
}
```

**Feedback visual:**
- Alerta vermelho se data_fim < data_inicio
- Alerta verde se período válido

### Etapa 2 - Dias de Estudo

**Campos:**
- `diasSemana[]` (array de objetos `{label, valor, selecionado}`)
- `estudarFeriados` (boolean)
- `tirarFerias` (boolean)

**Validação:**
```typescript
podeProsseguir(): boolean {
  return this.diasSelecionados.length > 0;
}
```

**UI:**
- Cards clicáveis para cada dia da semana
- Toggles para feriados e férias
- Contador de dias selecionados

### Etapa 3 - Disciplinas

**Campos:**
- `disciplinas[]` (array de objetos `{nome, area, selecionada}`)

**Validação:**
```typescript
podeProsseguir(): boolean {
  return this.disciplinasSelecionadas.length > 0;
}
```

**Organização:**
- Disciplinas agrupadas por área do conhecimento
- 4 áreas do ENEM: Matemática, Linguagens, Natureza, Humanas
- Cards clicáveis com ícone de check quando selecionada

**Disciplinas disponíveis:**
```typescript
[
  { nome: 'Matemática', area: 'Matemática e suas Tecnologias' },
  { nome: 'Língua Portuguesa', area: 'Linguagens, Códigos e suas Tecnologias' },
  { nome: 'Literatura', area: 'Linguagens, Códigos e suas Tecnologias' },
  { nome: 'Inglês', area: 'Linguagens, Códigos e suas Tecnologias' },
  { nome: 'Espanhol', area: 'Linguagens, Códigos e suas Tecnologias' },
  { nome: 'Redação', area: 'Linguagens, Códigos e suas Tecnologias' },
  { nome: 'Física', area: 'Ciências da Natureza e suas Tecnologias' },
  { nome: 'Química', area: 'Ciências da Natureza e suas Tecnologias' },
  { nome: 'Biologia', area: 'Ciências da Natureza e suas Tecnologias' },
  { nome: 'História', area: 'Ciências Humanas e suas Tecnologias' },
  { nome: 'Geografia', area: 'Ciências Humanas e suas Tecnologias' },
  { nome: 'Filosofia', area: 'Ciências Humanas e suas Tecnologias' },
  { nome: 'Sociologia', area: 'Ciências Humanas e suas Tecnologias' },
]
```

### Etapa 4 - Carga Horária Diária

**Campos:**
- `minutosEstudoPorDia` (number, range 50-720)

**UI:**
- Slider interativo com range 50-720 minutos
- Display formatado: converte minutos para horas e minutos
- Marcadores visuais: 50min, 2h, 4h, 6h, 8h, 10h, 12h
- 4 categorias de intensidade:
  - **Leve:** 50min – 2h
  - **Moderado:** 2h – 6h
  - **Intenso:** 6h – 9h
  - **Maratonista:** 9h – 12h

**Computed property:**
```typescript
get horasEstudoLabel(): string {
  const h = Math.floor(this.minutosEstudoPorDia / 60);
  const m = this.minutosEstudoPorDia % 60;
  if (h === 0) return `${m} minutos`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}
```

### Etapa 5 - Gerar Cronograma

**Resumo visual:**
- Período selecionado (formatado dd/MM/yyyy)
- Dias de estudo + badges de feriados/férias se aplicável
- Carga horária formatada
- Lista de disciplinas selecionadas

**Ações:**
- Botão "Gerar Cronograma" → chama `gerarCronograma()`
- Loading spinner durante processamento
- Mensagens de erro detalhadas (422, 500, etc)
- Redirecionamento automático após sucesso

## Payload enviado para API

```typescript
interface CronogramaPayload {
  data_inicio: string;           // "2026-04-01"
  data_fim: string;              // "2026-11-15"
  dias_semana: string[];         // ["seg", "qua", "sex"]
  estudar_feriados: boolean;     // false
  tirar_ferias: boolean;         // true
  disciplinas_selecionadas: string[]; // ["Matemática", "Física"]
  minutos_estudo_por_dia: number;     // 240
}
```

**Transformação dos dados:**
```typescript
const payload: CronogramaPayload = {
  data_inicio: this.dataInicio,
  data_fim: this.dataFim,
  dias_semana: this.diasSelecionados.map(d => d.valor),
  estudar_feriados: this.estudarFeriados,
  tirar_ferias: this.tirarFerias,
  disciplinas_selecionadas: this.disciplinasSelecionadas.map(d => d.nome),
  minutos_estudo_por_dia: this.minutosEstudoPorDia,
};
```

## Segurança implementada

### 1. AuthGuard

```typescript
// app.routes.ts
{
  path: 'simulados/criar',
  canActivate: [authGuard],
  loadComponent: () => import('...NovoCronogramaComponent')
}
```

- Verifica `localStorage.getItem('auth_token')`
- Se não autenticado: redireciona para `/auth/login` com `returnUrl`
- Previne acesso não autorizado à criação de cronogramas

### 2. AuthInterceptor

```typescript
// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }

  return next(req);
};
```

- Adiciona automaticamente header `Authorization` em todas requisições
- Token Bearer validado pelo backend via Sanctum

### 3. Validação Client-Side

Cada etapa valida dados antes de permitir avanço:
- **Etapa 1:** datas preenchidas e lógicas (fim >= início)
- **Etapa 2:** ao menos 1 dia selecionado
- **Etapa 3:** ao menos 1 disciplina selecionada
- **Etapa 4:** sempre válida (slider garante range)

Botão "Próximo" desabilitado se `!podeProsseguir()`.

### 4. Tratamento de Erros da API

```typescript
.subscribe({
  next: () => { /* sucesso */ },
  error: (error) => {
    if (error.status === 422 && error.error?.errors) {
      // Erros de validação do Laravel
      this.errorMessages = Object.values(error.error.errors).flat() as string[];
    } else if (error.error?.message) {
      this.errorMessage = error.error.message;
    } else {
      this.errorMessage = 'Erro ao salvar cronograma. Tente novamente.';
    }
  }
})
```

Exibe mensagens específicas do backend:
- **422:** lista de erros de validação
- **401:** não autenticado
- **500:** erro genérico

## Gerenciamento de memória

```typescript
private destroyRef = inject(DestroyRef);

this.cronogramaService.criarCronograma(payload)
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe({ ... });
```

**takeUntilDestroyed:** cancela subscription automaticamente quando componente é destruído, evitando memory leaks.

## Estados visuais

### Loading

```typescript
isLoading = false;

gerarCronograma(): void {
  this.isLoading = true;
  // ...
  .subscribe({
    next: () => { this.isLoading = false; },
    error: () => { this.isLoading = false; }
  });
}
```

Durante loading:
- Botão exibe spinner
- Texto muda para "Gerando..."
- Botão desabilitado

### Feedback de Erro

```typescript
errorMessage = '';          // erro genérico
errorMessages: string[] = []; // array de erros de validação
```

Template exibe:
- Alert vermelho com ícone
- Lista de erros (422)
- Mensagem única (outros erros)

### Navegação entre Etapas

```typescript
etapaAtual = 1;

proximaEtapa(): void {
  if (this.etapaAtual < this.totalEtapas && this.podeProsseguir()) {
    this.etapaAtual++;
  }
}

etapaAnterior(): void {
  if (this.etapaAtual > 1) {
    this.etapaAtual--;
  }
}
```

Botões:
- **Voltar:** desabilitado na etapa 1
- **Próximo:** desabilitado se etapa inválida
- **Gerar Cronograma:** aparece apenas na etapa 5

## Integração com API

### Service

```typescript
@Injectable({ providedIn: 'root' })
export class CronogramaService {
  private http = inject(HttpClient);
  private apiUrl = API_CONFIG.baseUrl; // http://localhost:8000/api

  criarCronograma(payload: CronogramaPayload): Observable<CronogramaResponse> {
    return this.http.post<{ data: CronogramaResponse; message: string }>(
      `${this.apiUrl}/cronogramas`,
      payload
    ).pipe(map(response => response.data));
  }
}
```

**Tipagem forte:**
- Payload e Response tipados com interfaces
- Extrai `data` da resposta via `map()`

### Resposta esperada

```typescript
interface CronogramaResponse {
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
```

## Como testar manualmente

### 1. Fazer login

```
1. Acesse /auth/login
2. Insira credenciais válidas
3. Verifique se token foi salvo em localStorage
```

### 2. Acessar wizard

```
1. Navegue para /simulados/criar
2. Verificar que AuthGuard permite acesso
3. Componente deve carregar mostrando Etapa 1
```

### 3. Preencher Etapa 1

```
1. Selecione data_inicio futura
2. Selecione data_fim posterior à data_inicio
3. Verificar alerta verde "Período selecionado com sucesso"
4. Clicar "Próximo"
```

### 4. Preencher Etapa 2

```
1. Clicar em alguns dias da semana (cards ficam coloridos)
2. Ativar/desativar toggles de feriados e férias
3. Verificar contador "X dias selecionados"
4. Clicar "Próximo"
```

### 5. Preencher Etapa 3

```
1. Clicar em disciplinas de diferentes áreas
2. Verificar ícone de check nas selecionadas
3. Verificar contador "X disciplinas selecionadas"
4. Clicar "Próximo"
```

### 6. Preencher Etapa 4

```
1. Arrastar slider de carga horária
2. Verificar label atualizar (ex: "4h 30min")
3. Verificar categoria de intensidade destacada
4. Clicar "Próximo"
```

### 7. Gerar cronograma

```
1. Revisar resumo na Etapa 5
2. Clicar "Gerar Cronograma"
3. Verificar spinner aparecer
4. Aguardar resposta da API
5. Verificar redirecionamento para /cronograma
```

### 8. Testar validações

**Teste 1: Disciplina inválida (adulteração)**
- Abrir DevTools
- Adicionar disciplina inexistente no array
- Submeter → verificar erro 422

**Teste 2: Token expirado**
- Remover token do localStorage
- Tentar submeter → verificar erro 401
- Verificar se é redirecionado para login

**Teste 3: Validações de etapa**
- Tentar avançar sem preencher campos obrigatórios
- Botão "Próximo" deve estar desabilitado

## Melhorias futuras

- Persistir progresso do wizard no localStorage (retomar após refresh)
- Animações de transição entre etapas
- Validação de datas contra feriados nacionais reais
- Preview visual do cronograma antes de gerar
- Edição de cronogramas existentes
- Duplicação de cronogramas antigos

## Histórico de alterações

| Data | Descrição |
|------|-----------|
| 2026-03-28 | Implementação inicial do wizard frontend |
