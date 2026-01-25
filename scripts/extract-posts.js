/**
 * SQLダンプから投稿データを抽出するスクリプト
 */
const fs = require('fs');

const sqlFile = process.argv[2] || 'C:/Users/suker/Local Sites/musashipaint/app/sql/local.sql';
const content = fs.readFileSync(sqlFile, 'utf-8');

// wp_postsテーブルの行を抽出
const lines = content.split('\n').filter(line =>
  line.startsWith("INSERT INTO `wp_posts` VALUES") && line.includes("'publish'")
);

const postTypes = {};
const excludeTypes = ['revision', 'attachment', 'nav_menu_item', 'wp_template', 'wp_template_part',
                      'wp_navigation', 'wp_global_styles', 'custom_css', 'customize_changeset',
                      'oembed_cache', 'user_request', 'wp_block', 'wp_font_family', 'wp_font_face'];

for (const line of lines) {
  // VALUES (ID, author, date, date_gmt, content, title, excerpt, status, ...)
  // 最後の方: post_type, '', 0);

  // IDを抽出
  const idMatch = line.match(/VALUES \((\d+),/);
  if (!idMatch) continue;
  const id = idMatch[1];

  // post_typeを抽出（行末付近）
  const postTypeMatch = line.match(/,0,'(\w+)','',0\);$/);
  if (!postTypeMatch) continue;
  const postType = postTypeMatch[1];

  if (excludeTypes.includes(postType)) continue;

  // タイトルを抽出（6番目のフィールド、'publish'の前）
  // パターン: ','タイトル','','publish'
  const titleMatch = line.match(/,'([^']*)',''(?:,'[^']*')*,'publish'/);
  if (!titleMatch) continue;
  const title = titleMatch[1];

  // slugを抽出
  const slugMatch = line.match(/'publish','[^']*','[^']*','([^']*)'/);
  const slug = slugMatch ? slugMatch[1] : '';

  if (!postTypes[postType]) postTypes[postType] = [];
  postTypes[postType].push({ id, title, slug });
}

// JSON出力
const output = {
  extractedAt: new Date().toISOString(),
  sqlFile,
  summary: {},
  posts: postTypes
};

for (const [pt, posts] of Object.entries(postTypes)) {
  output.summary[pt] = posts.length;
}

console.log(JSON.stringify(output, null, 2));
