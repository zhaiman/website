// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// 站点域名（影响 RSS / sitemap / canonical 链接）
	site: 'https://www.carryqi.cn',
	integrations: [mdx(), sitemap()],
	markdown: {
		shikiConfig: {
			// 双主题：亮色用 github-light，暗色用 github-dark（CSS 变量切换）
			themes: { light: 'github-light', dark: 'github-dark' },
			wrap: false,
		},
	},
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: [
				'-apple-system',
				'BlinkMacSystemFont',
				'Segoe UI',
				'PingFang SC',
				'Hiragino Sans GB',
				'Microsoft YaHei',
				'Noto Sans SC',
				'sans-serif',
			],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
