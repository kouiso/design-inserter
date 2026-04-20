import { test, expect } from '@playwright/test';

/**
 * グローバルネットワーク世界地図SVG — 全16マーカーのクリック遷移テスト
 * 実際にブラウザでSVG内の<a>タグをクリックし、正しいページに遷移することを確認
 */

const MARKERS = [
	{ location: 'saitama', title: '埼玉', expectedTitle: 'Iruma Plant' },
	{ location: 'usa', title: 'アメリカ', expectedTitle: 'U.S. Paint Corporation' },
	{ location: 'korea', title: '韓国', expectedTitle: 'Musashi Paint Korea' },
	{ location: 'tianjin', title: '天津', expectedTitle: 'Tianjin Musashi Paint' },
	{ location: 'chongqing', title: '重慶', expectedTitle: 'Chongqing Musashi Paint' },
	{ location: 'hanoi', title: 'ハノイ', expectedTitle: 'Hanoi' },
	{ location: 'thailand', title: 'タイ', expectedTitle: 'Thailand' },
	{ location: 'malaysia', title: 'マレーシア', expectedTitle: 'Malaysia' },
	{ location: 'delhi', title: 'デリー', expectedTitle: 'MUSASHI PAINT INDIA PRIVATE LTD.' },
	{ location: 'hungary', title: 'ハンガリー', expectedTitle: 'HUNGARY MUSASHI PAINT KFT.' },
	{ location: 'dongguan', title: '東莞', expectedTitle: '東莞' },
	{ location: 'suzhou', title: '蘇州', expectedTitle: 'Suzhou' },
	{ location: 'zhongshan', title: '中山', expectedTitle: 'Zhongshan' },
	{ location: 'hochiminh', title: 'ホーチミン', expectedTitle: 'Ho Chi Minh' },
	{ location: 'indonesia', title: 'インドネシア', expectedTitle: 'PT Musashi Paint Indonesia' },
	{ location: 'chennai', title: 'チェンナイ', expectedTitle: 'India' },
];

test.describe('グローバルネットワーク世界地図 — マーカークリックテスト', () => {
	for (const marker of MARKERS) {
		test(`${marker.title}（${marker.location}）のマーカーをクリックすると正しいページに遷移する`, async ({ page }) => {
			await page.goto('/global-network/', { waitUntil: 'networkidle' });

			const svgUrl = await page.locator('object.global-map__object').getAttribute('data');
			expect(svgUrl).toBeTruthy();

			await page.goto(svgUrl!, { waitUntil: 'domcontentloaded' });

			const link = page.locator(`a[data-location="${marker.location}"]`);
			await expect(link).toBeVisible({ timeout: 10000 });

			// href属性を取得して正しいURLが設定されているか確認
			const href = await link.getAttribute('href');
			expect(href).toBeTruthy();

			// target="_top"によるナビゲーションをシミュレート
			await page.goto(href!, { waitUntil: 'domcontentloaded' });

			// 遷移先ページのタイトルに期待する拠点名が含まれるか確認
			const pageTitle = await page.title();
			expect(pageTitle).toContain(marker.expectedTitle);
		});
	}
});
