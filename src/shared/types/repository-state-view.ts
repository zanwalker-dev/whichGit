import type { GitOriginProtocol } from "./parsed-git-origin";

/**
 * Visão unificada para o bloco "Estado do repositório": leitura bruta + campos interpretados do origin.
 * Não inclui achados de diagnóstico.
 */
export type RepositoryStateView = {
  repoPath: string;
  originUrl: string | null;
  protocol: GitOriginProtocol;
  sshAlias: string | null;
  owner: string | null;
  repo: string | null;
  gitUserName: string | null;
  gitUserEmail: string | null;
};
