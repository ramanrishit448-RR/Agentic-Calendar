import { config } from "dotenv";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { closePool, getPool } from "../src/db/pool";

config({ path: resolve(process.cwd(), ".env") });

async function main() {
  const sqlDir = resolve(process.cwd(), "sql");
  const files = readdirSync(sqlDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  const pool = getPool();

  for (const file of files) {
    const sql = readFileSync(resolve(sqlDir, file), "utf-8");
    await pool.query(sql);

    console.log(`Migrated: sql/${file}`);
  }

  await closePool();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
