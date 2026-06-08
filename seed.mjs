import { createClient } from "@libsql/client";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "sqlite.db");
const client = createClient({ url: `file:${dbPath}` });

async function seed() {
  try {
    await client.execute({
      sql: "INSERT INTO admin_users (name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      args: ["Super Admin", "admin@admin.com", "admin123", "superadmin", Date.now(), Date.now()]
    });
    console.log("Admin user seeded successfully!");
  } catch (err) {
    console.error("Error seeding:", err);
  }
}

seed();
