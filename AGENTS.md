# DailyHot project guidance

- The long-term development and production branch is `main`.
- Keep the stable product Release at `1.4.9` for routine maintenance. Bug fixes, UI/copy polish, data-source changes, small features, and integration maintenance must not bump `package.json` automatically; the generated `YYMMDDHHMM` Build Number is the normal deployment identifier.
- Bump the product Release only for a material batch of user-facing features, a significant architecture change, or a release that warrants its own public release notes.
- Public repository defaults must remain deployment-neutral. Do not hard-code private-instance credentials, API keys, OAuth secrets, or a third-party feedback destination that every fork would inherit.
- Feedback integrations should use the existing provider configuration (`off`, `quackback`, `github`, `url`) and public metadata. Never expose Quackback management/API secrets in the browser bundle.
- Preserve the current lazy-loading behavior for the Quackback SDK and the shared floating-actions UI.
- Before claiming a production change is complete, run the relevant audit/build checks and verify the deployed `main` build rather than relying only on local compilation.
