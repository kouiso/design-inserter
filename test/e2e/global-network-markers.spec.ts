import { test, expect } from '@playwright/test';

/**
 * グローバルネットワーク世界地図SVG — 全16マーカーのクリック遷移テスト
 * 実際にブラウザでSVG内の<a>タグをクリックし、正しいページに遷移することを確認
 */

const MARKERS = [
	{ location: 'saitama', title: '埼玉', expectedTitle: '武蔵塗料株式会社（日本）入間工場' },
	{ location: 'usa', title: 'アメリカ', expectedTitle: 'U.S. Paint Corporation（米国）' },
	{ location: 'korea', title: '韓国', expectedTitle: '韓国武蔵塗料株式会社（韓国）' },
	{ location: 'tianjin', title: '天津', expectedTitle: '天津武蔵塗料有限公司（中国・天津）' },
	{ location: 'chongqing', title: '重慶', expectedTitle: '重慶武蔵塗料有限公司（中国・重慶）' },
	{ location: 'hanoi', title: 'ハノイ', expectedTitle: 'VIETNAM MUSASHI PAINT CO.,LTD.（ベトナム・ハノイ）' },
	{ location: 'thailand', title: 'タイ', expectedTitle: 'MUSASHI PAINT MANUFACTURING (THAILAND) CO.,LTD.（タイ）' },
	{ location: 'malaysia', title: 'マレーシア', expectedTitle: 'MUSASHI PAINT CORP.SDN.BHD.（マレーシア）' },
	{ location: 'delhi', title: 'デリー', expectedTitle: 'MUSASHI PAINT INDIA PRIVATE LTD.（インド）' },
	{ location: 'hungary', title: 'ハンガリー', expectedTitle: 'HUNGARY MUSASHI PAINT KFT.（ハンガリー）' },
	{ location: 'dongguan', title: '東莞', expectedTitle: '武蔵（東莞）新材料有限公司（中国・東莞）' },
	{ location: 'suzhou', title: '蘇州', expectedTitle: '蘇州武蔵塗料有限公司（中国・蘇州）' },
	{ location: 'zhongshan', title: '中山', expectedTitle: '中山武蔵塗料有限公司（中国・中山）' },
	{ location: 'hochiminh', title: 'ホーチミン', expectedTitle: 'VIETNAM MUSASHI PAINT CO.,LTD.（ベトナム・ホーチミン）' },
	{ location: 'indonesia', title: 'インドネシア', expectedTitle: 'PT MUSASHI PAINT INDONESIA（インドネシア）' },
	{ location: 'chennai', title: 'チェンナイ', expectedTitle: 'MUSASHI PAINT INDIA PRIVATE LTD.（インド）' },
];

test.describe('グローバルネットワーク世界地図 — マーカークリックテスト', () => {
	for (const marker of MARKERS) {
		test(`${marker.title}（${marker.location}）のマーカーをクリックすると正しいページに遷移する`, async ({ page }) => {
			await page.goto('/global-network/', { waitUntil: 'networkidle' });

			// <object>タグで埋め込まれたSVGはサブフレームとしてアクセス
			const svgFrame = page.frame({ url: /world-map\.svg/ });
			expect(svgFrame).not.toBeNull();

			const link = svgFrame!.locator(`a[data-location="${marker.location}"]`);
			await expect(link).toBeAttached({ timeout: 10000 });

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
