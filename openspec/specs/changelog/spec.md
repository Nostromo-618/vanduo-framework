# changelog Specification

## Purpose

Normative rules for authoring Vanduo release notes on vanduo.dev and in framework release communications.

## Requirements

### Requirement: Two tracked products only

Release notes SHALL track exactly two product columns:

1. **Framework** — `@vanduo-oss/framework` (core CSS/JS package)
2. **Ecosystem** — separately versioned `@vanduo-oss/*` extension packages (for example music-player, charts)

#### Scenario: Docs site work is not a product column

- GIVEN a change that only affects the vanduo-docs repository (navbar markup, doc page copy, demo HTML)
- WHEN writing a framework release entry
- THEN the change SHALL NOT appear under a "Docs" column or as a separate documentation product release

#### Scenario: Framework change with docs sync

- GIVEN a framework CSS or JS fix shipped in `@vanduo-oss/framework`
- WHEN the docs site syncs rebuilt `dist/` artifacts
- THEN the entry SHALL be documented under **Framework** only

### Requirement: Framework-only releases omit empty Ecosystem column

When a version has no ecosystem package changes, the changelog entry SHALL list **Framework** only and SHALL NOT include an empty Ecosystem column.

#### Scenario: Patch release with framework fixes only

- GIVEN v1.4.5 contains draggable and forms CSS fixes only
- WHEN the changelog card is rendered
- THEN it shows a single Framework section with Fixes
- AND no Ecosystem section is present

### Requirement: Change group taxonomy

Framework and Ecosystem entries SHALL use these group headings when applicable:

- **New** — new capability or package
- **Enhancements** — improvements to existing behavior
- **Fixes** — bug fixes
- **Changes** — breaking or behavioral changes consumers must know
- **Updates** — rebuilds, pins, housekeeping tied to the product

Omit empty groups. Do not invent a "Docs" group.

### Requirement: Latest badge

Exactly one version card SHALL carry the "Latest" badge — the highest shipped framework version documented on the changelog page.

#### Scenario: New framework release

- GIVEN v1.4.5 is published
- WHEN the changelog page is updated
- THEN v1.4.5 has the Latest badge
- AND v1.4.4 no longer has it
