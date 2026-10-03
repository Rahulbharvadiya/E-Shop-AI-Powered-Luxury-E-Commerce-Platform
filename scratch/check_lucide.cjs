const fs = require('fs');
const path = require('path');
const lucide = require('../client/node_modules/lucide-react');

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      checkDir(full);
    } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      const matches = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g);
      if (matches) {
        matches.forEach(m => {
          const inner = m.replace(/import\s*\{/, '').replace(/\}\s*from\s*['"]lucide-react['"]/, '');
          inner.split(',').forEach(icon => {
            const trimmed = icon.trim().split(' as ')[0].trim();
            if (trimmed && !lucide[trimmed]) {
              console.log('MISSING ICON IN', full, ':', trimmed);
            }
          });
        });
      }
    }
  }
}

checkDir(path.join(__dirname, '../client/src'));
console.log('Done checking Lucide icons.');
