/**
 * Estado lido do repositório Git (caminho da raiz + remote e identidade local).
 */
export interface RepositoryContext {
  repoPath: string;
  originUrl: string | null;
  gitUserName: string | null;
  gitUserEmail: string | null;
}
