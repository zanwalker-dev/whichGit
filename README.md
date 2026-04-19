# whichGit

Aplicação desktop para visualizar e trocar a identidade Git/SSH ativa em repositórios locais.

## Objetivo

Evitar confusão entre contas pessoais e corporativas no GitHub, mostrando claramente:

- qual email está sendo usado nos commits
- qual chave SSH está autenticando
- qual remote está configurado

## Stack

- Tauri 2
- React + TypeScript + Vite

## Status

🚧 Em desenvolvimento (MVP)

## Filosofia

- Não existe “conta global ativa”
- Identidade é por repositório
- Toda alteração deve ser explícita e validada
