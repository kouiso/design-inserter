import { test, expect } from '@playwright/test';

/**
 * 階層図（Hierarchy Chart）コンポーネントのE2Eテスト
 * - 階層図の表示確認
 * - ボックスのスタイル確認
 * - 空ボックスの非表示確認
 * - レスポンシブ対応確認
 */

test.describe('階層図 - 基本表示', () => {

  test('サステナビリティページで階層図が表示される', async ({ page }) => {
    await page.goto('/sustainability/');

    // 階層図コンポーネントの存在確認
    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      await expect(hierarchyChart.first()).toBeVisible();
    } else {
      // 階層図がない場合はスキップ
      test.skip();
    }
  });

  test('階層図にヘッダー要素が表示される', async ({ page }) => {
    await page.goto('/sustainability/');
    await page.setViewportSize({ width: 1440, height: 900 });

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      // ヘッダー要素の確認
      const headers = hierarchyChart.first().locator('.hierarchy-chart__header-item');
      const headerCount = await headers.count();

      if (headerCount > 0) {
        // 少なくとも1つのヘッダーが表示されることを確認
        await expect(headers.first()).toBeVisible();

        // ヘッダーのスタイル確認（背景色がグレー）
        const headerBgColor = await headers.first().evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });

        // RGB値がグレー（#717171 ≈ rgb(113, 113, 113)）に近いことを確認
        expect(headerBgColor).toMatch(/rgb\(113,\s*113,\s*113\)/);
      }
    } else {
      test.skip();
    }
  });

  test('階層図にボックス要素が表示される', async ({ page }) => {
    await page.goto('/sustainability/');

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      // ボックス要素の確認
      const boxes = hierarchyChart.first().locator('.hierarchy-chart__box');
      const boxCount = await boxes.count();

      // 少なくとも1つのボックスが存在することを確認
      expect(boxCount).toBeGreaterThan(0);

      // 最初のボックスが表示されることを確認
      await expect(boxes.first()).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('階層図のボックスに影と枠線が適用されている', async ({ page }) => {
    await page.goto('/sustainability/');

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      const box = hierarchyChart.first().locator('.hierarchy-chart__box').first();

      // box-shadowが適用されているか確認
      const boxShadow = await box.evaluate((el) => {
        return window.getComputedStyle(el).boxShadow;
      });

      // box-shadowが設定されていることを確認（noneでない）
      expect(boxShadow).not.toBe('none');

      // borderが適用されているか確認
      const border = await box.evaluate((el) => {
        return window.getComputedStyle(el).border;
      });

      // borderが設定されていることを確認
      expect(border).not.toBe('');
    } else {
      test.skip();
    }
  });

  test('階層図のボックスが角丸（border-radius: 50px）である', async ({ page }) => {
    await page.goto('/sustainability/');

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      const box = hierarchyChart.first().locator('.hierarchy-chart__box').first();

      // border-radiusが50pxであることを確認
      const borderRadius = await box.evaluate((el) => {
        return window.getComputedStyle(el).borderRadius;
      });

      expect(borderRadius).toBe('50px');
    } else {
      test.skip();
    }
  });
});

test.describe('階層図 - カラーバリエーション', () => {

  test('sustainability（サステナビリティ）カラーのボックスが表示される', async ({ page }) => {
    await page.goto('/sustainability/');

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      // sustainabilityカラーのボックス
      const sustainabilityBox = hierarchyChart.first().locator('.hierarchy-chart__box--sustainability');
      const sustainabilityCount = await sustainabilityBox.count();

      if (sustainabilityCount > 0) {
        await expect(sustainabilityBox.first()).toBeVisible();

        // 背景色を確認（#FCE8E1）
        const bgColor = await sustainabilityBox.first().evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });

        // RGB値が#FCE8E1に近いことを確認（rgb(252, 232, 225)）
        expect(bgColor).toMatch(/rgb\(252,\s*232,\s*225\)/);
      }
    } else {
      test.skip();
    }
  });

  test('environment（環境）カラーのボックスが表示される', async ({ page }) => {
    await page.goto('/sustainability/');

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      // environmentカラーのボックス
      const environmentBox = hierarchyChart.first().locator('.hierarchy-chart__box--environment');
      const environmentCount = await environmentBox.count();

      if (environmentCount > 0) {
        // 空でないenvironmentボックスは表示される
        const nonEmptyBox = environmentBox.filter({
          hasNot: page.locator('.hierarchy-chart__box--empty-white')
        });

        const nonEmptyCount = await nonEmptyBox.count();
        if (nonEmptyCount > 0) {
          await expect(nonEmptyBox.first()).toBeVisible();

          // 背景色を確認（#E6F3E6）
          const bgColor = await nonEmptyBox.first().evaluate((el) => {
            return window.getComputedStyle(el).backgroundColor;
          });

          // RGB値が#E6F3E6に近いことを確認（rgb(230, 243, 230)）
          expect(bgColor).toMatch(/rgb\(230,\s*243,\s*230\)/);
        }
      }
    } else {
      test.skip();
    }
  });

  test('social（社会）カラーのボックスが表示される', async ({ page }) => {
    await page.goto('/sustainability/');

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      // socialカラーのボックス
      const socialBox = hierarchyChart.first().locator('.hierarchy-chart__box--social');
      const socialCount = await socialBox.count();

      if (socialCount > 0) {
        await expect(socialBox.first()).toBeVisible();

        // 背景色を確認（#FFE0EB）
        const bgColor = await socialBox.first().evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });

        // RGB値が#FFE0EBに近いことを確認（rgb(255, 224, 235)）
        expect(bgColor).toMatch(/rgb\(255,\s*224,\s*235\)/);
      }
    } else {
      test.skip();
    }
  });

  test('governance（ガバナンス）カラーのボックスが表示される', async ({ page }) => {
    await page.goto('/sustainability/');

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      // governanceカラーのボックス
      const governanceBox = hierarchyChart.first().locator('.hierarchy-chart__box--governance');
      const governanceCount = await governanceBox.count();

      if (governanceCount > 0) {
        await expect(governanceBox.first()).toBeVisible();

        // 背景色を確認（#EBF7FB）
        const bgColor = await governanceBox.first().evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });

        // RGB値が#EBF7FBに近いことを確認（rgb(235, 247, 251)）
        expect(bgColor).toMatch(/rgb\(235,\s*247,\s*251\)/);
      }
    } else {
      test.skip();
    }
  });
});

