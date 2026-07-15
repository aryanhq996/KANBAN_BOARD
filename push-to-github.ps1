# Run from PowerShell: .\push-to-github.ps1
Set-Location $PSScriptRoot

if (-not (Test-Path .git)) {
    git init
}

git add index.html styles.css app.js
$status = git status --porcelain
if ($status) {
    git commit -m "Add kanban board with drag-and-drop and localStorage"
} else {
    Write-Host "Nothing new to commit."
}

Write-Host "`nChecking GitHub CLI auth..."
gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nRun 'gh auth login' first, then run this script again."
    exit 1
}

$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "`nCreating GitHub repo and pushing..."
    gh repo create kanban-board --public --source=. --remote=origin `
        --description "Simple Kanban board built with HTML, CSS, and JavaScript" --push
} else {
    Write-Host "`nRemote already set: $remote"
    git push -u origin HEAD
}

Write-Host "`n--- Done ---"
git status
Write-Host "Remote: $(git remote get-url origin)"
Write-Host "Open: https://github.com/$(gh api user -q .login)/kanban-board"
