# Package lifecycle

## ADDED Requirements

### Requirement: @vanduo-oss/framework SHALL be retired with no further releases

As of 2026-07-25 the Vanduo legacy (dual-engine) line is retired. `1.7.1` is the final
published version of `@vanduo-oss/framework`. The repository SHALL be
archived read-only, and no subsequent version SHALL be published.
The successor is `@vanduo-oss/vd3` for Vue 3 consumers; none for vanilla consumers.

#### Scenario: New work is proposed against this repository
- **WHEN** a feature, fix, or OpenSpec change is proposed for @vanduo-oss/framework
- **THEN** it SHALL be redirected to the perspective line (`vd3` / `vd3-cbun` / `vd3-docs`)
- **AND** no new version of @vanduo-oss/framework SHALL be published

#### Scenario: An unshipped change is found in openspec/changes
- **WHEN** an OpenSpec change existed but had not shipped at retirement
- **THEN** it SHALL live under `openspec/changes/archive/` marked **ABANDONED**
- **AND** it SHALL NOT be treated as work in progress

### Requirement: The retired artifact SHALL keep working for existing consumers

Retirement SHALL be a stop to development, not a removal. Existing consumers SHALL
continue to resolve and run the final version unchanged.

#### Scenario: An existing consumer installs the final version
- **WHEN** a consumer runs `pnpm add @vanduo-oss/framework`
- **THEN** the install SHALL succeed and resolve `1.7.1`
- **AND** the registry SHALL surface a deprecation notice naming the successor

#### Scenario: The package is unpublished instead of deprecated
- **WHEN** removal from the registry is considered
- **THEN** it SHALL be rejected, because unpublishing breaks existing lockfiles
- **AND** `npm deprecate` SHALL be used instead, which is advisory only

### Requirement: The successor SHALL be discoverable from every entry point

A reader arriving at any surface of this repository SHALL be able to find the successor
without reading commit history.

#### Scenario: A reader opens the README or the npm package page
- **WHEN** `README.md` is rendered on GitHub or npmjs.com
- **THEN** a retirement notice SHALL appear above the package description
- **AND** it SHALL name the successor and link the migration guide at <https://vanduo-oss.github.io/vd3-docs/guides/migration>

#### Scenario: A reader opens the changelog
- **WHEN** `CHANGELOG.md` is read
- **THEN** a `## Retired — 2026-07-25` entry SHALL sit above the newest version entry
- **AND** it SHALL name the final version and the `retired-v1.7.1` git tag

#### Scenario: An agent loads the package skill
- **WHEN** `SKILL.md` is loaded
- **THEN** the frontmatter `description` SHALL state that the package is retired
- **AND** a retirement notice SHALL appear at the top of the skill body
