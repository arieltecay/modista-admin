#!/bin/sh
# Prints the context the review agents need: branch, changes and the rules to read.
# Usage: scripts/ai-review-context.sh [base-ref]   (default: origin/main)
set -eu

repo_path=$(cd "$(dirname "$0")/.." && pwd)
base="${1:-origin/main}"

case "$base" in
  -*) echo "ERROR: base inválida: $base" >&2; exit 2 ;;
esac
if ! git -C "$repo_path" rev-parse --verify --quiet "$base^{commit}" >/dev/null; then
  echo "ERROR: no existe la referencia $base" >&2
  exit 2
fi

echo "REPOSITORY=$repo_path"
echo "BRANCH=$(git -C "$repo_path" branch --show-current)"
echo "BASE=$base"
echo "STATUS"
git -C "$repo_path" status --short -uall
echo "COMMITS_SINCE_BASE"
git -C "$repo_path" log --oneline "$base..HEAD" --
echo "DIFF_STAT (tracked files, base...working tree)"
git -C "$repo_path" diff --stat "$base" --
echo "UNTRACKED_FILES"
git -C "$repo_path" ls-files --others --exclude-standard
echo "INSTRUCTIONS"
ls "$repo_path"/docs/agent/*.md "$repo_path"/../AGENTS.md 2>/dev/null || true
echo "REVIEW_PROTOCOL=$repo_path/.ai-review/protocol.md"
echo "REVIEW_AGENTS=$repo_path/.ai-review/agents"
