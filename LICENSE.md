# TailorKit licensing

TailorKit uses a mixed-license monorepo.

Unless a more specific package or directory license applies, repository
content is licensed under Apache-2.0. The package metadata identifies the
license that applies to each workspace package.

## Apache-2.0 packages

The public SDKs, core runtime, app tooling, CLI, React integration, sandbox,
protocol packages, UI components, examples, and demos are Apache-2.0:

- `@tailorkit/core`
- `@tailorkit/client-platform`
- `@tailorkit/app`
- `@tailorkit/cli`
- `@tailorkit/react`
- `@tailorkit/sandbox`
- `tailorkit`
- `@tailorkit/ui`

## BUSL-1.1 packages

The hosted platform and associated server infrastructure are BUSL-1.1:

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
commercial agreement. The canonical license texts are maintained in
`licenses/Apache-2.0.md` and `licenses/BUSL-1.1.md`.

Published packages receive a copy of their applicable license automatically
from the release license-preparation script. Do not edit generated package
license files directly.
