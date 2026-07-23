---
description: Implementa uma feature completa do zero. Argumento: descrição da feature.
---

Você vai implementar a feature descrita abaixo seguindo este fluxo rigoroso:

Feature: $ARGUMENTS

1. **Plano.** Leia o CLAUDE.md do projeto. Liste os arquivos que você acha que vai precisar criar/modificar. Apresente o plano em bullets e PARE. Espere eu confirmar antes de codar.

2. **Implementação.** Após aprovação, implemente. Faça commits pequenos e descritivos (Conventional Commits).

3. **Testes.** Quando o código estiver pronto, invoque o sub-agente test-writer para gerar a cobertura.

4. **Verificação.** Rode os comandos de verificação do CLAUDE.md (lint, type-check, testes). Se algo falhar, conserte.

5. **Review.** Invoque o sub-agente code-reviewer para revisão final.

6. **PR.** Quando o reviewer aprovar, sugira o título e corpo do PR seguindo Conventional Commits, e rode `gh pr create` se eu confirmar.

A qualquer momento se você ficar com dúvida sobre escopo ou abordagem, PARE e pergunte. É melhor perguntar do que adivinhar errado.
