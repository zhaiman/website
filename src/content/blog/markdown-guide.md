---
title: Markdown 写作速查
description: 写文章时常用的语法示例
pubDate: 2026-08-27
tags: [写作]
---

这篇文章演示了写作用到的常见 Markdown 语法，可以直接对照着用。

## 文字格式

**加粗**、*斜体*、`行内代码`、[链接](https://example.com)。

## 列表

无序列表：

- 想法一
- 想法二
- 想法三

有序列表：

1. 第一步
2. 第二步
3. 第三步

## 引用

> 引用一段话，或者自己某个瞬间的想法。

## 代码块

```js
console.log('Hello, world!');
```

## 图片

把图片放进 `src/assets/` 目录，然后在文章里引用：

```md
![图片描述](../../assets/图片文件名.jpg)
```

## 分隔线

---

## 多媒体：图片、音乐、视频

Markdown 不只可以放文字，图片、音频、视频都能嵌入。

### 图片

图片放进 `src/assets/` 目录，用相对路径引用，Astro 会自动压缩并转成 WebP 格式：

```md
![图片描述](../../assets/文件名.jpg)
```

实际效果：

![Astro 博客模板自带的示例配图](../../assets/blog-placeholder-2.jpg)

### 音频

音频文件放进 `public/audio/`，文章里写 HTML 的 `<audio>` 标签：

```html
<audio controls src="/audio/文件名.mp3"></audio>
```

实际效果（一段三音符提示音，1.5 秒）：

<audio controls src="/audio/demo.wav" style="width: 100%;"></audio>

想嵌入网易云音乐的歌曲，在网页版歌曲页点「生成外链播放器」，把 iframe 代码贴进来即可。

### 视频

小视频（25MB 以内）放 `public/video/`，用 `<video>` 标签：

```html
<video controls width="100%" src="/video/文件名.mp4"></video>
```

大视频推荐嵌入 B 站：视频页点「分享 → 嵌入代码」，把 iframe 贴进文章。实际效果：

<div style="position: relative; width: 100%; padding-top: 56.25%;">
	<iframe src="//player.bilibili.com/player.html?bvid=BV1GJ411x7h7&autoplay=0"
		scrolling="no" frameborder="no"
		style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
		allowfullscreen="true"></iframe>
</div>

（上面这个 iframe 用了一个按视频宽高比自适应的容器写法，可以原样复制，把 `bvid` 换成自己的视频 ID。）

---

就这些，够用了。
