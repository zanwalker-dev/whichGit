/**
 * Contexto mínimo de um repositório para leitura de estado (campos preenchidos conforme T004+).
 */
export interface RepositoryContext {
  rootPath: string;
  originUrl?: string | null;
  gitUserName?: string | null;
  gitUserEmail?: string | null;
}
