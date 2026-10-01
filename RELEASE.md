# Release checklist

1. Confirm `npm run check` passes.
2. Confirm `npm pack --dry-run` contains only expected files.
3. Confirm the package version matches the intended release.
4. Configure npm Trusted Publishing for `sillar-toast` with owner `uppy19d0`, repository `sillar-toast`, workflow filename `publish.yml`, environment `npm`, and direct `npm publish` allowed. Require npm 2FA for account changes and revoke old automation tokens after the first trusted release succeeds.
5. Push the `vX.Y.Z` tag pointing to the checked commit. The publish workflow verifies the tag, package contents, dependency signatures, tests, and provenance before npm receives the package.
6. Confirm the new version shows a provenance attestation on npm, then create a GitHub release from the same tag.
