/**
 * Resultado de execução de comando Git (espelha o JSON retornado pelos comandos Tauri).
 */
export type CommandResult<T extends string = string> =
  | { ok: true; value: T }
  | { ok: false; message: string; exitCode?: number };
