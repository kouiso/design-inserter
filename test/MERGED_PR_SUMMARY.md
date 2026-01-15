# 武蔵塗料 プロジェクト - マージ済み PR 詳細サマリー

**生成日**: 2026-01-09  
**対象期間**: 2025-12-23 ～ 2026-01-09（直近15 PR）  
**リポジトリ**: ritmo-inc/musashipaint  
**環境**: WordPress 6.x + カスタムテーマ muashi + 複数カスタムプラグイン

---

## 概要

最近 15 件のマージ済み PR を分析した結果、以下の 3 つの主要な変更カテゴリに分類されました：

### 1. **バグ修正系** (3 PR)
- PR #107: 画像レスポンシブ修正
- PR #103: Career パーマリンク修正
- PR #86: Voice 投稿並び順修正

### 2. **大規模リファクタリング・機能追加系** (2 PR)
- **PR #72**: 承認機能プラグイン + ダウンロードページ実装（新規プラグイン musashi-inquiry-approval）
- **PR #71**: アーカイブページネーション 404 修正 + 大規模 functions.php リファクタリング

### 3. **UI/UX 改善系** (4 PR)
- PR #87: トップページセクション順序変更
- PR #84: 英語サイトリンク追加
- PR #80: スクロール位置調整
- PR #69: 中国語サイトリンク追加

### 4. **コード整理・維持管理系** (6 PR)
- PR #96: GitHub Actions Auto Labeler ワークフロー追加
- PR #74: Gemini Code Assist 設定追加
- PR #90: 未使用テンプレート削除
- PR #83: デバッグスクリプト・プラグイン削除
- PR #67: Interview カスタム投稿型実装

---

## 詳細分析

### **PR #107: 画像レスポンシブ修正** ⭐ CRITICAL FIX
**マージ日**: 2026-01-09  
**提出者**: ritmo-inc  
**変更行数**: 2 insertions, 1 deletion  

**修正内容**:
- Gutenberg `core/image` ブロックの インライン `width:px` スタイルが `max-width` CSS ルールを上書きしていた問題を修正
- `render_block_core/image` フィルターで `width:px` → `width:100%` に正規化

**影響範囲**:
- 全記事（/sustainability/environment/ など）内の画像表示
- レスポンシブレイアウトの正確性

**テスト項目** (✅ 完了):
- [x] 記事内画像が画面幅を超えない
- [x] max-width が正常に機能
- [x] 狭い幅（サイドバー有）での表示確認

---

### **PR #72: 承認機能プラグイン & ダウンロードページ** ⭐ MAJOR FEATURE
**マージ日**: 2026-01-09  
**提出者**: ritmo-inc (9 commits)  
**変更行数**: 3,321 insertions, 55 deletions  

**新規プラグイン: musashi-inquiry-approval**

#### 機能概要
Contact Form 7 フォーム送信時に管理者の承認フロー機能を実装。

#### アーキテクチャ

```
CF7 フォーム送信
    ↓
musashi-inquiry-approval プラグイン
    ├─ ユーザー自動返信メール送信
    ├─ 管理者通知メール（確認ボタン付き）
    │
    └─ 管理者が確認ページで承認/拒否
        ├─ 承認 → ユーザーに資料ダウンロードリンク付きメール
        ├─ 拒否 → ユーザーにお断りメール
        └─ 管理者に処理完了通知メール（二重送信防止）
```

#### コアコンポーネント

1. **musashi-inquiry-approval.php** (745行)
   - プラグインメインファイル
   - 管理画面メニュー（問い合わせ承認）
   - メールテンプレート管理ページ
   - Query パラメータ処理（?musashi_review=1&token=xxx）

2. **class-inquiry-handler.php** (242行)
   - AES-256-CBC 暗号化・復号化（トークン生成・検証）
   - 暗号化キー優先順序：
     ```php
     WP_CACHE_KEY_SALT > AUTH_KEY > SECURE_AUTH_KEY > NONCE_KEY > wp_salt('auth')
     ```
   - HMAC-SHA256 署名による改ざん検知
   - トークン形式：Base64(IV + 暗号データ) + '.' + HMAC署名

3. **class-email-sender.php** (416行)
   - 5 種類のメール送信機能：
     - `send_user_confirmation()`: ユーザー自動返信
     - `send_admin_notification()`: 管理者通知（確認リンク付き）
     - `send_approval_email()`: 承認メール（資料リンク付き）
     - `send_rejection_email()`: 拒否メール
     - `send_admin_action_notification()`: 処理完了通知
   - メールタグ置換：[your-name], [your-email], [review_url], [download_url] など
   - HTML/テキストモード対応

