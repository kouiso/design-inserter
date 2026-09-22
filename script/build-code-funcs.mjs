import fs from 'node:fs';
import path from 'node:path';
import * as acorn from 'acorn';
import {
  getSnippetObjectInfo,
  getSnippetModule,
  getConstsObject,
  getCommonObject,
  getFunctionObject,
  SNIP_DIR,
} from './snippet-loader.mjs';

const REPO_DIR = process.env.DI_REPO_DIR || process.cwd();
const PLUGIN_DIR = path.join(REPO_DIR, 'wp-content', 'plugins', 'designinserter');
const DATA_FILE = path.join(PLUGIN_DIR, 'data', 'css-stock-parts.json');
const OUT_FILE = path.join(PLUGIN_DIR, 'assets', 'part-code-funcs.js');

function stripModuleExports(source) {
  return source.replace(/export\{[^}]*\}\s*;?/g, '');
}

function hexToRgbSource() {
  return 'function c(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}';
}

function buildFuncsBundleSource() {
  const srcPath = path.join(SNIP_DIR, '..', 'funcs.Tiz4_mfS.js');
  const src = fs.readFileSync(srcPath, 'utf8');
  const body = stripModuleExports(src)
    .replace(/import[^;]+;/g, '');
  return `(function(){
  ${hexToRgbSource()}
  ${body}
  return {a:p, r:m, c:c};
})()`;
}

function buildFunctionBundleSource(category) {
  const file = path.join(SNIP_DIR, `${category}__function.ts`);
  if (!fs.existsSync(file)) return null;
  const src = fs.readFileSync(file, 'utf8');
  const ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: 'module' });
  const parts = [];
  const exports = [];
  for (const node of ast.body) {
    if (node.type === 'FunctionDeclaration') {
      parts.push(src.slice(node.start, node.end));
    } else if (node.type === 'ExportNamedDeclaration') {
      for (const s of node.specifiers) {
        exports.push(`${s.exported.name}:${s.local.name}`);
      }
    }
  }
  if (exports.length === 0) return null;
  return `(function(){
  ${parts.join('\n  ')}
  return {${exports.join(', ')}};
})()`;
}

function sanitizeKey(text, type, idx) {
  const base = (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return (base || `${type}_${idx + 1}`);
}

function makeInputKey(input, type, idx) {
  const legend = input.legend || {};
  const raw = legend.en || legend.ja || input.label || '';
  return sanitizeKey(raw, type, idx);
}

function normalizeInputs(modInputs) {
  const groups = { colors: [], radios: [], ranges: [] };
  const usedKeys = new Set();
  for (const type of Object.keys(groups)) {
    const arr = modInputs && modInputs[type] ? modInputs[type] : [];
    for (let i = 0; i < arr.length; i++) {
      const input = arr[i];
      let key = makeInputKey(input, type, i);
      let suffix = '';
      while (usedKeys.has(key + suffix)) {
        suffix = suffix ? String(parseInt(suffix, 10) + 1) : '2';
      }
      key = key + suffix;
      usedKeys.add(key);
      let defaultValue = input.defaultValue;
      if (type === 'radios' && defaultValue === undefined && Array.isArray(input.choices) && input.choices.length > 0) {
        defaultValue = input.choices[0].value;
      }
      const out = { key, legend: input.legend || { ja: input.label || '', en: '' }, defaultValue };
      if (type === 'radios') out.choices = input.choices;
      if (type === 'ranges') {
        out.min = input.min;
        out.max = input.max;
        out.step = input.step;
        out.unit = input.unit;
      }
      groups[type].push(out);
    }
  }
  return groups;
}

function buildHelperDefinitions(used) {
  const lines = [];
  lines.push(`  const _di_consts = ${JSON.stringify(getConstsObject())};`);
  lines.push(`  const _di_funcs = ${buildFuncsBundleSource()};`);
  for (const cat of used.common) {
    const obj = getCommonObject(cat);
    lines.push(`  const _di_common_${cat.replace(/-/g, '_')} = ${JSON.stringify(obj)};`);
  }
  for (const cat of used.function) {
    const src = buildFunctionBundleSource(cat);
    if (src) {
      lines.push(`  const _di_functions_${cat.replace(/-/g, '_')} = ${src};`);
    }
  }
  return lines.join('\n');
}

function helperExpression(alias, category) {
  const base = alias.base;
  const exported = alias.exported;
  if (base === 'consts.DJrTin7l.js') {
    return '_di_consts';
  }
  if (base === 'funcs.Tiz4_mfS.js') {
    return `_di_funcs.${exported}`;
  }
  if (base === 'factory.7Y_feFRI.js' && exported === 't') {
    return '_di_funcs.c';
  }
  if (base.startsWith('common.')) {
    const cat = category.replace(/-/g, '_');
    return `_di_common_${cat}.${exported}`;
  }
  if (base.startsWith('function.')) {
    const cat = category.replace(/-/g, '_');
    return `_di_functions_${cat}.${exported}`;
  }
  return 'undefined';
}

function buildPartCode(category, sourcePartId, id) {
  const info = getSnippetObjectInfo(category, sourcePartId);
  const mod = getSnippetModule(category, sourcePartId);
  if (!info || !mod || !mod.codeFunc) {
    console.error('missing snippet or codeFunc', id, category, sourcePartId);
    return null;
  }
  const aliases = info.aliases.filter((a) => a.base !== 'web.gEkfSsa0.js' && !a.base.startsWith('index.'));
  const params = aliases.map((a) => a.local).join(', ');
  const args = aliases.map((a) => helperExpression(a, category)).join(', ');
  const sourceBody = info.source
    .replace(/import\s*\{[^}]*\}\s*from\s*"[^"]+"\s*;?/g, '')
    .replace(/import\s*"[^"]+"\s*;?/g, '')
    .replace(/export\s*\{[^}]*\}\s*;?/g, '')
    .trim();
  return `  root.designInserterPartCodeFuncs['${id}'] = (function(${params}){
${sourceBody}
    return function(params){ return ${info.varName}.codeFunc(params); };
  })(${args});`;
}

function main() {
  const catalog = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const parts = catalog.parts || [];

  const used = { common: new Set(), function: new Set() };
  const partLines = [];
  const missing = [];

  for (const part of parts) {
    const cat = part.category;
    const sid = String(part.sourcePartId);
    const info = getSnippetObjectInfo(cat, sid);
    if (!info) {
      missing.push(part.id);
      continue;
    }
    const mod = getSnippetModule(cat, sid);
    if (!mod || !mod.codeFunc) {
      missing.push(part.id);
      continue;
    }
    for (const a of info.aliases) {
      if (a.base.startsWith('common.')) used.common.add(cat);
      if (a.base.startsWith('function.')) used.function.add(cat);
    }
    part.inputs = normalizeInputs(mod.inputs);
    partLines.push(buildPartCode(cat, sid, part.id));
  }

  if (missing.length) {
    console.warn('missing snippets for', missing.length, 'parts:', missing.slice(0, 10).join(', '), '...');
  }

  const helperDefs = buildHelperDefinitions(used);

  const bundle = `(function(root){
${helperDefs}
  root.designInserterPartCodeFuncs = root.designInserterPartCodeFuncs || {};
${partLines.filter(Boolean).join('\n')}
})(window);`;

  fs.writeFileSync(OUT_FILE, bundle, 'utf8');
  fs.writeFileSync(DATA_FILE, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`Wrote ${OUT_FILE} (${partLines.filter(Boolean).length} parts)`);
  console.log(`Updated ${DATA_FILE}`);
}

main();
