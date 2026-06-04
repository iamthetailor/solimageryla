# Sol Imagery

## GitHub account / git auth

This repo's remote is `iamthetailor/solimageryla`, **not** the machine's primary
GitHub account (`ranchohumilde`). Both accounts are logged into `gh`.

- **Commit identity** is set locally to `iamthetailor` (per-repo `git config user.*`),
  so commits here are authored correctly regardless of the active gh account.
- **Push/merge requires the `iamthetailor` account** (`ranchohumilde` has read-only).
- A **per-repo credential helper** (in `.git/config`) authenticates pushes/fetches as
  `iamthetailor` by fetching its token with `gh auth token -u iamthetailor`. This works
  **without switching** your active gh account — you can stay on `ranchohumilde`
  globally and pushes here still go out as `iamthetailor`.

So normally you don't need to do anything: `git push` / `git pull` just work here while
your active account stays `ranchohumilde` for everything else.

The credential helper config (already set, shown for reference):
```sh
git config --local credential.helper ""
git config --local --add credential.helper \
  '!f() { test "$1" = get && printf "username=iamthetailor\npassword=%s\n" "$(gh auth token -u iamthetailor)"; }; f'
```

Manual account switching (rarely needed):
```sh
gh auth switch --user iamthetailor
gh auth switch --user ranchohumilde
```
