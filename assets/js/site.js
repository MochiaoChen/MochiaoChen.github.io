(function () {
  var root = document.documentElement;
  var themeButton = document.querySelector('.theme-toggle');
  var navButton = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');

  if (themeButton) {
    themeButton.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('mochiao-theme', next); } catch (e) {}
    });
  }

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navButton.setAttribute('aria-expanded', String(open));
    });
  }

  var article = document.querySelector('[data-article]');
  var toc = document.querySelector('[data-toc]');
  if (article && toc) {
    var headings = Array.prototype.slice.call(article.querySelectorAll('h2, h3'));
    var used = {};
    headings.forEach(function (heading, index) {
      var base = heading.id || heading.textContent.trim()
        .toLowerCase()
        .replace(/[^\w\u3400-\u9fff\s-]/g, '')
        .replace(/\s+/g, '-');
      base = base || 'section-' + (index + 1);
      var id = base;
      var count = 1;
      while (used[id] || document.getElementById(id)) { id = base + '-' + (++count); }
      if (!heading.id) heading.id = id;
      used[heading.id] = true;

      var link = document.createElement('a');
      link.href = '#' + heading.id;
      var label = heading.cloneNode(true);
      Array.prototype.forEach.call(label.querySelectorAll('.cv-date'), function (date) { date.remove(); });
      link.textContent = label.textContent.trim();
      link.dataset.level = heading.tagName.slice(1);
      toc.appendChild(link);
    });

    if (headings.length && 'IntersectionObserver' in window) {
      var links = Array.prototype.slice.call(toc.querySelectorAll('a'));
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
          });
        });
      }, { rootMargin: '-15% 0px -70% 0px' });
      headings.forEach(function (heading) { observer.observe(heading); });
    }
  }

  var readingTime = document.querySelector('[data-reading-time]');
  if (article && readingTime) {
    var text = article.textContent.trim();
    var chinese = (text.match(/[\u3400-\u9fff]/g) || []).length;
    var words = (text.replace(/[\u3400-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
    var minutes = Math.max(1, Math.ceil(chinese / 350 + words / 220));
    readingTime.textContent = document.documentElement.lang === 'en'
      ? minutes + ' min read'
      : '约 ' + minutes + ' 分钟';
  }
})();
