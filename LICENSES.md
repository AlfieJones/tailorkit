# TailorKit licensing

TailorKit is a mixed-license monorepo. The package metadata and license files
in each published package identify the license that applies to that package.

## Apache-2.0 packages

These packages are intended for direct use by application developers and do not
have BUSL-licensed runtime dependencies:

- `@tailorkit/core`
- `@tailorkit/client-platform`
- `@tailorkit/app`
- `@tailorkit/cli`
- `@tailorkit/react`
- `@tailorkit/sandbox`
- `tailorkit`
- `@tailorkit/ui`

The Apache-2.0 license text is in
[`LICENSE-APACHE-2.0`](./LICENSE-APACHE-2.0), with a copy included in each
published package.

## BUSL-1.1 packages

These packages implement the hosted platform and its associated server
infrastructure:

- `apps/web`
- `apps/assets`
- `@tailorkit/api`
- `@tailorkit/api-platform`
- `@tailorkit/api-utils`
- `@tailorkit/asset-delivery`
- `@tailorkit/auth`
- `@tailorkit/config`
- `@tailorkit/db`
- `@tailorkit/email`
- `@tailorkit/env`
- `@tailorkit/kv`
- `@tailorkit/observability`
- `@tailorkit/storage`

BUSL-licensed code may be used for development, testing, staging, evaluation,
demonstration, and continuous integration. Production use requires a
commercial agreement. See [`LICENSE`](./LICENSE).

## Examples and documentation

Examples and demos are Apache-2.0 licensed. Documentation prose and code
snippets follow the license stated by the containing package or file.
