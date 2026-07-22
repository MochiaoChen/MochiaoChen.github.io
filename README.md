# Mochiao Chen — Personal Website

A bilingual editorial portfolio, journal, and tools index built with Jekyll and GitHub Pages.

## Site map

| Chinese | English |
| --- | --- |
| `/` | `/en/` |
| `/about/` | `/en/about/` |
| `/blog/` | `/en/blog/` |
| `/tools/` | `/en/tools/` |

Every page defines `translation_url` in its front matter, so the `中 / EN` switch opens the corresponding page instead of merely returning to a language homepage.

## Writing a post

Create a Markdown file in `_posts/` using the `YYYY-MM-DD-slug.md` convention.

```yaml
---
title: "文章标题"
description: "用于列表和搜索摘要的一句话。"
date: 2026-07-22 12:00:00 +0800
categories: [研究]
tags: [AI, Finance]
translation_url: /en/writing/2026/07/english-slug/
toc: true
math: true       # optional: MathJax
mermaid: true    # optional: Mermaid fenced blocks
---
```

For an English article, add `lang: en` and an explicit English permalink:

```yaml
lang: en
permalink: /en/writing/2026/07/english-slug/
translation_url: /writing/2026/07/chinese-slug/
```

The typography covers headings, tables, task lists, footnotes, blockquotes, code highlighting, figures, details/summary, keyboard keys, and native HTML rich text. The article sidebar is generated automatically from level-two and level-three headings.

## Local build

```bash
bundle install
bundle exec jekyll serve
```

GitHub Actions builds and publishes the site on every push to `main`.
