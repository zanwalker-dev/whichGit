import { Fragment, useEffect, useState } from "react";

import { buildRepositoryStateView } from "../services/buildRepositoryStateView";
import { evaluateRepositoryDiagnostics } from "../services/evaluateRepositoryDiagnostics";
import { loadCurrentRepositoryContext } from "../services/repositoryContext";
import type { RepositoryContext } from "../shared/types/repository-context";
import type {
  DiagnosticStatus,
  RepositoryDiagnostics,
} from "../shared/types/repository-diagnostics";
import type { RepositoryStateView } from "../shared/types/repository-state-view";

import "./app.css";

type ViewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; context: RepositoryContext };

function formatValue(value: string | null): string {
  return value === null ? "—" : value;
}

function overallStatusLabel(status: DiagnosticStatus): string {
  switch (status) {
    case "ok":
      return "OK";
    case "warning":
      return "Atenção";
    case "error":
      return "Erro";
    default:
      return status;
  }
}

function statusBadgeClass(status: DiagnosticStatus): string {
  switch (status) {
    case "ok":
      return "status-badge status-badge--ok";
    case "warning":
      return "status-badge status-badge--warning";
    case "error":
      return "status-badge status-badge--error";
    default:
      return "status-badge";
  }
}

function diagnosticItemClass(status: DiagnosticStatus): string {
  switch (status) {
    case "ok":
      return "diagnostic-item diagnostic-item--ok";
    case "warning":
      return "diagnostic-item diagnostic-item--warning";
    case "error":
      return "diagnostic-item diagnostic-item--error";
    default:
      return "diagnostic-item";
  }
}

function RepositoryStateSection({ state }: { state: RepositoryStateView }) {
  const rows: { label: string; value: string | null }[] = [
    { label: "repo path", value: state.repoPath },
    { label: "origin url", value: state.originUrl },
    { label: "protocol", value: state.protocol },
    { label: "alias", value: state.sshAlias },
    { label: "owner", value: state.owner },
    { label: "repo", value: state.repo },
    { label: "git user name", value: state.gitUserName },
    { label: "git user email", value: state.gitUserEmail },
  ];

  return (
    <section className="panel" aria-label="Estado do repositório">
      <h2 className="panel__title">Estado do repositório</h2>
      <dl className="kv-list">
        {rows.map(({ label, value }) => (
          <Fragment key={label}>
            <dt>{label}</dt>
            <dd className={value === null ? "value--empty" : undefined}>
              {formatValue(value)}
            </dd>
          </Fragment>
        ))}
      </dl>
    </section>
  );
}

function DiagnosticsSection({ diagnostics }: { diagnostics: RepositoryDiagnostics }) {
  return (
    <section className="panel" aria-label="Diagnóstico">
      <h2 className="panel__title">Diagnóstico</h2>
      <div className="diagnostic-header">
        <p className="diagnostic-header__label">Status geral</p>
        <span
          className={statusBadgeClass(diagnostics.overallStatus)}
          title={overallStatusLabel(diagnostics.overallStatus)}
        >
          {overallStatusLabel(diagnostics.overallStatus)}
        </span>
      </div>
      <ul className="diagnostic-list">
        {diagnostics.diagnostics.map((item) => (
          <li
            key={item.id}
            className={diagnosticItemClass(item.status)}
          >
            <div className="diagnostic-item__meta">
              [{item.status}] <code>{item.id}</code>
            </div>
            <p className="diagnostic-item__message">{item.message}</p>
            {item.recommendedAction?.type === "run-command" ? (
              <>
                <span className="diagnostic-item__action-label">
                  {item.recommendedAction.label}
                </span>
                <pre className="terminal-block">
                  {item.recommendedAction.command}
                </pre>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function App() {
  const [state, setState] = useState<ViewState>({ status: "loading" });

  useEffect(() => {
    void loadCurrentRepositoryContext().then((outcome) => {
      if (outcome.ok) {
        setState({ status: "ready", context: outcome.context });
      } else {
        setState({ status: "error", message: outcome.error });
      }
    });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">whichGit</h1>
        <p className="app-subtitle">git / ssh identity monitor</p>
      </header>

      {state.status === "loading" ? (
        <p className="app-loading">Carregando…</p>
      ) : null}

      {state.status === "error" ? (
        <p className="app-error" role="alert">
          {state.message}
        </p>
      ) : null}

      {state.status === "ready" ? (
        <>
          <RepositoryStateSection
            state={buildRepositoryStateView(state.context)}
          />
          <DiagnosticsSection
            diagnostics={evaluateRepositoryDiagnostics(state.context)}
          />
        </>
      ) : null}
    </div>
  );
}

export default App;
