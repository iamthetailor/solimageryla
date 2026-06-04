# Sol Imagery

## GitHub account / git auth

This repo's remote is `iamthetailor/solimageryla`, **not** the machine's primary
GitHub account (`ranchohumilde`).

- **Commit identity** is set locally to `iamthetailor` (per-repo `git config user.*`),
  so commits here are authored correctly regardless of the active gh account.
- **Push/merge requires the `iamthetailor` account.** `ranchohumilde` has read-only
  (pull) access. The `gh` credential helper only serves the *active* account's token.
- A `.git/hooks/pre-push` hook auto-switches the active gh account to `iamthetailor`
  before any push, so pushes "just work". It does **not** switch back afterward.

Manual switching:
```sh
gh auth switch --user iamthetailor    # to work on / push this repo
gh auth switch --user ranchohumilde   # to return to the primary account
```
