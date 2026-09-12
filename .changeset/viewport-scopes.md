---
"tailorkit": minor
"@tailorkit/app": minor
"@tailorkit/core": minor
"@tailorkit/react": minor
"@tailorkit/sandbox": minor
"@tailorkit/cli": minor
---

Add viewport-specific app screen selection and layered host scopes. Host contracts now declare `scopes` and `viewports`; app clients register `viewports[name].screens`. Each viewport selects one matching screen and composes context only from that scope and its ancestors. Unsupported matches render nothing, and `false` entries stop fallback.

React integrations now import `Root`, `AppView`, `useApps`, and `useScope` directly. Pass the client to `Root`, add a viewport to every app view, publish only each scope's own context, and regenerate app bindings. Registries are isolated per root.
