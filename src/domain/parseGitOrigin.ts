import type { ParsedGitOrigin } from "../shared/types/parsed-git-origin";

import { parseGitSshOrigin } from "./parseGitSshOrigin";

function parseHttpsOwnerRepo(originUrl: string): {
  owner: string;
  repo: string;
} | null {
  try {
    const u = new URL(originUrl);
    const segments = u.pathname.split("/").filter((s) => s.length > 0);
    if (segments.length < 2) {
      return null;
    }
    const owner = segments[segments.length - 2];
    let repo = segments[segments.length - 1];
    if (repo.toLowerCase().endsWith(".git")) {
      repo = repo.slice(0, -".git".length);
    }
    if (!owner || !repo) {
      return null;
    }
    return { owner, repo };
  } catch {
    return null;
  }
}

/**
 * Identifica protocolo e extrai partes conhecidas do remote (sem parsing de ~/.ssh/config).
 */
export function parseGitOrigin(originUrl: string | null): ParsedGitOrigin {
  if (originUrl === null || originUrl.trim() === "") {
    return {
      protocol: "unknown",
      sshAlias: null,
      owner: null,
      repo: null,
    };
  }

  const trimmed = originUrl.trim();
  const scp = parseGitSshOrigin(trimmed);
  if (scp) {
    return {
      protocol: "ssh",
      sshAlias: scp.sshAlias,
      owner: scp.owner,
      repo: scp.repo,
    };
  }

  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    const parts = parseHttpsOwnerRepo(trimmed);
    if (parts) {
      return {
        protocol: "https",
        sshAlias: null,
        owner: parts.owner,
        repo: parts.repo,
      };
    }
    return {
      protocol: "https",
      sshAlias: null,
      owner: null,
      repo: null,
    };
  }

  if (trimmed.startsWith("ssh://")) {
    return {
      protocol: "ssh",
      sshAlias: null,
      owner: null,
      repo: null,
    };
  }

  return {
    protocol: "unknown",
    sshAlias: null,
    owner: null,
    repo: null,
  };
}
