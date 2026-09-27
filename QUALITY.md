# Quality contract

Sillar Toast treats accessibility, stable package exports, and small runtime size as public API.

A release must pass:

- Strict TypeScript validation.
- ESM build with declaration files.
- Store unit tests for create, update, max queue, dismiss, remove, and promise flows.
- React server-render smoke tests for viewport, action, status, and alert semantics.
- npm dry-run packaging review before publish.
- npm dependency audit with zero production vulnerabilities.

Current package dry-run size for 1.0.0 is expected to stay near 10 KB compressed unless a release intentionally adds public capability.
