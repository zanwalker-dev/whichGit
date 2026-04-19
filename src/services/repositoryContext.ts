import { invoke } from "@tauri-apps/api/core";

import type { CommandResult } from "../shared/types/command-result";
import type { RepositoryContext } from "../shared/types/repository-context";

type RawGitResult = {
  ok: boolean;
  value?: string;
  message?: string;
  exitCode?: number;
};

function toCommandResult(raw: unknown): CommandResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, message: "resposta inválida do backend" };
  }
  const r = raw as RawGitResult;
  if (typeof r.ok !== "boolean") {
    return { ok: false, message: "resposta inválida do backend" };
  }
  if (r.ok) {
    if (typeof r.value !== "string") {
      return { ok: false, message: "resposta inválida do backend" };
    }
    return { ok: true, value: r.value };
  }
  const message =
    typeof r.message === "string" ? r.message : "comando git falhou";
  const exitCode =
    typeof r.exitCode === "number" ? r.exitCode : undefined;
  return { ok: false, message, exitCode };
}

async function invokeGit(
  command: string,
  cwd: string,
): Promise<CommandResult> {
  const raw = await invoke<RawGitResult>(command, { cwd });
  return toCommandResult(raw);
}

export type LoadRepositoryContextOutcome =
  | { ok: true; context: RepositoryContext }
  | { ok: false; error: string };

/**
 * Lê o estado atual: resolve o cwd do processo, a raiz do Git e config local (nome/email).
 */
export async function loadCurrentRepositoryContext(): Promise<LoadRepositoryContextOutcome> {
  let cwd: string;
  try {
    cwd = await invoke<string>("get_process_cwd");
  } catch (e) {
    return { ok: false, error: String(e) };
  }

  const root = await invokeGit("get_repo_root", cwd);
  if (!root.ok) {
    return {
      ok: false,
      error: `não é um repositório Git (ou git falhou): ${root.message}`,
    };
  }

  const repoPath = root.value;
  const [origin, name, email] = await Promise.all([
    invokeGit("get_origin_url", repoPath),
    invokeGit("get_git_user_name", repoPath),
    invokeGit("get_git_user_email", repoPath),
  ]);

  const context: RepositoryContext = {
    repoPath,
    originUrl: origin.ok ? origin.value : null,
    gitUserName: name.ok ? name.value : null,
    gitUserEmail: email.ok ? email.value : null,
  };

  return { ok: true, context };
}
