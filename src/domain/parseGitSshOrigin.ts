/**
 * Partes extraídas de um remote Git no formato SCP usado pelo SSH:
 * `git@<host-ou-alias>:<owner>/<repo>(.git)?`
 *
 * Ex.: `git@github-personal:zanwalker-dev/whichGit.git`
 */
export type ParsedGitSshOrigin = {
  sshAlias: string;
  owner: string;
  repo: string;
};

/**
 * Interpreta `originUrl` como URL SSH estilo SCP (`git@…:…/…`).
 * Retorna `null` se o formato não for reconhecido (HTTPS, `ssh://`, path inválido, etc.).
 */
export function parseGitSshOrigin(originUrl: string): ParsedGitSshOrigin | null {
  const input = originUrl.trim();
  if (!input.startsWith("git@")) {
    return null;
  }

  const afterGit = input.slice("git@".length);
  const colon = afterGit.indexOf(":");
  if (colon <= 0) {
    return null;
  }

  const sshAlias = afterGit.slice(0, colon).trim();
  if (!sshAlias || sshAlias.includes("/") || sshAlias.includes(":")) {
    return null;
  }

  let path = afterGit.slice(colon + 1).trim();
  if (!path || path.startsWith("/") || path.startsWith(":")) {
    return null;
  }

  const pathLower = path.toLowerCase();
  if (pathLower.endsWith(".git")) {
    path = path.slice(0, path.length - ".git".length);
  }
  path = path.trim();
  if (!path) {
    return null;
  }

  const slash = path.indexOf("/");
  if (slash <= 0 || slash === path.length - 1) {
    return null;
  }

  const owner = path.slice(0, slash).trim();
  const repo = path.slice(slash + 1).trim();
  if (!owner || !repo) {
    return null;
  }

  if (owner.includes("/") || repo.includes("/")) {
    return null;
  }

  return { sshAlias, owner, repo };
}
