import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	timeout: 240000,
	expect: {
		timeout: 30000,
	},
	use: {
		...devices['Desktop Chrome'],
		channel: 'chrome',
		headless: true,
	},
});
