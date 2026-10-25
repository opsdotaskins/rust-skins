import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

export { schema };

type Database = NeonHttpDatabase<typeof schema>;

const connectionString = process.env.DATABASE_URL;

/**
 * Data layer with two drivers:
 *  - When DATABASE_URL is set, we use the dedicated Neon Postgres (production).
 *  - When it is NOT set, we boot an in-process Postgres (PGlite) and seed it,
 *    so the site is fully browsable locally without provisioning a database.
 *    This preview data lives in memory and resets on restart.
 *
 * `db` is a live binding reassigned once PGlite is ready. Every query path must
 * `await ensureDb()` first so the schema and seed exist before the first query.
 */
export let db: Database = connectionString
  ? drizzleNeon(neon(connectionString), { schema })
  : (undefined as unknown as Database);

let initPromise: Promise<void> | null = null;

export async function ensureDb(): Promise<void> {
  if (connectionString) return; // real database — nothing to bootstrap
  if (!initPromise) initPromise = bootstrapPreviewDb();
  return initPromise;
}

async function bootstrapPreviewDb(): Promise<void> {
  // Reuse a single in-memory database across HMR reloads in dev.
  const g = globalThis as unknown as { __rvPreviewDb?: Database };
  if (g.__rvPreviewDb) {
    db = g.__rvPreviewDb;
    return;
  }

  const [{ PGlite }, { drizzle }, { readFileSync, readdirSync }, path] = await Promise.all([
    import("@electric-sql/pglite"),
    import("drizzle-orm/pglite"),
    import("node:fs"),
    import("node:path"),
  ]);

  const client = new PGlite(); // ephemeral, in-memory
  const previewDb = drizzle(client, { schema });

  // Apply the generated schema (all migrations, in order).
  const dir = path.join(process.cwd(), "drizzle");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const sql = readFileSync(path.join(dir, file), "utf8").replace(
      /-->\s*statement-breakpoint/g,
      ""
    );
    await client.exec(sql);
  }

  const { runSeed } = await import("./seed-core");
  await runSeed(previewDb);

  db = previewDb as unknown as Database;
  g.__rvPreviewDb = db;

  if (process.env.NODE_ENV !== "production") {
    console.log(
      "[rust-skins] DATABASE_URL not set — using an in-memory preview database (seeded). Set DATABASE_URL to use your Neon database."
    );
  }
}
