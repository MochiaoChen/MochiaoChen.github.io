---
layout: page
title: "Tools"
description: "Small, practical tools for research, writing, and everyday work."
permalink: /en/tools/
eyebrow: "WORK / USEFUL THINGS"
wide: true
lang: en
translation_url: /tools/
---

<p class="page-intro">I like to begin with a concrete inconvenience. Some of these projects are complete applications; others are scripts that save a few minutes of repetitive work. Every item below links to its source or current status on GitHub.</p>

<div class="tools-catalog">
{% for tool in site.data.tools %}
  <article class="catalog-card">
    <div class="catalog-card__meta"><span>{{ tool.kind }}</span><span>{{ tool.status }}</span></div>
    <h2><a href="{{ tool.url }}">{{ tool.name }}</a></h2>
    <p>{{ tool.description_en }}</p>
    <div class="catalog-card__footer"><span>{{ tool.stack }}</span><a href="{{ tool.url }}" aria-label="Open {{ tool.name }}">View project ↗</a></div>
  </article>
{% endfor %}
</div>
