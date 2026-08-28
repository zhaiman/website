import type { CollectionEntry } from 'astro:content';
import GithubSlugger from 'github-slugger';

export type TocItem = {
	depth: number;
	text: string;
	id: string;
};

/**
 * 阅读时长估算：中文按 ~350 字/分钟，英文单词按 ~200 词/分钟
 */
export function readingTime(text: string): number {
	const cjk = (text.match(/[一-鿿㐀-䶿]/g) || []).length;
	const words = (
		text.replace(/[一-鿿㐀-䶿]/g, ' ').match(/[a-zA-Z0-9]+/g) || []
	).length;
	return Math.max(1, Math.round(cjk / 350 + words / 200));
}

/**
 * 从 Markdown 原文提取 h2/h3 生成目录，跳过代码块内部的内容。
 * 锚点 id 用 github-slugger 生成，与 Astro 渲染标题时的算法一致。
 */
export function extractToc(body: string): TocItem[] {
	const slugger = new GithubSlugger();
	const toc: TocItem[] = [];
	let inFence = false;
	for (const line of body.split('\n')) {
		if (/^\s*(```|~~~)/.test(line)) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;
		const m = line.match(/^(#{2,3})\s+(.+?)\s*#*$/);
		if (!m) continue;
		// 去掉行内 markdown 记号，目录里显示纯文本
		const text = m[2]
			.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
			.replace(/[*`_~]/g, '')
			.trim();
		toc.push({ depth: m[1].length, text, id: slugger.slug(m[2].trim()) });
	}
	return toc;
}
