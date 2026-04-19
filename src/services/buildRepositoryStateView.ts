import { parseGitOrigin } from "../domain/parseGitOrigin";
import type { RepositoryContext } from "../shared/types/repository-context";
import type { RepositoryStateView } from "../shared/types/repository-state-view";

/**
 * Monta a visão de estado interpretado (sem diagnósticos) a partir do contexto lido.
 */
export function buildRepositoryStateView(
  context: RepositoryContext,
): RepositoryStateView {
  const parsed = parseGitOrigin(context.originUrl);
  return {
    repoPath: context.repoPath,
    originUrl: context.originUrl,
    protocol: parsed.protocol,
    sshAlias: parsed.sshAlias,
    owner: parsed.owner,
    repo: parsed.repo,
    gitUserName: context.gitUserName,
    gitUserEmail: context.gitUserEmail,
  };
}
