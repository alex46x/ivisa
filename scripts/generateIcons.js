import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure icons folder
const iconsDir = path.resolve(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1x1 base64 transparent PNG header expanded to valid PNG bytes
// Simple blue badge icon for extension
const svgIcon = `
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="24" fill="#0f172a"/>
  <circle cx="64" cy="64" r="44" fill="#1e293b" stroke="#3b82f6" stroke-width="6"/>
  <path d="M44 48 L64 84 L84 48" fill="none" stroke="#38bdf8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

fs.writeFileSync(path.resolve(iconsDir, 'icon.svg'), svgIcon.trim());

// Minimal valid PNG generator (1x1 blue pixel valid PNG)
const base64Png1px = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAE3wH3z1Q+ygAAAABJRU5ErkJggg==';
const pngBuffer = Buffer.from(base64Png1px, 'base64');

for (const size of [16, 48, 128]) {
  fs.writeFileSync(path.resolve(iconsDir, `icon${size}.png`), pngBuffer);
}

console.log('Icon assets generated successfully.');
