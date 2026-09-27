# Release checklist

1. Confirm `npm run check` passes.
2. Confirm `npm pack --dry-run` contains only expected files.
3. Confirm the package version matches the intended release.
4. Publish with provenance when running from GitHub Actions, or with a short-lived npm automation token locally.
5. Create a GitHub release from the same commit.
