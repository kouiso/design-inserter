import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import * as acorn from 'acorn';

const SNIP_DIR = process.env.DI_SNIP_DIR || '/home/ubuntu/repos/design-inserter/.work/qa/snippets';

function stripImports(source) {
  return source
    .replace(/import\s*\{[^}]*\}\s*from\s*"[^"]+"\s*;?/g, '')
    .replace(/import\s*"[^"]+"\s*;?/g, '');
}

function transformExport(source) {
  return source.replace(
    /export\{([^}]*)\}\s*;?/,
    (_, bindings) => {
      const parts = bindings.split(',').map((b) => b.trim()).filter(Boolean);
      const assigns = [];
      for (const p of parts) {
        const m = p.match(/^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/);
        if (m) {
          assigns.push(`__exports.${m[2]} = ${m[1]};`);
        } else {
          assigns.push(`__exports.${p} = ${p};`);
        }
      }
      return assigns.join(' ');
    }
  );
}

function parseImportAliases(source) {
  const aliases = [];
  const re = /import\s*\{([^}]*)\}\s*from\s*"([^"]+)"\s*;?/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const bindings = m[1];
    const modPath = m[2];
    const base = path.basename(modPath);
    const pairs = bindings.split(',').map((b) => b.trim()).filter(Boolean);
    for (const p of pairs) {
      const mm = p.match(/^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/);
      if (mm) {
        aliases.push({ local: mm[2], exported: mm[1], base });
      } else {
        aliases.push({ local: p, exported: p, base });
      }
    }
  }
  return aliases;
}

function parseAst(source) {
  return acorn.parse(source, { ecmaVersion: 2022, sourceType: 'module' });
}

function extractTopLevelObject(source) {
  const ast = parseAst(source);
  for (const node of ast.body) {
    if (node.type === 'VariableDeclaration') {
      for (const decl of node.declarations) {
        if (decl.init && decl.init.type === 'ObjectExpression') {
          return {
            varName: decl.id.name,
            start: decl.init.start,
            end: decl.init.end,
          };
        }
      }
    }
  }
  return null;
}

const moduleCache = {};
const categoryCommonCache = {};
const categoryFunctionCache = {};
const loadingFiles = new Set();

function loadModule(filePath, extraContext = {}) {
  const cacheKey = `${filePath}:${JSON.stringify(Object.keys(extraContext).sort())}`;
  if (moduleCache[cacheKey]) return moduleCache[cacheKey];
  const source = fs.readFileSync(filePath, 'utf8');
  const body = transformExport(stripImports(source));
  const ctx = { __exports: {}, console, ...extraContext };
  vm.createContext(ctx);
  vm.runInContext(body, ctx);
  const exported = ctx.__exports;
  moduleCache[cacheKey] = exported;
  return exported;
}

function loadModuleWithDeps(filePath) {
  const cacheKey = `deps:${filePath}`;
  if (moduleCache[cacheKey]) return moduleCache[cacheKey];
  if (loadingFiles.has(filePath)) {
    return {};
  }
  loadingFiles.add(filePath);
  const source = fs.readFileSync(filePath, 'utf8');
  const aliases = parseImportAliases(source);
  const extraContext = {};
  for (const a of aliases) {
    extraContext[a.local] = resolveBinding(a.base, a.exported, filePath);
  }
  const exported = loadModule(filePath, extraContext);
  loadingFiles.delete(filePath);
  moduleCache[cacheKey] = exported;
  return exported;
}

function loadConsts() {
  if (moduleCache.consts) return moduleCache.consts;
  const srcPath = path.join(SNIP_DIR, 'consts.DJrTin7l.js');
  const factoryMock = { PATH: { IMG: { ICON: '', CATCH: '' } } };
  moduleCache.consts = loadModule(srcPath, { e: factoryMock });
  return moduleCache.consts;
}

function loadFuncs() {
  if (moduleCache.funcs) return moduleCache.funcs;
  const srcPath = path.join(SNIP_DIR, '..', 'funcs.Tiz4_mfS.js');
  function hexToRgb(h) {
    return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  }
  moduleCache.funcs = loadModule(srcPath, { c: hexToRgb });
  return moduleCache.funcs;
}

function resolveBinding(base, exported, importerPath) {
  if (base === 'consts.DJrTin7l.js') {
    return loadConsts()[exported];
  }
  if (base === 'funcs.Tiz4_mfS.js') {
    return loadFuncs()[exported];
  }
  if (base === 'factory.7Y_feFRI.js' || base === 'web.gEkfSsa0.js' || base.startsWith('index.')) {
    return undefined;
  }
  if (base.startsWith('common.')) {
    const mod = getCommonForImporter(importerPath);
    return mod ? mod[exported] : undefined;
  }
  if (base.startsWith('function.')) {
    const mod = getFunctionForImporter(importerPath);
    return mod ? mod[exported] : undefined;
  }
  return undefined;
}

function getCategoryFromPath(filePath) {
  const name = path.basename(filePath, '.ts');
  return name.split('__')[0] || '';
}

function getCommonForImporter(importerPath) {
  const cat = getCategoryFromPath(importerPath);
  if (!cat) return null;
  if (categoryCommonCache[cat]) return categoryCommonCache[cat];
  const logical = path.join(SNIP_DIR, `${cat}__common.ts`);
  if (!fs.existsSync(logical)) return null;
  const exported = loadModuleWithDeps(logical);
  categoryCommonCache[cat] = exported;
  return exported;
}

function getFunctionForImporter(importerPath) {
  const cat = getCategoryFromPath(importerPath);
  if (!cat) return null;
  if (categoryFunctionCache[cat]) return categoryFunctionCache[cat];
  const logical = path.join(SNIP_DIR, `${cat}__function.ts`);
  if (!fs.existsSync(logical)) return null;
  const exported = loadModuleWithDeps(logical);
  categoryFunctionCache[cat] = exported;
  return exported;
}

export function getSnippetModule(category, id) {
  const file = path.join(SNIP_DIR, `${category}__${id}.ts`);
  if (!fs.existsSync(file)) return null;
  const source = fs.readFileSync(file, 'utf8');
  const aliases = parseImportAliases(source);
  const context = { __exports: {}, console };
  for (const a of aliases) {
    context[a.local] = resolveBinding(a.base, a.exported, file);
  }
  const body = transformExport(stripImports(source));
  vm.createContext(context);
  vm.runInContext(body, context);
  const exported = context.__exports;
  return exported.default || exported;
}

export function getSnippetObjectInfo(category, id) {
  const file = path.join(SNIP_DIR, `${category}__${id}.ts`);
  if (!fs.existsSync(file)) return null;
  const source = fs.readFileSync(file, 'utf8');
  const obj = extractTopLevelObject(source);
  if (!obj) return null;
  return {
    varName: obj.varName,
    objectSource: source.slice(obj.start, obj.end),
    aliases: parseImportAliases(source),
    source,
  };
}

export function getConstsObject() {
  const mod = loadConsts();
  return mod.C || mod;
}

export function getFuncsObject() {
  return loadFuncs();
}

export function getCommonObject(category) {
  const file = path.join(SNIP_DIR, `${category}__common.ts`);
  if (!fs.existsSync(file)) return null;
  return loadModuleWithDeps(file);
}

export function getFunctionObject(category) {
  const file = path.join(SNIP_DIR, `${category}__function.ts`);
  if (!fs.existsSync(file)) return null;
  return loadModuleWithDeps(file);
}

export { SNIP_DIR };
