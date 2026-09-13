# TailorKit licensing

TailorKit uses a mixed-license monorepo.

Unless a more specific package or directory license applies, repository
content is licensed under Apache-2.0. The package metadata identifies the
license that applies to each workspace package.

BUSL-licensed code may be used for development, testing, staging, evaluation,
demonstration, and continuous integration. Production use requires a
commercial agreement. The canonical license texts are maintained in
`licenses/Apache-2.0.md` and `licenses/BUSL-1.1.md`.

Every workspace package has a committed `LICENSE.md` containing the exact
license text selected by its `package.json` `license` field. This includes
private packages and applications. Run `pnpm licenses:sync` after changing a
package license or a canonical license text.
