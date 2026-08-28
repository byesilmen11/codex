// Yuvo prototip build: yerel css/js'i tek dosyaya gömer; https link'leri (Google Fonts) aynen geçirir.
// Çıktılar: prototype/dist/index.html (tam sayfa) + prototype/dist/artifact.html (yalnız içerik)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'prototype');
const html = readFileSync(join(root, 'index.html'), 'utf8');

let styles = '', scripts = '', externalLinks = '';

for (const m of html.matchAll(/<link[^>]+href="([^"]+)"[^>]*>/g)) {
  const href = m[1];
  if (href.startsWith('http')) { externalLinks += m[0] + '\n'; continue; }
  styles += `/* == ${href} == */\n` + readFileSync(join(root, href), 'utf8') + '\n';
}
for (const m of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  const p = join(root, m[1]);
  if (!existsSync(p)) { console.warn('UYARI: eksik script atlandı: ' + m[1]); continue; }
  scripts += `/* == ${m[1]} == */\n` + readFileSync(p, 'utf8') + '\n';
}

const markup = html.match(/<div id="app">[\s\S]*?<\/div>\s*(?=<script)/)[0].trim();

const full = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<title>Yuvo Prototip</title>
${externalLinks}<style>
${styles}
</style>
</head>
<body>
${markup}
<script>
${scripts}
</script>
</body>
</html>
`;

const artifact = `<title>Yuvo Prototip</title>
${externalLinks}<style>
${styles}
</style>
${markup}
<script>
${scripts}
</script>
`;

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'index.html'), full);
writeFileSync(join(root, 'dist', 'artifact.html'), artifact);
console.log('OK: dist/index.html (' + full.length + ' B), dist/artifact.html (' + artifact.length + ' B)');
