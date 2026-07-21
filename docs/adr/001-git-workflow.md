# ADR 001: Git Workflow

## Status
Accepted

## Context
The project needs a consistent collaboration workflow. Multiple developers (or AI assistants) work on features, fixes, and documentation concurrently. Without strict rules, the main branch can become unstable.

## Problem
How to organize development work to keep `main` always deployable while allowing parallel work?

## Alternatives

1. **Direct commits to main** — Simple but high risk. No code review, no CI validation before deploy.
2. **Git Flow** — Full release branches, hotfixes, develop branch. Too complex for a single-team project.
3. **GitHub Flow** — One branch per feature, PR to main, squash merge. Selected approach.
4. **Trunk-based development** — Short-lived branches, rebase onto main. Requires strong CI and discipline.

## Decision
Adopt a simplified GitHub Flow:

- One branch per feature/fix/docs
- Branch prefixes: `feat/`, `fix/`, `docs/`
- Merge via `--no-ff` (no squash) to preserve full commit history
- Never commit directly to `main`
- Even database operations (manual updates, backfills) go through a branch
- After merging to `main`, Vercel auto-deploys

## Consequences

Positive:
- `main` is always deployable
- Full commit history preserved via `--no-ff`
- PRs enable code review before deployment

Negative:
- More branches to manage
- Merge commits add to history
- `--no-ff` means no linear history
