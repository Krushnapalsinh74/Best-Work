import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/Admin/Best-Work/lib/db/src/schema';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');

  // 1. imports
  content = content.replace(/drizzle-orm\/pg-core/g, 'drizzle-orm/sqlite-core');
  content = content.replace(/pgTable/g, 'sqliteTable');
  
  // 2. types
  // serial("id") -> integer("id").primaryKey({ autoIncrement: true })
  content = content.replace(/serial\("([^"]+)"\)\.primaryKey\(\)/g, 'integer("$1").primaryKey({ autoIncrement: true })');
  
  // timestamp("...", { withTimezone: true }) -> integer("...", { mode: "timestamp" })
  content = content.replace(/timestamp\("([^"]+)",\s*\{\s*withTimezone:\s*true\s*\}\)/g, 'integer("$1", { mode: "timestamp" })');
  
  // timestamp("...") -> integer("...", { mode: "timestamp" })
  content = content.replace(/timestamp\("([^"]+)"\)/g, 'integer("$1", { mode: "timestamp" })');

  // boolean("...") -> integer("...", { mode: "boolean" })
  content = content.replace(/boolean\("([^"]+)"\)/g, 'integer("$1", { mode: "boolean" })');

  fs.writeFileSync(p, content);
});

console.log("Migration script complete");
