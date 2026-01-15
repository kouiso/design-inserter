# テスト実行ガイド - musashipaint デグレテスト

**作成日**: 2026-01-09  
**対象PR**: #107, #72, #103, #96, #89, #90, #87, #86, #84, #83, #80, #71, #74, #69, #67  
**テスト環境**: http://localhost:10010 (Local by Flywheel)  

---

## 📋 実行前チェックリスト

### 環境準備

- [ ] Local by Flywheel で WordPress サイト起動（http://localhost:10010）
- [ ] WordPress 管理画面ログイン確認
- [ ] wp-mail-smtp または Mailtrap でメール設定完了
- [ ] wp-content/themes/muashi/functions.php に register_page_pagination_rewrite_rules() が存在することを確認
- [ ] wp-content/plugins/musashi-inquiry-approval/ プラグインが有効化されていることを確認

### ブラウザ・ツール準備

```bash
# Playwright インストール（初回）
npm install -D @playwright/test

# または
pip install playwright
playwright install
```

---

## 🧪 テスト実行パターン

### パターン 1️⃣ 手動テスト（推奨）

簡潔で確実。まずこれを実施してから自動テストに移行。

#### 1. ページネーション 404 テスト (PR #71)

**テスト項目**:

| No. | URL | 期待値 | 確認方法 |
|-----|-----|--------|---------|
| 1 | http://localhost:10010/product/page/2/ | 200 OK, 2ページ目コンテンツ表示 | ブラウザ + DevTools |
| 2 | http://localhost:10010/career/interview/page/2/ | 200 OK | ブラウザ |
| 3 | http://localhost:10010/story/page/2/ | 200 OK | ブラウザ |
| 4 | http://localhost:10010/voice/page/2/ | 200 OK | ブラウザ |
| 5 | http://localhost:10010/news/page/2/ | 200 OK | ブラウザ |
| 6 | http://localhost:10010/global-network/page/2/ | 200 OK | ブラウザ |

**実行方法**:
```
1. 各 URL にアクセス
2. ブラウザの DevTools (F12) で Network タブ確認
3. ステータスコード 404 が出ていないか確認
4. 2ページ目のコンテンツが異なるか確認
```

#### 2. Career パーマリンク テスト (PR #103)

| No. | テスト項目 | 期待値 | 確認方法 |
|-----|----------|--------|---------|
| 1 | http://localhost:10010/career/ の任意リンククリック | URL が /career/[name]/ 形式 | ブラウザのアドレスバー確認 |
| 2 | http://localhost:10010/career/[post-name]/ にアクセス | 200 OK | DevTools Network |
| 3 | http://localhost:10010/news/career/[post-name]/ にアクセス | 404 または 301 リダイレクト | DevTools |

#### 3. 画像表示テスト (PR #107)

| No. | テスト項目 | 期待値 | 確認方法 |
|-----|----------|--------|---------|
| 1 | /sustainability/environment/ を表示 | 記事内画像が画面幅を超えない | ビジュアル確認 |
| 2 | DevTools で img タグのスタイル確認 | width:px が含まれていない | DevTools → Elements タブ |
| 3 | モバイル (375px) で表示 | 画像がレスポンシブに調整される | DevTools → Device Toolbar |

#### 4. 承認フロー テスト (PR #72)

**前提**: wp-mail-smtp + Mailtrap 設定完了

| No. | テスト項目 | 期待値 | 確認方法 |
|-----|----------|--------|---------|
| 1 | /contact/ でフォーム送信 | Mailtrap でユーザー返信メール受信 | Mailtrap 画面確認 |
| 2 | Mailtrap でメール確認（管理者通知） | メール本文に「確認」ボタン付きURL | リンク URL に ?musashi_review=1&token=xxx 含まれる |
| 3 | 確認ページで「承認」ボタンクリック | ユーザーに資料DLリンク付きメール送信 | Mailtrap 確認 |
| 4 | 確認ページで「拒否」ボタンクリック（別トランザクション） | ユーザーに拒否メール送信 | Mailtrap 確認 |

#### 5. UI/UX テスト (PR #87, #80, #84, #69)

| No. | テスト項目 | 期待値 | 確認方法 |
|-----|----------|--------|---------|
| 1 | / （トップページ）を表示 | メディアセクションがニュースセクション上部 | ビジュアル確認、スクロール |
| 2 | 「用途でえらぶ」リンク（footer） | /product/application/ に遷移 | ブラウザのアドレスバー確認 |
| 3 | ページ内リンク（タブ切り替え）をクリック | スクロール位置が正確（ヘッダーに隠れない） | ビジュアル確認 |
| 4 | header の「En」リンク | https://en.musashipaint.com が新タブで開く | ブラウザのタブ確認 |

