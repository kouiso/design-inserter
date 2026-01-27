# Testing Rules (Playwright E2E テスト規約)
<!-- Testing Rules -->

## 1. テスト実行コマンド
<!-- Test Execution Commands -->

```bash
# 全テスト実行
npm run test

# スモークテスト（基本動作確認）
npm run test:smoke

# ページネーションテスト
npm run test:pagination

# リグレッションテスト
npm run test:regression

# コンテンツ整合性テスト
npm run test:content

# 本番環境テスト
npm run test:prod

# UIモード（デバッグ用）
npm run test:ui

# ヘッドフルモード（ブラウザ表示）
npm run test:headed
```

## 2. テストファイル構成
<!-- Test File Structure -->

- `test/e2e/smoke.spec.ts`: 基本動作確認
<!-- Basic operation verification -->
- `test/e2e/pagination.spec.ts`: ページネーション動作
<!-- Pagination operation -->
- `test/e2e/regression.spec.ts`: リグレッション防止
<!-- Regression prevention -->
- `test/e2e/content-integrity.spec.ts`: コンテンツ整合性
<!-- Content integrity -->

## 3. テスト作成ルール
<!-- Test Creation Rules -->

### 3.1. 日本語でテスト名記述
<!-- Write test names in Japanese -->

```typescript
// ✅ Correct
test('トップページが正常に表示される', async ({ page }) => {
  // ...
});

// ❌ Avoid
test('Top page displays correctly', async ({ page }) => {
  // ...
});
```

### 3.2. 既存パターン踏襲
<!-- Follow existing patterns -->

- Match the style of existing test files
<!-- 既存テストファイルのスタイルに合わせる -->

### 3.3. 適切なセレクタ使用
<!-- Use appropriate selectors -->

**Priority order**:
<!-- 優先順位 -->

1. `data-testid` (最優先)
2. `role` (次に優先)
3. CSS セレクタ (最終手段)

```typescript
// ✅ Correct - data-testid
await page.locator('[data-testid="submit-button"]').click();

// ✅ Correct - role
await page.getByRole('button', { name: '送信' }).click();

// ⚠️ Acceptable - CSS selector
await page.locator('.submit-button').click();
```

### 3.4. タイムアウト設定
<!-- Timeout settings -->

- Set appropriate wait times
<!-- 適切な待機時間を設定 -->

```typescript
// 明示的なタイムアウト
await expect(page.locator('.content')).toBeVisible({ timeout: 10000 });
```

## 4. タスク完了時必須事項
<!-- Required on task completion -->

**After completing work, always execute the following:**
<!-- 作業完了後は必ず以下を実行 -->

1. `npm run test` - Execute all E2E tests
<!-- E2Eテスト全件実行 -->
2. Task incomplete until all tests pass
<!-- 全テストパスまでタスク未完了 -->
3. Solve root cause when errors occur
<!-- エラー発生時は根本原因解決 -->

## 5. テスト失敗時の対応
<!-- Handling test failures -->

### 5.1. 根本原因分析
<!-- Root cause analysis -->

1. Check error message
<!-- エラーメッセージ確認 -->
2. Check screenshot (test-results/)
<!-- スクリーンショット確認（test-results/） -->
3. Debug in UI mode
<!-- UIモードでデバッグ -->

```bash
npm run test:ui
```

### 5.2. 修正後の再実行
<!-- Re-execution after fix -->

- Always run full test suite after fixing
<!-- 修正後は必ず全テストを実行 -->

```bash
npm run test
```

## 6. レポート確認
<!-- Report confirmation -->

- HTML report: `playwright-report/index.html`
<!-- HTMLレポート -->
- Open after test execution to check results
<!-- テスト実行後に開いて結果確認 -->

```bash
npx playwright show-report
```

## 7. デバッグ方法
<!-- Debugging methods -->

### 7.1. UIモード
<!-- UI mode -->

```bash
npm run test:ui
```

### 7.2. ヘッドフルモード
<!-- Headful mode -->

```bash
npm run test:headed
```

### 7.3. 特定テストのみ実行
<!-- Run specific tests only -->

```bash
npx playwright test test/e2e/smoke.spec.ts
```

### 7.4. デバッグログ有効化
<!-- Enable debug logs -->

```bash
DEBUG=pw:api npx playwright test
```
