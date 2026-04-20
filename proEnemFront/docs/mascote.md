# Mascote Animado — Documentação

## Visão Geral

O mascote é um gato pixel art fixo no canto inferior esquerdo da tela. Ele percorre uma sequência de animações configurável, cada uma com sua própria linha do sprite sheet, velocidade (fps) e duração.

**Componente:** `src/app/shared/mascot/mascot.component.ts`  
**Template:** `src/app/shared/mascot/mascot.component.html`  
**Estilos:** `src/app/shared/mascot/mascot.component.scss`  
**Sprite sheet:** `src/assets/images/mascot.png`

---

## Sprite Sheet

| Propriedade | Valor |
|---|---|
| Dimensão total | 896 × 4608 px |
| Tamanho de cada frame | 64 × 64 px |
| Colunas (frames por linha) | 14 |
| Linhas de animação | 72 |
| Escala de exibição | ×2 → 128 × 128 px na tela |

---

## Sequência de Animações Atual

O mascote percorre os passos abaixo em ordem e volta ao início ao terminar.

| Passo | Linha(s) | Frames | FPS | Duração | Comportamento |
|---|---|---|---|---|---|
| 1 | 13 | 8 | 0.5 (1 frame/2s) | 1 min | Gato sentado |
| 2 | 7 | 14 | 0.2 (1 frame/5s) | 1 min | Gato dormindo |
| 3 | 18 → 19 | 8 cada | 2 fps | 5 min | Animação dupla (18 completa, depois 19, em loop) |
| 4 | 20 | 5 | 1 fps | 1 min | Andando |

---

## Como Alterar

Todas as configurações ficam no início de `mascot.component.ts`.

### 1. Dimensões e escala do sprite

```ts
readonly FRAME_WIDTH  = 64;   // largura nativa de cada frame (px)
readonly FRAME_HEIGHT = 64;   // altura nativa de cada frame (px)
readonly SCALE        = 2;    // zoom aplicado na exibição (2 → 128×128 px)
readonly SHEET_COLS   = 14;   // total de colunas no sprite sheet
```

> Altere `SCALE` para deixar o mascote maior (`3` → 192px) ou menor (`1` → 64px).

---

### 2. Adicionar ou remover um passo da sequência

Edite o array `sequence` em `mascot.component.ts`:

```ts
readonly sequence: AnimationStep[] = [
  {
    rows: [13],          // linha(s) do sprite sheet a usar (começa em 0)
    framesPerRow: 8,     // quantos frames tem essa linha
    fps: 0.5,            // velocidade: frames por segundo
    durationSeconds: 60, // quanto tempo ficar neste passo (em segundos)
    label: 'sit',        // nome livre, só para referência
  },
  // ... outros passos
];
```

**Para adicionar um novo passo**, inclua um novo objeto no array seguindo o mesmo formato.  
**Para remover**, delete o objeto correspondente.  
**Para reordenar**, mova os objetos dentro do array.

---

### 3. Usar múltiplas linhas em sequência num mesmo passo

Passe mais de uma linha em `rows`. O mascote percorre linha 18 completa, depois linha 19 completa, e repete durante `durationSeconds`:

```ts
{
  rows: [18, 19],
  framesPerRow: 8,   // mesmo número de frames para ambas
  fps: 2,
  durationSeconds: 300,
  label: 'play',
}
```

Se cada linha tiver um número diferente de frames, passe um array em `framesPerRow`:

```ts
{
  rows: [18, 19],
  framesPerRow: [8, 6],  // linha 18 tem 8 frames, linha 19 tem 6
  fps: 2,
  durationSeconds: 300,
  label: 'play',
}
```

---

### 4. Alterar velocidade de um passo

Ajuste o campo `fps` (frames por segundo):

| FPS | Equivale a |
|---|---|
| `0.2` | 1 frame a cada 5 segundos |
| `0.5` | 1 frame a cada 2 segundos |
| `1` | 1 frame por segundo |
| `2` | 2 frames por segundo |
| `8` | 8 frames por segundo (rápido) |

---

### 5. Alterar a duração de um passo

Ajuste `durationSeconds` (em segundos):

```ts
durationSeconds: 60,   // 1 minuto
durationSeconds: 300,  // 5 minutos
durationSeconds: 3600, // 1 hora
```

---

### 6. Alterar a posição na tela

Edite `mascot.component.scss`:

```scss
.mascot-wrapper {
  position: fixed;
  left: 16px;    // distância da borda esquerda
  bottom: 5px;   // distância da borda inferior
  z-index: 1050; // sobreposição (aumentar se ficar atrás de outros elementos)
}
```

---

### 7. Alterar a animação de "flutuação"

O mascote tem uma animação CSS independente de subir e descer suavemente. Para ajustar:

```scss
@keyframes mascot-float {
  0%, 100% { transform: translateY(0);    }
  50%       { transform: translateY(-6px); } // altura do "salto" em px
}

.mascot-sprite {
  animation: mascot-float 3s ease-in-out infinite; // 3s = velocidade do balanço
}
```

Para desativar a flutuação, remova a linha `animation: ...` do `.mascot-sprite`.

---

## Estrutura da Interface `AnimationStep`

```ts
interface AnimationStep {
  rows: number[];                  // índices das linhas do sprite (base 0)
  framesPerRow: number | number[]; // frames por linha
  fps: number;                     // frames por segundo
  durationSeconds: number;         // duração do passo em segundos
  label: string;                   // nome descritivo (livre)
}
```