---

### パターン 2️⃣ Playwright 自動テスト

フル自動化。手動テスト後、本番デプロイ前に実行推奨。

#### セットアップ

```bash
cd c:\Users\suker\Local Sites\musashipaint\app\public\test-specs

# npm の場合
npm install -D @playwright/test

# poetry の場合
pip install playwright
playwright install chromium
```

#### テスト実行コマンド

**1. 全テスト実行**

```bash
npx playwright test degradation.spec.ts
```

**2. 特定のテストグループのみ実行**

```bash
# ページネーション テストのみ
npx playwright test degradation.spec.ts -g "Pagination"

# 承認機能テストのみ
npx playwright test degradation.spec.ts -g "Inquiry"

# バグ修正テストのみ
npx playwright test degradation.spec.ts -g "Bug Fix"
```

**3. UI 表示付きで実行（デバッグ用）**

```bash
npx playwright test degradation.spec.ts --headed
```

**4. デバッグモード（一時停止可能）**

```bash
npx playwright test degradation.spec.ts --debug
```

**5. 特定のブラウザで実行**

```bash
# Chromium のみ
npx playwright test degradation.spec.ts --project=chromium

# Firefox のみ
npx playwright test degradation.spec.ts --project=firefox

# Webkit のみ
npx playwright test degradation.spec.ts --project=webkit
```

**6. 並列実行（複数ブラウザ）**

```bash
# デフォルト（Chromium, Firefox, Webkit 並列）
npx playwright test degradation.spec.ts
```

**7. 特定のテストのみ（テスト名部分一致）**

```bash
npx playwright test degradation.spec.ts -g "Career Permalink"
```

#### テスト結果確認

```bash
# テスト結果 HTML レポート表示
npx playwright show-report
```

---

## 📊 テスト結果の記録

### 手動テスト結果シート

**実施日**: ________________  
**実施者**: ________________  
**環境**: ローカル開発環境 (Local by Flywheel)  

| テストカテゴリ | テスト数 | 合格 | 失敗 | スキップ | 備考 |
|----------------|---------|------|------|---------|------|
| PR #71 ページネーション | 6 | ☐ | ☐ | ☐ | |
| PR #103 Career パーマリンク | 3 | ☐ | ☐ | ☐ | |
| PR #107 画像表示 | 3 | ☐ | ☐ | ☐ | |
| PR #72 承認フロー | 4 | ☐ | ☐ | ☐ | |
| PR #87, #80, #84, #69 UI/UX | 4 | ☐ | ☐ | ☐ | |
| **合計** | **20** | **☐** | **☐** | **☐** | |

### Playwright テスト結果シート

**実施日**: ________________  
**テスト環境**: http://localhost:10010  

```
$ npx playwright test degradation.spec.ts

✓ Bug Fix Tests
  ✓ PR #107: Responsive Image Fix
    ✓ should render article images without overflow on /sustainability/environment/
    ✓ should apply max-width correctly for responsive images
    ✓ should have correct max-width on narrow layouts (with sidebar)
  ✓ PR #103: Career Permalink Fix
    ✓ should access /career/[post-name]/ with 200 OK
    ✓ should NOT have /news/career prefix in URLs
    ✓ should return 404 for old /news/career/[post-name]/ format
  ✓ PR #86: Voice Menu Order Fix
    ✓ should display voice posts in correct menu_order sequence
    ...

✓ 103 passed (15s)
```

---

## 🔍 テスト失敗時のトラブルシューティング

### シナリオ 1: ページネーション 404 エラー

**症状**: `/product/page/2/` が 404 エラー

**原因の可能性**:
1. パーマリンク設定未再保存
2. .htaccess ファイルが正しく更新されていない
3. register_page_pagination_rewrite_rules() が実行されていない

**対処方法**:
```bash
# 1. パーマリンク再設定
wp-admin → Settings → Permalinks → Save Changes

# 2. キャッシュクリア（WP Super Cache など）
wp-admin → WP Super Cache → Delete Cache

# 3. functions.php で register_page_pagination_rewrite_rules() が呼ばれているか確認
grep -n "register_page_pagination_rewrite_rules" wp-content/themes/muashi/functions.php

# 4. リライトルール確認
wp rewrite list --format=table | grep page
```

### シナリオ 2: 承認メール送信失敗

**症状**: CF7 フォーム送信後、メールが Mailtrap に到着しない

**原因の可能性**:
1. WP Mail SMTP 設定不完全
2. musashi-inquiry-approval プラグイン未有効化
3. SMTP 認証情報誤り

