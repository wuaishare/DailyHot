# DailyHot Repository Independence Design

## Decision

Adopt **Option A: governance independence without physically detaching from the GitHub fork network**.

The repository remains a GitHub fork of `imsyy/DailyHot` for provenance and historical continuity, while `wuaishare/DailyHot` becomes an independently maintained downstream project with its own default branch, issue tracker, documentation, deployment flow, and configurable feedback integration.

## Goals

1. Promote the actively maintained code line from `live` to `main`.
2. Keep clear attribution to the original `imsyy/DailyHot` project and MIT license.
3. Stop treating the repository as a temporary self-use branch.
4. Enable GitHub Issues for open-source code and deployment feedback.
5. Keep `feedback.wuaishare.cn` as the product feedback center for the hosted 吾爱热榜 instance.
6. Remove Wuaishare-specific Quackback hard-coding from the public runtime.
7. Make feedback configurable for downstream users without exposing secrets.
8. Preserve the current Vercel production deployment until branch tracking is deliberately switched from `live` to `main`.

## Branch and repository governance

### Target branch model

- `main`: the sole long-term development/default branch.
- `live`: retained temporarily as a compatibility/deployment branch until Vercel production tracking has been moved to `main` and production has been verified.
- `master`: historical upstream branch, no longer used for development.
- Tag `upstream-imsyy-2024-11-05`: points at upstream commit `8b91ad9d35f7dad3b0c2a0b671001a9de9873115` so the inherited baseline remains easy to inspect after the obsolete `master` branch is retired.

GitHub default branch will be changed to `main` after `main` is pushed successfully.

### Fork relationship

Do not detach from the GitHub fork network in this phase. The existing fork relationship is useful provenance and avoids destructive repository recreation. Independence is expressed through governance, active maintenance, documentation, and project behavior rather than by removing GitHub's fork metadata.

## README and project identity

The README should identify this repository as a long-term maintained downstream edition rather than a temporary self-use fork.

It must:

- thank and link the original author/project prominently;
- state that this repository originated from `imsyy/DailyHot` and retains MIT licensing/history;
- state that the upstream has not published a new commit since November 2024 as of this maintenance transition;
- describe this repository as independently maintained and no longer guaranteed to remain configuration/feature compatible with upstream;
- point to `https://hot.wuaishare.cn/` as the hosted demo/production instance;
- document GitHub Issues for source-code/deployment bugs and feature requests;
- document the Wuaishare Feedback Center for end-user product feedback on the hosted instance;
- document the new feedback configuration variables.

## Feedback architecture

### Security principle

A public fork must not contain any management credential, API key, MCP token, OAuth secret, database password, or Quackback SSO secret.

Quackback's public instance URL is not a secret, but the public repository must not force downstream deployments to submit feedback to Wuaishare.

### Provider model

Introduce a small feedback configuration layer with these providers:

- `off`: no feedback action is rendered.
- `quackback`: lazily load the Quackback public widget from the configured URL.
- `github`: open the configured GitHub Issues URL.
- `url`: open any configured external feedback page.

Environment variables:

- `VITE_FEEDBACK_PROVIDER`: `off | quackback | github | url`; repository default is `off`.
- `VITE_FEEDBACK_URL`: provider destination/instance URL.
- `VITE_FEEDBACK_PRODUCT_NAME`: optional product label attached to Quackback metadata; default `DailyHot`.
- `VITE_FEEDBACK_PRODUCT_KEY`: optional stable product key attached to Quackback metadata; default `dailyhot`.

The hosted Wuaishare deployment can set:

```env
VITE_FEEDBACK_PROVIDER="quackback"
VITE_FEEDBACK_URL="https://feedback.wuaishare.cn"
VITE_FEEDBACK_PRODUCT_NAME="吾爱热榜"
VITE_FEEDBACK_PRODUCT_KEY="dailyhot"
```

Downstream forks can point the same build to their own Quackback instance, GitHub Issues, Fider/Canny/form service, or disable feedback entirely.

### Runtime behavior

- `FloatingActions` renders the feedback button only when feedback is configured and enabled.
- Quackback remains lazy-loaded only after the user clicks the feedback action.
- GitHub/URL providers open the configured destination with `noopener,noreferrer` behavior.
- Footer feedback links use the same resolved configuration; there is no independent hard-coded Wuaishare feedback link.
- Runtime metadata sent to Quackback remains non-secret diagnostic context such as version/build/page path/locale/viewport.

## GitHub Issues

Enable GitHub Issues and add issue forms:

- Bug report: reproduction, expected/actual behavior, deployment mode, browser/OS, version/build.
- Feature request: problem, proposed behavior, alternatives/impact.
- Issue configuration: link hosted-instance product feedback to `https://feedback.wuaishare.cn/`; direct security reports away from public Issues.

GitHub Issues are for open-source project engineering. Quackback is for product/user feedback on the Wuaishare-hosted service.

## Package metadata

Normalize `package.json` metadata:

- `homepage`: hosted demo URL.
- `repository`: `wuaishare/DailyHot`.
- `bugs`: GitHub Issues URL.
- `author`: 吾爱分享网 URL.

Do not use a misleading custom `github` field as an author/homepage alias.

## Vercel migration safety

Do not assume GitHub default-branch changes alter Vercel Production Branch tracking.

Safe sequence:

1. Commit and verify code on the temporary worktree branch based on current `live`.
2. Promote the verified worktree commit directly to a new `main` branch; do **not** update `live` yet, because `live` is still the active Vercel Production Branch.
3. Push `main` and verify its merge base is the current production `live` commit plus only the intended independence/configuration changes.
4. Change GitHub default branch to `main` and enable Issues. Keep `live` untouched so the existing production deployment continues to use the previous feedback behavior.
5. In Vercel Production environment, set `VITE_FEEDBACK_PROVIDER=quackback`, `VITE_FEEDBACK_URL=https://feedback.wuaishare.cn`, `VITE_FEEDBACK_PRODUCT_NAME=吾爱热榜`, and `VITE_FEEDBACK_PRODUCT_KEY=dailyhot`.
6. Change Vercel Production Branch/Branch Tracking from `live` to `main` using an authenticated Vercel control path.
7. Trigger/verify the `main` production deployment and confirm `hot.wuaishare.cn` exposes the expected build number and feedback widget behavior.
8. Keep remote `live` until that Vercel verification is complete; delete it only in a later cleanup.

If Vercel credentials/control tooling are unavailable in this session, stop after step 4 and report the exact remaining dashboard actions. Do not update or delete `live`.

## Verification

Before repository governance changes are finalized:

- `npm run build` succeeds.
- source scan finds no embedded Quackback/API credentials.
- feedback defaults to disabled when env vars are absent.
- provider parsing covers `off`, `quackback`, `github`, and `url`.
- README and `.env.example` document the contract.
- `main` and `live` point to the same verified commit before default-branch switch.
- GitHub default branch and Issues status are read back through GitHub API after mutation.

## Out of scope

- Physically detaching the GitHub fork network.
- Deleting `live` in the same migration window.
- Rebranding repository/package name away from DailyHot.
- Moving the hosted product away from Vercel.
- Adding authenticated Quackback identities or management APIs to the frontend.
