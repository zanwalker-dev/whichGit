import type { ParsedGitOrigin } from "./parsed-git-origin";

export type DiagnosticStatus = "ok" | "warning" | "error";

/** Ação sugerida para execução futura (ex.: copiar comando no terminal). */
export type RecommendedRunCommandAction = {
  type: "run-command";
  label: string;
  command: string;
};

export type RecommendedAction = RecommendedRunCommandAction;

/** Um achado de diagnóstico (IDs hierárquicos, ex.: `origin.ssh.valid`). */
export type DiagnosticItem = {
  id: string;
  status: DiagnosticStatus;
  message: string;
  recommendedAction?: RecommendedAction;
};

/**
 * Resultado da avaliação: dados interpretados pelo parser (`parsedOrigin`) separados
 * da lista de achados (`diagnostics`).
 */
export type RepositoryDiagnostics = {
  parsedOrigin: ParsedGitOrigin;
  diagnostics: DiagnosticItem[];
  overallStatus: DiagnosticStatus;
};
