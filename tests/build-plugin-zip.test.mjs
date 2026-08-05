import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  GIT_CRYPT_MAGIC,
  assertCatalogsUsable,
  assertNoCiphertext,
  collectPreviewReferences,
  detectPreviewKind,
  inspectCatalogFile,
  isGitCryptCiphertext,
  resolveOutputPath,
  selectDistributionFiles,
} from '../scripts/build-plugin-zip.mjs';

function withTempDir(run) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'designinserter-build-guard-'));
  try {
    return run(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function writeFile(dir, relative, contents) {
  const abs = path.join(dir, relative);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, contents);
  return abs;
}

function locked(payload = Buffer.from([0x01, 0x2f, 0xa1, 0x4b])) {
  return Buffer.concat([GIT_CRYPT_MAGIC, Buffer.from(payload)]);
}

test('git-crypt ciphertext is detected by the leading magic bytes', () => {
  withTempDir((dir) => {
    assert.equal(isGitCryptCiphertext(writeFile(dir, 'locked.json', locked())), true);
    assert.equal(isGitCryptCiphertext(writeFile(dir, 'plain.json', '{"parts":[]}')), false);
    assert.equal(isGitCryptCiphertext(path.join(dir, 'missing.json')), false);
  });
});

test('a short or empty file is not ciphertext and does not throw', () => {
  withTempDir((dir) => {
    assert.equal(isGitCryptCiphertext(writeFile(dir, 'short.json', 'abc')), false);
    assert.equal(isGitCryptCiphertext(writeFile(dir, 'empty.json', '')), false);
  });
});

test('the magic must be at offset 0, not merely present in the file', () => {
  withTempDir((dir) => {
    const shifted = Buffer.concat([Buffer.from('x'), locked()]);
    assert.equal(isGitCryptCiphertext(writeFile(dir, 'shifted.json', shifted)), false);
    assert.equal(inspectCatalogFile(path.join(dir, 'shifted.json'), 'parts').status, 'malformed');
  });
});

test('ciphertext is locked even when the payload would parse as valid JSON', () => {
  withTempDir((dir) => {
    const file = writeFile(dir, 'locked.json', Buffer.concat([GIT_CRYPT_MAGIC, Buffer.from('{"parts":[]}')]));
    assert.equal(inspectCatalogFile(file, 'parts').status, 'locked');
  });
});

test('a decrypted catalog reports ok with its entry count', () => {
  withTempDir((dir) => {
    const filled = inspectCatalogFile(writeFile(dir, 'a.json', '{"parts":[{"id":"heading-1"}]}'), 'parts');
    assert.equal(filled.status, 'ok');
    assert.equal(filled.count, 1);

    // 件数 0 は locked ではない。復号は出来とるので退行として上位で拾う。
    const empty = inspectCatalogFile(writeFile(dir, 'b.json', '{"parts":[]}'), 'parts');
    assert.equal(empty.status, 'ok');
    assert.equal(empty.count, 0);
  });
});

test('broken JSON and wrong shapes are malformed, never locked', () => {
  withTempDir((dir) => {
    const cases = [
      ['truncated.json', '{"parts":', /JSON パース失敗/],
      ['object-value.json', '{"parts":{}}', /"parts"/],
      ['top-level-array.json', '[]', /"parts"/],
      ['null.json', 'null', /"parts"/],
      ['empty.json', '', /JSON パース失敗/],
    ];

    for (const [name, contents, reason] of cases) {
      const result = inspectCatalogFile(writeFile(dir, name, contents), 'parts');
      assert.equal(result.status, 'malformed', `${name} should be malformed`);
      assert.match(result.reason, reason);
    }
  });
});

test('the required key is honoured', () => {
  withTempDir((dir) => {
    const file = writeFile(dir, 'templates.json', '{"templates":[]}');
    assert.equal(inspectCatalogFile(file, 'templates').status, 'ok');
    assert.equal(inspectCatalogFile(file, 'parts').status, 'malformed');
  });
});

test('a missing file reports missing without throwing', () => {
  withTempDir((dir) => {
    assert.equal(inspectCatalogFile(path.join(dir, 'nope.json'), 'parts').status, 'missing');
  });
});

test('release mode rejects locked, missing and empty catalogs', () => {
  assert.throws(
    () => assertCatalogsUsable([{ status: 'locked', path: '/tmp/parts.json', key: 'parts' }]),
    /git-crypt/,
  );
  assert.throws(
    () => assertCatalogsUsable([{ status: 'missing', path: '/tmp/parts.json', key: 'parts', reason: 'ファイルが無い' }]),
    /git-crypt/,
  );
  assert.throws(
    () => assertCatalogsUsable([{ status: 'ok', path: '/tmp/parts.json', key: 'parts', count: 0 }]),
    /空です/,
  );
  assert.doesNotThrow(
    () => assertCatalogsUsable([{ status: 'ok', path: '/tmp/parts.json', key: 'parts', count: 138 }]),
  );
  assert.doesNotThrow(
    () => assertCatalogsUsable([{ status: 'ok', path: '/tmp/parts.json', key: 'parts', count: 138 }]),
  );
});

test('dev mode tolerates locked catalogs only', () => {
  const options = { allowLocked: true };
  assert.doesNotThrow(
    () => assertCatalogsUsable([{ status: 'locked', path: '/tmp/parts.json', key: 'parts' }], options),
  );
  // データ退行を「鍵が無いだけ」と誤魔化さんための線引き。
  assert.throws(
    () => assertCatalogsUsable(
      [{ status: 'malformed', path: '/tmp/parts.json', key: 'parts', reason: 'JSON パース失敗: x' }],
      options,
    ),
    /データ退行/,
  );
  // カタログは git 管理下。消えとるんはロックやのうてリポジトリの退行なので dev でも落とす。
  assert.throws(
    () => assertCatalogsUsable(
      [{ status: 'missing', path: '/tmp/parts.json', key: 'parts', reason: 'ファイルが無い' }],
      options,
    ),
    /リポジトリの退行/,
  );
  // 復号済みで 0 件も scraper の退行。dev の早期 return より前で捕まえる。
  assert.throws(
    () => assertCatalogsUsable(
      [{ status: 'ok', path: '/tmp/parts.json', key: 'parts', count: 0 }],
      options,
    ),
    /空です/,
  );
  // locked には count が無いので、空カタログ判定に巻き込まれない。
  assert.doesNotThrow(
    () => assertCatalogsUsable([{ status: 'locked', path: '/tmp/parts.json', key: 'parts' }], options),
  );
});

test('preview references are collected from both parts and templates', () => {
  assert.deepEqual(
    collectPreviewReferences({
      parts: [
        { previewImage: 'assets/previews/tp-1.webp' },
        { previewImage: 'assets/previews/tp-2.webp' },
      ],
    }),
    ['assets/previews/tp-1.webp', 'assets/previews/tp-2.webp'],
  );
  assert.deepEqual(
    collectPreviewReferences({ templates: [{ thumb: 'assets/previews/tp-wa1.webp' }] }),
    ['assets/previews/tp-wa1.webp'],
  );
  // 同じプレビューを複数エントリが指しても 1 回だけ検証する。
  assert.deepEqual(
    collectPreviewReferences({
      parts: [{ previewImage: 'assets/previews/tp-1.webp' }],
      templates: [{ thumb: 'assets/previews/tp-1.webp' }],
    }),
    ['assets/previews/tp-1.webp'],
  );
});

test('preview reference collection ignores anything that is not a plugin-relative asset', () => {
  // 誤検知でリリースを止めんため、配布物と対応せん値は最初から見ない。
  assert.deepEqual(
    collectPreviewReferences({
      parts: [
        { previewImage: 'https://template-party.com/thumb.png' },
        { previewImage: '' },
        { previewImage: null },
        { previewImage: 42 },
        {},
        null,
        { previewImage: 'data/template-party-bundles/wa1/screenshot.png' },
      ],
    }),
    [],
  );
  assert.deepEqual(collectPreviewReferences({}), []);
  assert.deepEqual(collectPreviewReferences({ parts: 'nope', templates: 7 }), []);
  assert.deepEqual(collectPreviewReferences(null), []);
  assert.deepEqual(collectPreviewReferences([]), []);
});

test('preview kind detection matches real file signatures, not extensions', () => {
  // 拡張子ではなく中身で判定する。破損・改竄プレビューを検出する verifyZip の署名検査が依拠する契約。
  assert.equal(detectPreviewKind(Buffer.concat([Buffer.from('RIFF\0\0\0\0WEBP'), Buffer.alloc(4)])), 'webp');
  assert.equal(detectPreviewKind(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')), 'svg');
  assert.equal(detectPreviewKind(Buffer.from('<?xml version="1.0"?><svg></svg>')), 'svg');
  assert.equal(detectPreviewKind(Buffer.from('<?xml version="1.0"?><svg width="10" height="10"/>')), 'svg');
  assert.equal(detectPreviewKind(Buffer.from('GIF89a')), 'gif');
  assert.equal(detectPreviewKind(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'png');
  // 空ファイルや HTML エラーページへの差し替えは、どの署名にも一致せず unknown になる。
  assert.equal(detectPreviewKind(Buffer.alloc(0)), 'unknown');
  assert.equal(detectPreviewKind(Buffer.from('<html><body>404</body></html>')), 'unknown');
  // XML 宣言だけでは svg と判定しない（S3 の AccessDenied 等の XML エラー応答が誤検知で通り抜けるのを防ぐ）。
  assert.equal(detectPreviewKind(Buffer.from('<?xml version="1.0"?><Error>AccessDenied</Error>')), 'unknown');
  // 直接 <svg で始まる分岐も要素名の境界を見る（<svg-error> のような非 SVG タグの誤検知を防ぐ）。
  assert.equal(detectPreviewKind(Buffer.from('<svg-error>AccessDenied</svg-error>')), 'unknown');
  // XML 宣言直後の実要素だけを見る。<svg> がどこかの子要素にあるだけでは svg と判定しない。
  assert.equal(detectPreviewKind(Buffer.from('<?xml version="1.0"?><Error><svg></svg></Error>')), 'unknown');
});

test('the ciphertext sweep fails the release build and is skipped in dev mode', () => {
  assert.throws(() => assertNoCiphertext(['/tmp/a.webp', '/tmp/b.webp']), /DI-SEC-014/);
  assert.doesNotThrow(() => assertNoCiphertext(['/tmp/a.webp'], { allowLocked: true }));
  assert.doesNotThrow(() => assertNoCiphertext([]));
});

test('distribution files split into included, locked and local-only', () => {
  withTempDir((dir) => {
    writeFile(dir, 'designinserter.php', '<?php');
    writeFile(dir, 'data/css-stock-parts.json', '{"parts":[]}');
    writeFile(dir, 'data/template-party-parts.json', locked());
    writeFile(dir, 'assets/previews/tp-1.webp', locked());
    writeFile(dir, 'assets/previews/heading-1.webp', 'RIFF');
    writeFile(dir, 'data/template-party-bundles/wa1/index.html', '<html>');
    writeFile(dir, 'data/template-party-scrape-state.json', '{}');
    writeFile(dir, '.DS_Store', 'junk');

    const { included, lockedFiles, localOnlyFiles } = selectDistributionFiles(dir);
    const relative = (files) => files.map((file) => path.relative(dir, file).split(path.sep).join('/'));

    assert.deepEqual(relative(included), [
      'assets/previews/heading-1.webp',
      'data/css-stock-parts.json',
      'designinserter.php',
    ]);
    assert.deepEqual(relative(lockedFiles), [
      'assets/previews/tp-1.webp',
      'data/template-party-parts.json',
    ]);
    assert.deepEqual(relative(localOnlyFiles), [
      'data/template-party-bundles/wa1/index.html',
      'data/template-party-scrape-state.json',
    ]);
  });
});

test('dev builds are quarantined outside the release filename', () => {
  const release = resolveOutputPath('0.2.0');
  const dev = resolveOutputPath('0.2.0', { allowLocked: true });

  assert.equal(path.basename(release), 'designinserter-0.2.0.zip');
  assert.equal(path.basename(path.dirname(release)), 'dist');
  // ready:checklist と wp-smoke は dist/*.zip を拾うので、劣化 zip を同じ棚に置かん。
  assert.equal(path.basename(dev), 'designinserter-0.2.0-dev.zip');
  assert.equal(path.basename(path.dirname(dev)), 'dev');
});
