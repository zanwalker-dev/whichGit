export type GitOriginProtocol = "ssh" | "https" | "unknown";

/**
 * Interpretação leve do `originUrl` (SCP SSH, HTTPS comum; demais → unknown).
 */
export type ParsedGitOrigin = {
  protocol: GitOriginProtocol;
  sshAlias: string | null;
  owner: string | null;
  repo: string | null;
};
