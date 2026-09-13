---
name: Prisma raw SQL defaults
description: Raw SQL inserts into Prisma-managed tables may need values that Prisma normally supplies in application code.
---

When inserting directly into tables managed by Prisma, explicitly provide fields whose defaults are client-managed, including UUID primary keys and `@updatedAt` timestamps.

**Why:** Prisma schema defaults such as `uuid()` and `@updatedAt` are not always database defaults, so direct SQL can fail on otherwise valid records.

**How to apply:** Prefer the application/API path for writes; if SQL is required, inspect the schema and provide generated IDs and timestamp values explicitly.