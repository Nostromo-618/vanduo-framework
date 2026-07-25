# Retire framework — Tasks

- [x] 1. Pin the transitive dev-dependency advisories in `pnpm-workspace.yaml`, reinstall, and confirm `pnpm audit --audit-level=moderate` reports no known vulnerabilities and `pnpm build` still succeeds.
- [x] 2. Tag the final state: `git tag -a retired-v1.7.1` and push it (must happen before the repo goes read-only).
- [x] 3. Add the retirement notice to the top of `README.md` with the successor and migration links.
- [x] 4. Add the `## Retired — 2026-07-25` entry to `CHANGELOG.md`.
- [x] 5. Add the retirement note to `SKILL.md` (frontmatter `description` + body banner).
- [x] 6. Move all unshipped OpenSpec changes to `openspec/changes/archive/`, each proposal marked **ABANDONED**.
- [x] 7. Write the `specs/lifecycle/spec.md` delta recording the retired lifecycle, the keep-working guarantee, and the discoverability requirements.
- [x] 8. Confirm `openspec validate retire-framework --type change` passes and `openspec list` shows no other active change.
- [x] 9. Open the retirement PR against `main` and merge it.
- [ ] 10. Run `npm deprecate @vanduo-oss/framework` pointing at the successor (requires npm 2FA — maintainer-run).
- [ ] 11. Close Dependabot PRs, disable Dependabot, sweep stale branches, set the `[RETIRED]` description + topic.
- [ ] 12. Archive the repository on GitHub.
