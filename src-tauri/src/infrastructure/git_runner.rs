use std::path::{Path, PathBuf};
use std::process::Command;

use serde::Serialize;

/// Resposta serializável para o frontend (alinhada a `CommandResult` em TS).
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCommandResult {
    pub ok: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exit_code: Option<i32>,
}

impl GitCommandResult {
    pub fn success(value: String) -> Self {
        Self {
            ok: true,
            value: Some(value),
            message: None,
            exit_code: None,
        }
    }

    pub fn failure(message: String, exit_code: Option<i32>) -> Self {
        Self {
            ok: false,
            value: None,
            message: Some(message),
            exit_code,
        }
    }

    fn from_git_run(err: GitRunError) -> Self {
        match err {
            GitRunError::Spawn(msg) => Self::failure(format!("failed to run git: {msg}"), None),
            GitRunError::Utf8(msg) => Self::failure(format!("invalid utf-8 in git output: {msg}"), None),
            GitRunError::Git { exit_code, stderr } => {
                let message = if stderr.is_empty() {
                    "git command failed".to_string()
                } else {
                    stderr
                };
                Self::failure(message, exit_code)
            }
        }
    }
}

#[derive(Debug)]
enum GitRunError {
    Spawn(String),
    Utf8(String),
    Git {
        exit_code: Option<i32>,
        stderr: String,
    },
}

fn validate_workdir(cwd: &str) -> Result<PathBuf, String> {
    let path = Path::new(cwd);
    if !path.is_absolute() {
        return Err("working directory must be an absolute path".to_string());
    }
    let meta = path
        .metadata()
        .map_err(|e| format!("cannot read path: {e}"))?;
    if !meta.is_dir() {
        return Err("working directory is not a directory".to_string());
    }
    Ok(path.to_path_buf())
}

/// Executa `git` sem shell, apenas com argumentos literais definidos aqui.
fn run_git(workdir: &Path, args: &[&str]) -> Result<String, GitRunError> {
    let output = Command::new("git")
        .current_dir(workdir)
        .args(args)
        .output()
        .map_err(|e| GitRunError::Spawn(e.to_string()))?;

    let stdout = String::from_utf8(output.stdout).map_err(|e| GitRunError::Utf8(e.to_string()))?;
    let stdout = stdout.trim_end().to_owned();
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();

    if output.status.success() {
        Ok(stdout)
    } else {
        Err(GitRunError::Git {
            exit_code: output.status.code(),
            stderr,
        })
    }
}

fn run_git_op(cwd: &str, args: &[&str]) -> GitCommandResult {
    let workdir = match validate_workdir(cwd) {
        Ok(p) => p,
        Err(msg) => return GitCommandResult::failure(msg, None),
    };
    match run_git(&workdir, args) {
        Ok(out) => GitCommandResult::success(out),
        Err(e) => GitCommandResult::from_git_run(e),
    }
}

pub fn repo_root(cwd: &str) -> GitCommandResult {
    run_git_op(cwd, &["rev-parse", "--show-toplevel"])
}

pub fn origin_url(cwd: &str) -> GitCommandResult {
    run_git_op(cwd, &["remote", "get-url", "origin"])
}

pub fn local_user_name(cwd: &str) -> GitCommandResult {
    run_git_op(cwd, &["config", "--local", "user.name"])
}

pub fn local_user_email(cwd: &str) -> GitCommandResult {
    run_git_op(cwd, &["config", "--local", "user.email"])
}
