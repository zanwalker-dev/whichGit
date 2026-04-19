use tauri::command;

use crate::infrastructure::git_runner::{
    local_user_email, local_user_name, origin_url, repo_root, GitCommandResult,
};

#[command]
pub fn get_repo_root(cwd: String) -> GitCommandResult {
    repo_root(&cwd)
}

#[command]
pub fn get_origin_url(cwd: String) -> GitCommandResult {
    origin_url(&cwd)
}

#[command]
pub fn get_git_user_name(cwd: String) -> GitCommandResult {
    local_user_name(&cwd)
}

#[command]
pub fn get_git_user_email(cwd: String) -> GitCommandResult {
    local_user_email(&cwd)
}
