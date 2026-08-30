# DailyHot project guidance

## Public project role

- DailyHot is a public open-source, provider-neutral realtime ranking frontend and reference implementation. It must remain useful and runnable without access to any private repository, private roadmap, commercial account, or proprietary service.
- `hot.wuaishare.cn` may be used as the first-party public deployment for dogfooding new sources, ranking UX, accessibility, performance, SEO and multilingual behavior, but public defaults must remain deployment-neutral.
- WP Better Trends is a related downstream product with a separate ownership boundary. DailyHot may validate reusable interaction patterns and public data contracts, but it must not become a thin client that requires WP Better Trends, nor may it expose WP Better Trends private strategy or implementation internals.
- Shared capabilities should cross the boundary through stable public contracts, neutral adapters, tests, or deliberately published components—not by importing private repositories, private submodules, private credentials, or unreleased product code.

## Public/private governance

- This repository is public. Do not commit private commercial strategy, competitor intelligence, pricing experiments, unreleased business roadmaps, customer/revenue plans, proprietary ranking/intelligence methods, or other confidential planning material.
- Public branches, issues, PRs, commit messages, docs, test fixtures and screenshots should contain only the minimum public technical context required for the open-source product.
- If private strategy results in a public implementation task, translate it into neutral technical acceptance criteria before it enters this repository; do not reference private document titles, paths, repository names beyond the public relationship stated above, or commercial rationale.
- Optional machine-local confidential notes may live in `AGENTS.private.md`; that file is gitignored and is never an authoritative cross-machine source. Durable confidential strategy belongs in the private WP Better workspace.

## Engineering contract

- The long-term development and production branch is `main`.
- Keep the stable product Release at `1.4.9` for routine maintenance. Bug fixes, UI/copy polish, data-source changes, small features, and integration maintenance must not bump `package.json` automatically; the generated `YYMMDDHHMM` Build Number is the normal deployment identifier.
- Bump the product Release only for a material batch of user-facing features, a significant architecture change, or a release that warrants its own public release notes.
- Public repository defaults must remain deployment-neutral. Do not hard-code private-instance credentials, API keys, OAuth secrets, license keys, commercial entitlements, or a third-party feedback destination that every fork would inherit.
- Data-provider integrations must fail gracefully and remain replaceable. First-party production infrastructure may be selected via configuration, but public code should not make proprietary infrastructure the only viable provider.
- Do not add central customer databases, billing/entitlement systems, private alert schedulers, or commercial account state to DailyHot merely to match a private product. Those concerns belong across the downstream product boundary unless a separate public use case independently justifies them.
- Preserve the current lazy-loading behavior for the Quackback SDK and the shared floating-actions UI. Feedback integrations should use the existing provider configuration (`off`, `quackback`, `github`, `url`) and public metadata. Never expose Quackback management/API secrets in the browser bundle.
- Before claiming a production change is complete, run the relevant audit/build checks and verify the deployed `main` build rather than relying only on local compilation.

## Cross-project promotion rule

- Experiments may start in DailyHot when rapid public UX validation is useful.
- A successful DailyHot experiment is evidence, not an automatic commitment for WP Better Trends. Promotion requires an explicit downstream decision based on maintenance cost, data ownership, licensing, SSR/history requirements and commercial entitlement boundaries.
- Conversely, a commercial/private capability should not be backported into DailyHot unless there is a clear open-source user benefit and the implementation can remain provider-neutral and non-confidential.
