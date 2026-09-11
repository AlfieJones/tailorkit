# @tailorkit/sandbox

## 0.1.0-beta.8

### Minor Changes

- 9e46a8b: Run app clients directly inside the opaque-origin iframe sandbox while preserving the validated host messaging boundary. Remove the worker runtime and Worker DOM exports, bundle Preact into app clients, preserve typed component props, and use weak callback target references.

## 0.1.0-beta.7

### Patch Changes

- d75e2fe: Fix TailorKit sandbox workers served from package paths by Vite development servers so injected HMR imports resolve inside the isolated worker runtime.

## 0.1.0-beta.6

### Patch Changes

- a33af95: Send same-origin credentials when loading the sandbox runtime so protected preview deployments can serve the emitted worker asset.

## 0.1.0-beta.5

## 0.1.0-beta.4

### Patch Changes

- 324b281: Resolve public packages to compiled distribution files in both development and production, without custom source export conditions.

  Remove stale source aliases and declaration maps that reference unpublished source files. Generate apps with a single tailorkit dependency and its app subpath exports.

## 0.1.0-beta.3

### Patch Changes

- a02ebee: Include development export targets in published packages so Vite consumers do not need custom resolution conditions. Expose app authoring from `tailorkit/app` and `tailorkit/app/config`.

## 0.1.0-beta.2

## 0.1.0-beta.1

## 0.1.0-beta.0

### Minor Changes

- 4230689: Publish the initial TailorKit beta packages.