4. **class-cf7-integration.php** (137行)
   - `wpcf7_mail_sent` フック で自動的に問い合わせを捕捉
   - CF7 フィールド → プラグインフィールドマッピング

5. **UI コンポーネント**
   - approval-page.php: 管理者確認ページ（承認/拒否ボタン）
   - action-complete.php: 処理完了ページ
   - approval-page.js: ダイアログ制御
   - approval-page.css: レスポンシブスタイル
   - email-templates-admin.js: メールテンプレート編集画面

#### セキュリティ実装
- ✅ AES-256-CBC 暗号化
- ✅ HMAC-SHA256 署名検証
- ✅ nonce 検証（`wp_verify_nonce`）
- ✅ ディレクトリリスティング防止（index.php）
- ✅ 二重送信防止（admin_action_notification）

#### ダウンロードページ機能
- **header-download.php** (416行): ダウンロードページ用ヘッダーレイアウト
- **page-download.php**: ダウンロードページテンプレート
- **page-document.php** (296行): ドキュメント詳細ページ
- メディア（PDF）と外部 URL の両方に対応
- product-meta.js: メディア/URL 切り替え機能

#### 依存関係
- Contact Form 7（必須）
- WP Mail SMTP（推奨）

#### テスト項目 (✅ 手動確認必須):
- [x] CF7 フォーム送信 → ユーザー返信メール受信
- [x] 管理者メール受信（確認ボタン付き）
- [x] 確認ページ表示（トークン検証）
- [x] 承認時のメール送信
- [x] 拒否時のメール送信
- [x] 管理者への処理完了通知
- [x] トークン改ざん検知

---

### **PR #71: アーカイブページネーション 404 修正 & 大規模リファクタリング** ⭐ MAJOR FIX + REFACTOR
**マージ日**: 2025-12-29  
**提出者**: ritmo-inc  
**変更行数**: 1,239 insertions, 11,505 deletions  

#### 問題背景

**本番環境で発生していたバグ**:
- /product/page/2/, /career/interview/page/2/ などで **404 エラー**
- 固定ページテンプレート方式では WordPress 標準ページネーション機能が動作しない
- URL リライトルール（.htaccess）が設定されていない

#### 解決方法

#### 1️⃣ **functions.php 大規模リファクタリング** (405行修正)

**新規追加関数**:

- **`register_page_pagination_rewrite_rules()`**
  - 固定ページの `/page/N/` パターンを自動認識
  - `get_pages()` で全公開ページを取得し、各ページにリライトルールを動的生成
  - 製品タクソノミーページ（/product/application/ など）にも対応

- **`ts_render_pagination($query, $base_url_override, $current_page_override)`**
  - 2 つの新規パラメータ追加（backward compatible）
  - 固定ページ型の archive でもページネーション URL を正しく生成
  - base_url_override で カスタムベース URL を指定可能

- **`muashi_get_archive_page_settings()`**
  - 投稿タイプ → 固定ページの KV 画像・タイトル・本文を取得
  - マッピング例：interview → career/interview ページ

**カスタム投稿型の統一**:
- 全投稿型に `'with_front' => false` を追加
- パーマリンク形式を `/[slug]/` に統一
- 対象投稿型：product, story, voice, career, interview, globalnetwork

**アーカイブ表示設定の統一** (pre_get_posts フック):
- story: 12件/ページ, date DESC
- voice: 12件/ページ, menu_order ASC
- globalnetwork: 12件/ページ, date DESC
- media_post: 全件表示, date DESC
- product: 12件/ページ, date ASC, ID ASC
- interview: 12件/ページ, date DESC

#### 2️⃣ **テンプレート整理**

**新規ファイル**:
- **inc/post-types.php** (74行): media_post・media_category 定義を functions.php から分離
- **inc/setup.php** (54行): wp_head 削除、theme_support、session_start などを関数分離
- **single-post.php** (63行): ニュース（post）詳細ページテンプレート
- **single-product.php** (80行): 製品詳細ページテンプレート
- **template-parts/navigation-product.php** (93行): 製品ページナビゲーション（page-product.php から分離）

**削除ファイル**:
- gulpfile.js (117行)
- package.json (39行)
- package-lock.json (11,052行)
- → ビルド環境を削除（開発 → 本番環境移行）

**修正ファイル**:
- **page-product.php**: 170行修正（複雑なナビゲーション部分をテンプレートパーツに委譲）
- **page-interview.php**: 5行微調整
- **footer.php**: 20行修正（ハッシュリンク → 直接ページリンク）
- **single-media_post.php**: 27行簡素化

#### 3️⃣ **テスト仕様書・スクリーンショット追加**

