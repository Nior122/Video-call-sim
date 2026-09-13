---
name: Cloudflare npm lockfiles
description: Deployment-safe npm lockfile registry requirements for this project.
---

Keep committed npm lockfiles on public registry URLs; Replit package installation can write internal package-firewall URLs that are unreachable from Cloudflare builds.

**Why:** Cloudflare runs `npm clean-install` outside Replit, so internal tarball URLs fail before the application build starts.

**How to apply:** Before committing dependency changes, check package-lock.json for `package-firewall.replit.internal` or other private registry hosts and verify `npm ci --registry=https://registry.npmjs.org` in a clean temporary directory.