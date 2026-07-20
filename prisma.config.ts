import path from "node:path"
import { defineConfig } from "prisma/config"

// Prisma CLI operations (migrate, generate, studio) need a direct (non-pooled)
// connection: Neon's pooled connection routes through PgBouncer in transaction
// mode, which does not reliably support the session-level advisory locks that
// `migrate deploy` holds for the duration of a migration. The running app
// itself never reads this file — it opens its own pooled connection directly
// via DATABASE_URL in src/server/db.ts, so pooling for regular query traffic
// is unaffected by this.
const datasourceUrl =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/uni_events"

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: datasourceUrl,
  },
})