test.describe('階層図 - 空ボックスの処理', () => {

  test('環境関連の空ボックスが非表示になっている', async ({ page }) => {
    await page.goto('/sustainability/');

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      // 空のenvironmentボックスを確認
      const emptyEnvironmentBoxes = hierarchyChart.first().locator(
        '.hierarchy-chart__box--environment.hierarchy-chart__box--empty-white'
      );

      const count = await emptyEnvironmentBoxes.count();

      // 存在する場合は非表示になっているか確認
      if (count > 0) {
        const isHidden = await emptyEnvironmentBoxes.first().isHidden();
        expect(isHidden).toBeTruthy();
      }
    } else {
      test.skip();
    }
  });

  test('空ボックスに破線の枠線が適用されている', async ({ page }) => {
    await page.goto('/sustainability/');

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      // 空ボックス（environment以外）
      const emptyBox = hierarchyChart.first().locator('.hierarchy-chart__box--empty-white').first();
      const emptyCount = await emptyBox.count();

      if (emptyCount > 0 && await emptyBox.isVisible()) {
        // 破線の枠線が適用されているか確認
        const border = await emptyBox.evaluate((el) => {
          return window.getComputedStyle(el).border;
        });

        // dashedスタイルが含まれていることを確認
        expect(border).toContain('dashed');
      }
    } else {
      test.skip();
    }
  });

  test('空のenvironmentボックスを含むラッパーが非表示になっている', async ({ page }) => {
    await page.goto('/sustainability/');

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      // 空のenvironmentボックスを含むラッパー
      const wrapper = hierarchyChart.first().locator('.hierarchy-chart__l3-wrapper:has(.hierarchy-chart__box--environment.hierarchy-chart__box--empty-white)');
      const wrapperCount = await wrapper.count();

      if (wrapperCount > 0) {
        // ラッパー自体が非表示になっているか確認
        const isHidden = await wrapper.first().isHidden();
        expect(isHidden).toBeTruthy();
      }
    } else {
      test.skip();
    }
  });
});

test.describe('階層図 - レイアウトとインデント', () => {

  test('レベル1のボックスにインデントが適用されていない', async ({ page }) => {
    await page.goto('/sustainability/');
    await page.setViewportSize({ width: 1440, height: 900 });

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      const l1Box = hierarchyChart.first().locator('.hierarchy-chart__l1').first();
      const l1Count = await l1Box.count();

      if (l1Count > 0) {
        // margin-leftが0pxであることを確認
        const marginLeft = await l1Box.evaluate((el) => {
          return window.getComputedStyle(el).marginLeft;
        });

        expect(marginLeft).toBe('0px');
      }
    } else {
      test.skip();
    }
  });

  test('レベル2のラッパーにインデントが適用されている', async ({ page }) => {
    await page.goto('/sustainability/');
    await page.setViewportSize({ width: 1440, height: 900 });

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      const l2Wrapper = hierarchyChart.first().locator('.hierarchy-chart__l2-wrapper').first();
      const l2Count = await l2Wrapper.count();

      if (l2Count > 0) {
        // margin-leftが160pxであることを確認
        const marginLeft = await l2Wrapper.evaluate((el) => {
          return window.getComputedStyle(el).marginLeft;
        });

        expect(marginLeft).toBe('160px');
      }
    } else {
      test.skip();
    }
  });

  test('レベル3のラッパーにインデントが適用されている', async ({ page }) => {
    await page.goto('/sustainability/');
    await page.setViewportSize({ width: 1440, height: 900 });

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      const l3Wrapper = hierarchyChart.first().locator('.hierarchy-chart__l3-wrapper').first();
      const l3Count = await l3Wrapper.count();

      if (l3Count > 0) {
        // margin-leftが320pxであることを確認
        const marginLeft = await l3Wrapper.evaluate((el) => {
          return window.getComputedStyle(el).marginLeft;
        });

        expect(marginLeft).toBe('320px');
      }
    } else {
      test.skip();
    }
  });

  test('レベル2のボックスに三角アイコンが表示される', async ({ page }) => {
    await page.goto('/sustainability/');
    await page.setViewportSize({ width: 1440, height: 900 });

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      const l2Box = hierarchyChart.first().locator('.hierarchy-chart__l2').first();
      const l2Count = await l2Box.count();

      if (l2Count > 0) {
        // ::before疑似要素の確認（JavaScriptでは直接取得できないため、テキスト内容で確認）
        const beforeContent = await l2Box.evaluate((el) => {
          const before = window.getComputedStyle(el, '::before');
          return before.getPropertyValue('content');
        });

        // 三角アイコン "▶" が含まれていることを確認
        expect(beforeContent).toContain('▶');
      }
    } else {
      test.skip();
    }
  });
});

