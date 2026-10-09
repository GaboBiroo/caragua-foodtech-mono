const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', '.next');
const dest = path.join(__dirname, '..', 'web-admin', '.next');

try {
  if (fs.existsSync(src)) {
    console.log(`[postbuild] Espelhando diretório de build: ${src} -> ${dest}`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log('[postbuild] Sucesso! .next sincronizado em web-admin/.next para compatibilidade Vercel.');
  } else {
    console.warn(`[postbuild] Aviso: Diretório fonte ${src} não encontrado.`);
  }
} catch (err) {
  console.error('[postbuild] Erro ao sincronizar diretório .next:', err);
  process.exit(1);
}
