import fs from 'node:fs';
import path from 'node:path';

const dir = '/Users/yangwutu/Documents/antigravity work/intelligence-explosion';
const files = ['shaders.js', 'audio.js', 'slides-data.js', 'i18n.js', 'simulations.js', 'app.js'];

let combined = '/* Auto-generated standalone bundle for file:// and http:// compatibility */\n(() => {\n"use strict";\n';

for (const file of files) {
  let src = fs.readFileSync(path.join(dir, file), 'utf8');
  src = src.replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '');
  src = src.replace(/^\s*export\s+(class|const|function)\s+/gm, '$1 ');
  combined += `\n/* --- ${file} --- */\n` + src + '\n';
}

combined += '\n})();\n';
fs.writeFileSync(path.join(dir, 'bundle.js'), combined, 'utf8');
console.log('Built bundle.js:', Buffer.byteLength(combined), 'bytes');
