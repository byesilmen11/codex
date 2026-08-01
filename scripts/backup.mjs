#!/usr/bin/env node
// SQLite veritabanının tutarlı bir yedeğini alır (WAL modunda bile güvenli).
// Kullanım:
//   node scripts/backup.mjs [hedef-dizin]
// CMS_DATA_DIR ortam değişkeni veritabanının yerini belirler (varsayılan ./data).

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = process.env.CMS_DATA_DIR || path.join(process.cwd(), "data");
const SRC = path.join(DATA_DIR, "cms.db");
const outDir = process.argv[2] || path.join(DATA_DIR, "backups");

if (!fs.existsSync(SRC)) {
  console.error(`Veritabanı bulunamadı: ${SRC}`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const dest = path.join(outDir, `cms-${stamp}.db`);

const src = new Database(SRC, { readonly: true });
try {
  await src.backup(dest);
  console.log(`Yedek oluşturuldu: ${dest}`);
} catch (err) {
  console.error("Yedekleme başarısız:", err);
  process.exit(1);
} finally {
  src.close();
}
