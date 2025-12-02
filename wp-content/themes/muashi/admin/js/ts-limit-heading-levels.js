/**
 * 見出しブロックの選択肢から「見出し1」を除外する
 */
function removeH1FromHeadingBlock(settings, name) {
  // 変更対象を見出しブロック（core/heading）に限定
  if (name !== 'core/heading') {
    return settings;
  }

  // settings.attributes.levelに、許可する見出しレベルの配列（enum）があるか確認
  if (settings.attributes && settings.attributes.level && settings.attributes.level.enum) {
    // 許可する見出しレベルの配列から「1」を除外した新しい配列を作成
    const newAllowedLevels = settings.attributes.level.enum.filter(level => level !== 1);

    // 新しい配列を元の設定に上書き
    settings.attributes.level.enum = newAllowedLevels;
  }

  return settings;
}

// WordPressのブロック登録時に上記の関数をフィルターとして適用
wp.hooks.addFilter(
  'blocks.registerBlockType',
  'my-custom-plugin/remove-h1-from-heading',
  removeH1FromHeadingBlock
);