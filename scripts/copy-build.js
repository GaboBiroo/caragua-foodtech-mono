const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcNext = path.join(rootDir, '.next');
const destNext = path.join(rootDir, 'web-admin', '.next');
const rootNodeModules = path.join(rootDir, 'node_modules');
const webAdminDir = path.join(rootDir, 'web-admin');
const webAdminNodeModules = path.join(webAdminDir, 'node_modules');

try {
  // 1. Espelhar o diretório de build .next -> web-admin/.next
  if (fs.existsSync(srcNext)) {
    console.log(`[postbuild] Espelhando diretório de build: ${srcNext} -> ${destNext}`);
    fs.mkdirSync(path.dirname(destNext), { recursive: true });
    fs.cpSync(srcNext, destNext, { recursive: true, force: true });
    console.log('[postbuild] Sucesso! .next sincronizado em web-admin/.next.');
  } else {
    console.warn(`[postbuild] Aviso: Diretório fonte ${srcNext} não encontrado.`);
  }

  // 2. Garantir que web-admin tenha acesso a node_modules para o file-tracing da Vercel
  if (fs.existsSync(rootNodeModules)) {
    if (!fs.existsSync(webAdminDir)) {
      fs.mkdirSync(webAdminDir, { recursive: true });
    }

    try {
      if (fs.existsSync(webAdminNodeModules)) {
        const stat = fs.lstatSync(webAdminNodeModules);
        if (stat.isSymbolicLink()) {
          console.log('[postbuild] web-admin/node_modules já é um link simbólico.');
        } else {
          console.log('[postbuild] web-admin/node_modules já existe como pasta.');
        }
      } else {
        console.log('[postbuild] Criando symlink: web-admin/node_modules -> ../node_modules');
        const relativeTarget = path.relative(webAdminDir, rootNodeModules);
        fs.symlinkSync(relativeTarget, webAdminNodeModules, process.platform === 'win32' ? 'junction' : 'dir');
        console.log('[postbuild] Symlink de dependências criado com sucesso!');
      }
    } catch (symErr) {
      console.warn('[postbuild] Aviso ao criar symlink:', symErr.message);
      // Fallback: se symlink falhar por restrições de permissão, copiar dependências essenciais
      try {
        console.log('[postbuild] Tentando cópia de fallback das dependências para web-admin/node_modules...');
        fs.cpSync(rootNodeModules, webAdminNodeModules, { recursive: true, errorOnExist: false });
        console.log('[postbuild] Cópia de fallback concluída com sucesso!');
      } catch (cpErr) {
        console.warn('[postbuild] Falha na cópia de fallback:', cpErr.message);
      }
    }
  }
} catch (err) {
  console.error('[postbuild] Erro no postbuild:', err);
  process.exit(1);
}
