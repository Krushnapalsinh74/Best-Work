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
  
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+["']drizzle-orm\/sqlite-core["']/g, (match, p1) => {
    let parts = p1.split(',').map(s => s.trim()).filter(Boolean);
    let newParts = parts.map(p => {
      if (p === 'serial') return '';
      if (p === 'timestamp') return '';
      if (p === 'boolean') return '';
      return p;
    }).filter(Boolean);
    if (!newParts.includes('integer')) newParts.push('integer');
    return `import { ${newParts.join(', ')} } from "drizzle-orm/sqlite-core"`;
  });
  
  // 2. types
  // serial("id") -> integer("id").primaryKey({ autoIncrement: true })
  content = content.replace(/serial\("([^"]+)"\)\.primaryKey\(\)/g, 'integer("$1").primaryKey({ autoIncrement: true })');
  
  // timestamp("...", { withTimezone: true }) -> integer("...", { mode: "timestamp_ms" })
  content = content.replace(/timestamp\("([^"]+)",\s*\{\s*withTimezone:\s*true\s*\}\)/g, 'integer("$1", { mode: "timestamp_ms" })');
  
  // timestamp("...") -> integer("...", { mode: "timestamp_ms" })
  content = content.replace(/timestamp\("([^"]+)"\)/g, 'integer("$1", { mode: "timestamp_ms" })');

  // boolean("...") -> integer("...", { mode: "boolean" })
  content = content.replace(/boolean\("([^"]+)"\)/g, 'integer("$1", { mode: "boolean" })');

  // .defaultNow() -> .$defaultFn(() => new Date())
  content = content.replace(/\.defaultNow\(\)/g, '.$defaultFn(() => new Date())');

  fs.writeFileSync(p, content);
});

console.log("Migration script complete");
