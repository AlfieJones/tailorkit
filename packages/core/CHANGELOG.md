# @tailorkit/core

## 0.1.0-beta.8

### Patch Changes

- @tailorkit/client-platform@0.1.0-beta.8

## 0.1.0-beta.7

### Patch Changes

- 2e7b3a4: Add optional light and dark app logos to the deployment pipeline, including validated SVG, PNG, and WebP uploads, hosted logo URLs, and a 1 MiB combined client asset limit.
- Updated dependencies [2e7b3a4]
  - @tailorkit/client-platform@0.1.0-beta.7

## 0.1.0-beta.6

### Patch Changes

- @tailorkit/client-platform@0.1.0-beta.6

## 0.1.0-beta.5

### Patch Changes

- 695cdad: Redirect unauthenticated CLI approval visits through a host application's sign-in page.
- @tailorkit/client-platform@0.1.0-beta.5

## 0.1.0-beta.4

### Patch Changes

- 324b281: Resolve public packages to compiled distribution files in both development and production, without custom source export conditions.

  Remove stale source aliases and declaration maps that reference unpublished source files. Generate apps with a single tailorkit dependency and its app subpath exports.

- Updated dependencies [324b281]
  - @tailorkit/client-platform@0.1.0-beta.4

## 0.1.0-beta.3

### Patch Changes

- a02ebee: Include development export targets in published packages so Vite consumers do not need custom resolution conditions. Expose app authoring from `tailorkit/app` and `tailorkit/app/config`.
- Updated dependencies [a02ebee]
  - @tailorkit/client-platform@0.1.0-beta.3

## 0.1.0-beta.2

### Patch Changes

- 586cc14: Expose platform-managed app bundle URLs on permanent tenant subdomains in registry responses. Hosted apps do not require an assetsBaseUrl override or direct access to the platform's storage provider.
- Updated dependencies [586cc14]
  - @tailorkit/client-platform@0.1.0-beta.2

## 0.1.0-beta.1

### Patch Changes

- c0bdd68: Test the trusted-publishing beta release flow.
- @tailorkit/client-platform@0.1.0-beta.1

## 0.1.0-beta.0

### Minor Changes

- 4230689: Publish the initial TailorKit beta packages.

### Patch Changes

- Updated dependencies [4230689]
  - @tailorkit/client-platform@0.1.0-beta.0