**対処方法**:
```bash
# 1. プラグイン有効化確認
wp plugin list | grep musashi-inquiry-approval

# 2. WP Mail SMTP テスト
wp-admin → WP Mail SMTP → Settings → Test Email

# 3. CF7 統合確認（デバッグログ）
tail -f wp-content/debug.log | grep "musashi"

# 4. メールテンプレート確認
wp-admin → 問い合わせ承認 → メールテンプレート
```

### シナリオ 3: Career パーマリンク旧形式で 404

**症状**: `/news/career/xxx/` でアクセス時に 404（301 リダイレクト不在）

**原因の可能性**:
1. with_front => false 設定反映されていない
2. 旧 URL から新 URL への リダイレクト設定なし

**対処方法**:
```bash
# 1. functions.php で with_front => false 確認
grep -A 5 "register_post_type.*career" wp-content/themes/muashi/functions.php

# 2. パーマリンク再設定
wp-admin → Settings → Permalinks → Save Changes

# 3. 旧 URL リダイレクト設定（.htaccess）
# .htaccess に以下を追加（オプション）
# RewriteRule ^news/career/(.+)/$ /career/$1/ [R=301,L]
```

### シナリオ 4: Playwright テスト失敗

**症状**: `npx playwright test degradation.spec.ts` でテスト失敗

**デバッグ方法**:

```bash
# 1. --headed オプションで UI 表示
npx playwright test degradation.spec.ts --headed

# 2. --debug オプションで一時停止
npx playwright test degradation.spec.ts --debug

# 3. スクリーンショット取得（テストコード内に追加）
await page.screenshot({ path: 'debug.png' });

# 4. コンソールログ確認
npx playwright test degradation.spec.ts --reporter=html

# 5. トレース記録（詳細ログ）
npx playwright test degradation.spec.ts --tracing=on
```

---

## 📱 ブラウザ別テストチェックリスト

**Desktop (1280px)**
- [ ] ページネーション 表示確認
- [ ] footer リンク機能確認
- [ ] header 言語リンク表示確認
- [ ] タブレット画面表示確認

**Tablet (768px)**
- [ ] レスポンシブレイアウト確認
- [ ] モバイルメニュー表示確認
- [ ] 画像表示（max-width）確認
- [ ] タッチ操作（ボタンサイズ）確認

**Mobile (375px)**
- [ ] footer リンク表示確認
- [ ] メディアクエリ反映確認
- [ ] 画像サイズ調整確認
- [ ] ビューポート スケーリング確認

---

## 🚀 本番デプロイ前チェック

### デプロイ 24 時間前

- [ ] **全テスト実行完了**: 手動テスト + Playwright
- [ ] **DB バックアップ**: wp_posts, wp_postmeta, wp_options
- [ ] **ファイルバックアップ**: wp-content/themes/muashi/, wp-content/plugins/

### デプロイ当日

1. **メンテナンスモード有効化**
   ```bash
   echo "Maintenance" > wp-content/maintenance-mode.txt
   ```

2. **ファイル更新**
   ```bash
   git pull origin main
   # または
   scp -r functions.php [server]:/var/www/html/wp-content/themes/muashi/
   ```

3. **パーマリンク再設定**
   ```bash
   wp rewrite flush
   # または
   wp-admin → Settings → Permalinks → Save Changes
   ```

4. **キャッシュクリア**
   ```bash
   wp cache flush
   wp super-cache flush
   ```

5. **本番テスト**（3 項目最小限）
   - [ ] ページネーション URL（/product/page/2/）で 200 OK
   - [ ] Career リンク (/career/xxx/) で 200 OK
   - [ ] CF7 フォーム送信 → メール到達確認

6. **メンテナンスモード解除**
   ```bash
   rm wp-content/maintenance-mode.txt
   ```

---

## 📞 サポート・報告

### テスト失敗時の報告

失敗したテストについては、以下の情報を記入して報告してください：

```markdown
**テスト名**: [例: ページネーション 404 テスト]
**失敗内容**: [例: /product/page/2/ が 404 エラー]
**期待値**: 200 OK で 2ページ目コンテンツ表示
**実際値**: 404 Not Found
**ブラウザ**: [例: Chrome 120.0]
**環境**: Local by Flywheel (http://localhost:10010)
**再現手順**:
  1. http://localhost:10010/product/page/2/ にアクセス
  2. DevTools (F12) → Network タブで確認
**スクリーンショット**: [添付]
**その他情報**: 
```

---

## 📚 参考資料

- **テスト仕様書**: TEST_SPECIFICATION.html
- **Playwright 公式ドキュメント**: https://playwright.dev/
- **WordPress パーマリンク設定**: https://wordpress.org/support/article/permalinks/
- **WP Mail SMTP**: https://www.wpmailsmtp.com/

---

**最終更新**: 2026-01-09

