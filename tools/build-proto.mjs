// Yuvo prototip build: css/js'i tek dosyaya gömer.
// Çıktılar: prototype/dist/index.html (tam sayfa) + prototype/dist/artifact.html (yalnız içerik)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'prototype');
const html = readFileSync(join(root, 'index.html'), 'utf8');

let styles = '', scripts = '';
for (const m of html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)) {
  styles += `/* == ${m[1]} == */\n` + readFileSync(join(root, m[1]), 'utf8') + '\n';
}
for (const m of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  scripts += `/* == ${m[1]} == */\n` + readFileSync(join(root, m[1]), 'utf8') + '\n';
}

const markup = html.match(/<div id="app">[\s\S]*?<\/div>\s*(?=<script)/)[0].trim();

const full = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<title>Yuvo Prototip</title>
<style>
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
<style>
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