- **test-specs/TEST_SPECIFICATION.html** (541行)
  - 全 30 ページ + TOP ページの詳細リスト
  - サイドバータイプ 9 種類の分類
  - テストカテゴリ 5 種類（ページ表示、サイドバー、ページネーション、フォーム、共通）
  - Playwright テストコード実装例

- **test-specs/screenshots/** (11枚)
  - 各主要ページのビジュアル確認用
  - 01_top.png, 02_product.png, ..., 11_privacy-policy.png

#### テスト項目 (✅ 実施状況):
- [x] /product/page/2/ → 200 OK (404 ではない)
- [x] /career/interview/page/2/ → 200 OK
- [x] /story/page/2/ → 200 OK
- [x] /voice/page/2/ → 200 OK
- [x] /news/page/2/ → 200 OK
- [x] /global-network/page/2/ → 200 OK
- [x] タクソノミーページ (/product/application/ など)

#### リスク・注意点
- 大規模なリライトルール追加により URL 生成ロジックが複雑化
- ページネーション URL 生成パターンが増加（全パターンのテスト必須）
- WordPress 標準の `paged` クエリ変数が固定ページでは自動有効化されない（pre_get_posts フックで明示的に set）

---

### **PR #103: Career パーマリンク修正**
**マージ日**: 2025-12-31  
**変更行数**: 2 insertions

**修正内容**:
- career カスタム投稿型に `'with_front' => false` を追加
- URL 形式：/news/career/xxx → /career/xxx に変更

**影響範囲**:
- Career 投稿の URL 生成
- Career archive ページ

---

### **PR #96: GitHub Actions Auto Labeler ワークフロー**
**マージ日**: 2025-12-29  

**新規ファイル**:
- .github/workflows/pr-auto-setting.yml
- 自動ラベル付与・アサイン機能

---

### **PR #89: メディアページテンプレート統一**
**マージ日**: 2025-12-29  

**修正内容**:
- page-media.php で WP_Query 導入
- ページネーション実装（12件/ページ）
- media_post カスタム投稿型の表示統一

---

### **PR #90: テンプレート削除**
**マージ日**: 2025-12-29  

**削除ファイル**:
- page-01.php ～ page-05.php (5ファイル)
- page-sample-01.php
- その他未使用テンプレート

---

### **PR #87: トップページセクション順序変更**
**マージ日**: 2025-12-29  

**修正内容**:
- Pick up（メディア）↔ NEWS（ニュース）の順序を入れ替え
- メディアセクションが上部に表示される

---

### **PR #86: Voice 並び順修正**
**マージ日**: 2025-12-29  

**修正内容**:
- voice 投稿の menu_order を ASC に統一
- ワンショットスクリプト（update_term_order.php など）で過去データ初期化

---

### **PR #84: 英語サイトリンク追加**
**マージ日**: 2025-12-29  

**追加機能**:
- header・index に英語サイト（https://en.musashipaint.com）リンク追加

---

### **PR #83: クリーンアップ**
**マージ日**: 2025-12-29  

**削除内容**:
- デバッグスクリプト（check_*.php）13個
- テンプレート 1個
- プラグイン 2個（All in One WP Migration など）

---

### **PR #80: スクロール位置調整**
**マージ日**: 2025-12-29  

**修正内容**:
- メニュー内部リンクのスクロール位置を scroll-margin-top: 300px で調整

---

### **PR #74: Gemini Code Assist 設定**
**マージ日**: 2025-12-28  

**新規ファイル**:
- .github/gemini/config.yaml
- .github/gemini/styleguide.md
- CODEOWNERS

---

### **PR #69: 中国語サイトリンク追加**
**マージ日**: 2025-12-23  

**追加機能**:
- 中国語サイト（https://www.musashipaintchina.com/）リンク追加

---

### **PR #67: Interview カスタム投稿型**
**マージ日**: 2025-12-23  

**新規ファイル**:
- single-interview.php (63行)
- /career/interview/ archive 対応

**カスタムリライトルール**:
- スラッグが「数字のみ」を除外（ページネーション /page/2/ と競合防止）

---

## コミット履歴統計

### 最近 30 件のコミット（マージコミットを含む）

```
2026-01-09 | 0d7a04c5 | fix: manually restore missing brace to main
2026-01-09 | 67675bbc | fix: restore missing closing brace in functions.php
2026-01-09 | 6321515a | Merge pull request #107
2026-01-09 | cb161c65 | fix: prevent article images from overflowing...
2026-01-09 | bbc23f16 | Merge pull request #72 (承認機能プラグイン + DL ページ)
2026-01-09 | 866694d3 | fix: レビュー指摘修正。資料PDF保存処理のリファクタリング
2026-01-09 | 6a456dc3 | fix: URL保存時のサニタイズ処理修正
2026-01-09 | 87d938aa | fix: download/document/ 処理を別ファイルへ切り出す
2026-01-09 | 5634c7f8 | feat: 製品ページへの遷移リンク設定機能（外部URL対応）
2026-01-09 | 49a39ce1 | fix: メールテンプレートのデフォルトヘッダー削除
2026-01-09 | 160e7cc7 | fix: 製品ページへ戻るボタン追加
... (以降省略)
```

**主要な統計**:
- 総コミット数（直近30件）: 30+
- PR マージコミット数: 15
- 平均変更行数（大規模PR）: 1000～3000 行

---

## 技術影響度分析

### 高影響度（必須テスト対象）

| 項目 | PR | 対象ファイル | リスク |
|------|-----|-------------|--------|
| ページネーション 404 修正 | #71 | functions.php (405行) | リライトルール複雑化 |
| 承認機能プラグイン | #72 | musashi-inquiry-approval/ | 新規プラグインのバグ可能性 |
| 画像レスポンシブ修正 | #107 | functions.php (2行) | CSS 優先度問題 |
| Career パーマリンク修正 | #103 | functions.php (2行) | 古い URL へのアクセス |

### 中影響度

| 項目 | PR | リスク |
|------|-----|--------|
| テンプレートファイル削除 | #90, #83 | 削除後に未使用確認 |
| post_type with_front 統一 | #71, #103 | すべての投稿型で新 URL 形式 |
| Voice menu_order 初期化 | #86 | 過去データの menu_order 破損可能性 |

### 低影響度

| 項目 | PR | リスク |
|------|-----|--------|
| UI/UX 改善 | #87, #84, #80, #69 | CSS/JS のみで HTML 変更なし |
| コード整理 | #74, #96 | 動作に直接影響なし |

---

## テストケース優先度

### 優先度 1️⃣ (即実施)

1. **ページネーション URL アクセス確認** (PR #71)
   - /product/page/2/, /career/interview/page/2/ 等で 404 エラーが出ていないか

2. **承認フロー E2E テスト** (PR #72)
   - CF7 フォーム送信 → メール受信 → 確認ページ → 承認 → メール送信

3. **画像表示確認** (PR #107)
   - 記事内画像が画面幅を超えていないか

### 優先度 2️⃣ (本番前)

4. **パーマリンク形式確認** (PR #103, #71)
   - /career/xxx (正) vs /news/career/xxx (誤) の確認

5. **テンプレート削除による副作用確認** (PR #90, #83)
   - 削除されたテンプレートを参照するページが 404 になっていないか

6. **Voice 並び順確認** (PR #86)
   - /voice/ ページで menu_order に従った並び順か

### 優先度 3️⃣ (本番後)

7. **UI/UX 改善確認** (PR #87, #84, #80, #69)
   - セクション順序、言語リンク、スクロール位置

---

## デプロイ・検証ガイド

### 本番環境へのデプロイ手順

1. **バックアップ**
   - DB バックアップ（wp_posts, wp_postmeta, wp_posts_per_page 等）
   - ファイルバックアップ（wp-content/themes/muashi/functions.php など）

2. **パーマリンク再設定**
   ```
   wp-admin → Settings → Permalinks → Save Changes
   ```
   - register_page_pagination_rewrite_rules() が実行される

3. **キャッシュクリア**
   - WordPress キャッシュプラグイン（WP Super Cache 等）のキャッシュクリア
   - .htaccess の RewriteRule 反映確認

4. **メールテスト** (PR #72)
   - WP Mail SMTP で テストメール送信
   - CF7 フォーム送信テスト

5. **URL テスト**
   - ページネーション URL (404 確認)
   - Career パーマリンク新形式
   - タクソノミーページ (/product/application/ 等)

### ロールバック手順

PR #71 のみロールバック可能性あり：
```bash
git revert 03a1b7ad
git push origin main
```

その他の PR はロールバック複雑（依存関係多）。

---

## 今後の考慮事項

### ✅ 実装済み
- AES-256-CBC 暗号化（PR #72）
- ページネーション リライトルール自動生成（PR #71）
- 画像レスポンシブ正規化（PR #107）

### ⚠️ 検討中
- メール送信の信頼性向上（配信確認、リトライ機能）
- プラグインセキュリティアップデート定期確認
- ページネーション URL の SEO 最適化（rel="next", rel="prev"）

### 🔄 将来計画
- Contact Form 7 → 独自フォームシステムへの移行検討
- WordPress Multisite への対応（言語サイト統合）
- GraphQL API 導入（Headless CMS 対応）

---

## 参考資料

- **テスト仕様書**: test-specs/TEST_SPECIFICATION.html
- **Playwright テストコード**: test-specs/degradation.spec.ts
- **デグレテストケース**: test-specs/DEGRADATION_TEST_CASES.md

