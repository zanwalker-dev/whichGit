import { parseGitOrigin } from "../domain/parseGitOrigin";
import type { RepositoryContext } from "../shared/types/repository-context";
import type {
  DiagnosticItem,
  DiagnosticStatus,
  RepositoryDiagnostics,
} from "../shared/types/repository-diagnostics";

function isBlank(value: string | null): boolean {
  return value === null || value.trim() === "";
}

function computeOverallStatus(items: DiagnosticItem[]): DiagnosticStatus {
  let overall: DiagnosticStatus = "ok";
  for (const item of items) {
    if (item.status === "error") {
      return "error";
    }
    if (item.status === "warning") {
      overall = "warning";
    }
  }
  return overall;
}

/**
 * Avalia o contexto do repositório e produz diagnósticos + status geral.
 * `parsedOrigin` vem apenas do parser; regras de negócio ficam nos itens.
 */
export function evaluateRepositoryDiagnostics(
  context: RepositoryContext,
): RepositoryDiagnostics {
  const parsedOrigin = parseGitOrigin(context.originUrl);
  const diagnostics: DiagnosticItem[] = [];

  if (isBlank(context.originUrl)) {
    diagnostics.push({
      id: "origin.remote.missing",
      status: "error",
      message:
        "Configure um remote `origin` (ex.: `git remote add origin <url>`) para rastrear o repositório remoto.",
    });
  } else if (parsedOrigin.protocol === "unknown") {
    diagnostics.push({
      id: "origin.parse.invalid",
      status: "error",
      message:
        "Corrija a URL do `origin`: use HTTPS (`https://…/owner/repo.git`), SCP SSH (`git@host:owner/repo.git`) ou ajuste o formato.",
    });
  } else if (parsedOrigin.protocol === "https") {
    diagnostics.push({
      id: "origin.https.detected",
      status: "warning",
      message:
        "O remote usa HTTPS. Para autenticar com chave SSH, altere para URL SSH: `git remote set-url origin git@<host>:<owner>/<repo>.git`. Se HTTPS for desejado, pode ignorar.",
    });
  } else if (
    parsedOrigin.protocol === "ssh" &&
    parsedOrigin.sshAlias !== null &&
    parsedOrigin.owner !== null &&
    parsedOrigin.repo !== null
  ) {
    diagnostics.push({
      id: "origin.ssh.valid",
      status: "ok",
      message:
        "Origin em formato SSH (SCP) reconhecido; confira se a identidade local abaixo corresponde à conta desejada.",
    });
  } else if (parsedOrigin.protocol === "ssh" && parsedOrigin.sshAlias === null) {
    diagnostics.push({
      id: "origin.ssh.missingAlias",
      status: "warning",
      message:
        "A URL SSH não expõe host/alias (ex.: `ssh://`). Prefira `git@alias:owner/repo.git` ou defina `Host` em `~/.ssh/config` e use esse alias na URL.",
    });
  } else {
    diagnostics.push({
      id: "origin.parse.invalid",
      status: "error",
      message:
        "Não foi possível interpretar o origin SSH. Verifique a URL do remote.",
    });
  }

  if (isBlank(context.gitUserName)) {
    diagnostics.push({
      id: "identity.git.userName.missing",
      status: "warning",
      message:
        "Defina o nome para commits neste repositório: `git config --local user.name \"Seu nome\"`.",
      recommendedAction: {
        type: "run-command",
        label: "Comando sugerido",
        command: 'git config --local user.name "Seu nome"',
      },
    });
  }

  if (isBlank(context.gitUserEmail)) {
    diagnostics.push({
      id: "identity.git.userEmail.missing",
      status: "warning",
      message:
        "Defina o e-mail para commits neste repositório: `git config --local user.email \"email@exemplo.com\"`.",
      recommendedAction: {
        type: "run-command",
        label: "Comando sugerido",
        command: 'git config --local user.email "email@exemplo.com"',
      },
    });
  }

  return {
    parsedOrigin,
    diagnostics,
    overallStatus: computeOverallStatus(diagnostics),
  };
}
