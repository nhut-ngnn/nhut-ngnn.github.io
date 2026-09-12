---
layout: page
permalink: /repositories/
title: Repositories
description: Code released alongside the papers — models, training pipelines, and reading lists. Everything here is public on GitHub.
nav: true
nav_order: 4
---

<!-- prettier-ignore-start -->
{% assign handle = site.data.repositories.github_users | first %}

<section class="ac-gh-profile">
  {% capture avatar_path %}assets/img/{{ site.profile_image | default: 'Github_img.jpg' }}{% endcapture %}
  <img class="ac-gh-avatar" src="{{ avatar_path | relative_url }}" alt="{{ site.first_name }} {{ site.last_name }}" width="72" height="72" loading="lazy" decoding="async">
  <div class="ac-gh-id">
    <a class="ac-gh-handle" href="https://github.com/{{ handle }}" rel="noopener">@{{ handle }}</a>
    <span class="ac-gh-name">{{ site.first_name }} {{ site.middle_name }} {{ site.last_name }}</span>
  </div>
  <dl class="ac-gh-stats" id="ac-gh-stats" hidden>
    <div><dt>Repositories</dt><dd data-gh-repos>—</dd></div>
    <div><dt>Followers</dt><dd data-gh-followers>—</dd></div>
    <div><dt>Stars</dt><dd data-gh-stars>—</dd></div>
  </dl>
</section>

<h2 class="ac-section-title">Selected repositories</h2>

<ul class="ac-repo-grid" id="ac-repo-grid">
  {% for entry in site.data.repositories.github_repos %}
    {% include repository/repo_card.liquid entry=entry %}
  {% endfor %}
</ul>

<p class="ac-repo-footnote">
  Star counts and languages are read from the GitHub API when this section comes into view.
  Full list of repositories: <a href="https://github.com/{{ handle }}?tab=repositories" rel="noopener">github.com/{{ handle }}</a>.
</p>

<script>
  /* Enrich the repository cards from GitHub. One request per owner (not per
     repo), issued only when the grid scrolls into view, cached in sessionStorage
     for 30 minutes. Every failure is silent: the cards already read correctly
     without it. */
  (function () {
    var grid = document.getElementById('ac-repo-grid');
    if (!grid || !window.fetch) return;

    var HANDLE = {{ handle | jsonify }};
    var TTL = 30 * 60 * 1000;
    var LANG_COLOR = {
      'Python': '#3572A5',
      'Jupyter Notebook': '#DA5B0B',
      'JavaScript': '#F1E05A',
      'TypeScript': '#3178C6',
      'C++': '#F34B7D',
      'C': '#555555',
      'Java': '#B07219',
      'MATLAB': '#E16737',
      'Shell': '#89E051',
      'HTML': '#E34C26',
      'CSS': '#663399',
      'Go': '#00ADD8',
      'Rust': '#DEA584',
      'R': '#198CE7',
      'Lua': '#000080',
      'TeX': '#3D6117'
    };

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-repo]'));
    var owners = [];
    cards.forEach(function (c) {
      var o = c.getAttribute('data-repo').split('/')[0];
      if (owners.indexOf(o) === -1) owners.push(o);
    });

    function cached(key) {
      try {
        var raw = sessionStorage.getItem(key);
        if (!raw) return null;
        var box = JSON.parse(raw);
        if (Date.now() - box.t > TTL) return null;
        return box.v;
      } catch (e) {
        return null;
      }
    }

    function store(key, value) {
      try {
        sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value }));
      } catch (e) {
        /* private mode, quota — not worth reporting */
      }
    }

    function getJSON(url, key) {
      var hit = cached(key);
      if (hit) return Promise.resolve(hit);
      return fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.json();
        })
        .then(function (data) {
          store(key, data);
          return data;
        });
    }

    function compact(n) {
      return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k' : String(n);
    }

    function sinceLabel(iso) {
      var then = new Date(iso);
      if (isNaN(then)) return '';
      var days = Math.floor((Date.now() - then) / 86400000);
      if (days < 1) return 'Updated today';
      if (days < 30) return 'Updated ' + days + (days === 1 ? ' day ago' : ' days ago');
      return 'Updated ' + then.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    }

    function show(el) {
      if (el) el.hidden = false;
    }

    function fill(card, repo) {
      if (!repo) return;
      var note = card.querySelector('[data-note]');
      if (note && !note.textContent.trim() && repo.description) note.textContent = repo.description;

      var meta = card.querySelector('[data-meta]');
      if (repo.language) {
        var lang = card.querySelector('[data-lang]');
        card.querySelector('[data-lang-name]').textContent = repo.language;
        card.querySelector('[data-dot]').style.backgroundColor = LANG_COLOR[repo.language] || '#9aa2ad';
        show(lang);
      }
      if (repo.stargazers_count) {
        card.querySelector('[data-stars-value]').textContent = compact(repo.stargazers_count);
        show(card.querySelector('[data-stars]'));
      }
      if (repo.forks_count) {
        card.querySelector('[data-forks-value]').textContent = compact(repo.forks_count);
        show(card.querySelector('[data-forks]'));
      }
      if (repo.pushed_at) {
        var up = card.querySelector('[data-updated]');
        up.textContent = sinceLabel(repo.pushed_at);
        show(up);
      }
      show(meta);
    }

    function load() {
      owners.forEach(function (owner) {
        getJSON('https://api.github.com/users/' + owner + '/repos?per_page=100&sort=pushed', 'gh:repos:' + owner)
          .then(function (list) {
            if (!Array.isArray(list)) return;
            var index = {};
            list.forEach(function (r) {
              index[r.full_name.toLowerCase()] = r;
            });
            cards.forEach(function (card) {
              var slug = card.getAttribute('data-repo').toLowerCase();
              if (slug.split('/')[0] === owner.toLowerCase()) fill(card, index[slug]);
            });
            if (owner === HANDLE) {
              var stars = list.reduce(function (t, r) {
                return t + (r.fork ? 0 : r.stargazers_count);
              }, 0);
              var box = document.getElementById('ac-gh-stats');
              box.querySelector('[data-gh-repos]').textContent = list.filter(function (r) {
                return !r.fork;
              }).length;
              box.querySelector('[data-gh-stars]').textContent = compact(stars);
              box.hidden = false;
            }
          })
          .catch(function () {
            /* rate limited or offline — the static cards stand on their own */
          });
      });

      getJSON('https://api.github.com/users/' + HANDLE, 'gh:user:' + HANDLE)
        .then(function (u) {
          var box = document.getElementById('ac-gh-stats');
          box.querySelector('[data-gh-followers]').textContent = compact(u.followers || 0);
          box.hidden = false;
        })
        .catch(function () {});
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          if (entries.some(function (e) { return e.isIntersecting; })) {
            io.disconnect();
            load();
          }
        },
        { rootMargin: '200px' }
      );
      io.observe(grid);
    } else {
      load();
    }
  })();
</script>
<!-- prettier-ignore-end -->
