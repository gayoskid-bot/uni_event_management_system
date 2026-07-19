import path from "node:path"
import { defineConfig } from "prisma/config"

const datasourceUrl = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/uni_events"

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: datasourceUrl,
  },
})
