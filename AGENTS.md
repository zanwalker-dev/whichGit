# AGENTS.md

Este projeto é desenvolvido com suporte de AI (Cursor Agent).

## Regras obrigatórias

- Nunca fazer mudanças grandes sem quebrar em tarefas pequenas
- Nunca alterar múltiplos módulos sem necessidade
- Sempre preferir funções pequenas e testáveis
- Nunca assumir formato rígido de arquivos do usuário (.ssh/config, .gitconfig)
- Sempre tratar leitura e escrita como operações separadas

## Segurança

- Nunca modificar ~/.ssh/config sem:
  - preview
  - confirmação
  - backup
- Nunca modificar ~/.gitconfig sem backup

## Arquitetura

Separação obrigatória:

- domain → tipos e modelos
- services → lógica de negócio
- infrastructure → filesystem, shell, parser

## Fluxo de desenvolvimento

1. Primeiro leitura (read-only)
2. Depois diagnóstico
3. Só depois escrita

## NÃO FAZER

- Não implementar UI antes da lógica básica
- Não usar libs desnecessárias
- Não criar abstrações complexas prematuramente