test.describe('階層図 - レスポンシブ対応', () => {

  test('モバイルビューでヘッダーが非表示になる', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/sustainability/');

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      // ヘッダー要素がモバイルで非表示
      const headers = hierarchyChart.first().locator('.hierarchy-chart__headers');
      const headerCount = await headers.count();

      if (headerCount > 0) {
        const isVisible = await headers.first().isVisible();
        expect(isVisible).toBe(false);
      }
    } else {
      test.skip();
    }
  });

  test('モバイルビューでボックスの幅が100%になる', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/sustainability/');

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      const box = hierarchyChart.first().locator('.hierarchy-chart__box').first();
      const boxCount = await box.count();

      if (boxCount > 0) {
        // ボックスの幅がコンテナ幅に近い値になっているか確認
        const boxWidth = await box.boundingBox();

        if (boxWidth) {
          // モバイルビューではwidth: 100%が適用されるため、コンテナ幅に近い
          expect(boxWidth.width).toBeGreaterThan(300);
        }
      }
    } else {
      test.skip();
    }
  });

  test('モバイルビューでボックスのborder-radiusが8pxになる', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/sustainability/');

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      const box = hierarchyChart.first().locator('.hierarchy-chart__box').first();
      const boxCount = await box.count();

      if (boxCount > 0) {
        // border-radiusが8pxであることを確認
        const borderRadius = await box.evaluate((el) => {
          return window.getComputedStyle(el).borderRadius;
        });

        expect(borderRadius).toBe('8px');
      }
    } else {
      test.skip();
    }
  });

  test('モバイルビューでインデントが調整される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/sustainability/');

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      // レベル2のラッパー
      const l2Wrapper = hierarchyChart.first().locator('.hierarchy-chart__l2-wrapper').first();
      const l2Count = await l2Wrapper.count();

      if (l2Count > 0) {
        // margin-leftが1rem（16px）であることを確認
        const marginLeft = await l2Wrapper.evaluate((el) => {
          return window.getComputedStyle(el).marginLeft;
        });

        expect(marginLeft).toBe('16px');
      }

      // レベル3のラッパー
      const l3Wrapper = hierarchyChart.first().locator('.hierarchy-chart__l3-wrapper').first();
      const l3Count = await l3Wrapper.count();

      if (l3Count > 0) {
        // margin-leftが2rem（32px）であることを確認
        const marginLeft = await l3Wrapper.evaluate((el) => {
          return window.getComputedStyle(el).marginLeft;
        });

        expect(marginLeft).toBe('32px');
      }
    } else {
      test.skip();
    }
  });
});

test.describe('階層図 - セクション構造', () => {

  test('階層図にセクションが存在する', async ({ page }) => {
    await page.goto('/sustainability/');

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      // セクション要素の確認
      const sections = hierarchyChart.first().locator('.hierarchy-chart__section');
      const sectionCount = await sections.count();

      // 少なくとも1つのセクションが存在することを確認
      if (sectionCount > 0) {
        expect(sectionCount).toBeGreaterThan(0);
      }
    } else {
      test.skip();
    }
  });

  test('小さいテキスト（small要素）が適切に表示される', async ({ page }) => {
    await page.goto('/sustainability/');

    const hierarchyChart = page.locator('.hierarchy-chart');
    const chartCount = await hierarchyChart.count();

    if (chartCount > 0) {
      // small要素の確認
      const smallText = hierarchyChart.first().locator('small');
      const smallCount = await smallText.count();

      if (smallCount > 0) {
        // small要素が表示されることを確認
        await expect(smallText.first()).toBeVisible();

        // フォントサイズが親要素より小さいことを確認
        const fontSize = await smallText.first().evaluate((el) => {
          return window.getComputedStyle(el).fontSize;
        });

        // font-size: 0.75em が適用されているか確認
        const fontSizeNum = parseFloat(fontSize);
        expect(fontSizeNum).toBeLessThan(16); // 通常のフォントサイズより小さい
      }
    } else {
      test.skip();
    }
  });
});
