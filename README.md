# maximilianhaensch.github.io

Personal academic homepage. A single scrollable page — plain HTML, CSS and
JavaScript with no framework, no build step and no external requests.

```
index.html    markup + content
style.css     styling, light/dark themes
script.js     scroll reveal, scroll spy, theme toggle
images/       portrait, favicon
files/        CV (PDF)
.nojekyll     serve files as-is, skip Jekyll processing
```

## Publishing

Push to a repository named `<username>.github.io`, then in
**Settings → Pages** set the source to *Deploy from a branch*, branch `main`,
folder `/ (root)`. The site appears at `https://<username>.github.io` within a
minute or two.

## Local preview

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening `index.html` directly via `file://`
also works, though `localhost` matches production more closely.

## Editing

Everything you are likely to change lives in `index.html`: the intro paragraph
under `<section id="about">`, the research statement, and the two `<ol class="pubs">`
lists. To add a paper, copy an existing `<li>` block and swap the title, link,
authors and arXiv id — the reveal animation and hover states apply automatically
because they are driven by the `reveal` and `pubs` classes.

Replacing the CV means dropping a new PDF into `files/` and updating the two
`href="files/…"` links (hero and contact section).

## Design notes

- **Colours** are CSS custom properties at the top of `style.css`. The palette
  follows the OS light/dark setting; the toggle in the header overrides it and
  remembers the choice in `localStorage`.
- **Motion** is driven by `IntersectionObserver`. Every animation is disabled
  under `prefers-reduced-motion: reduce`.
- **Without JavaScript** the page renders fully — the reveal animations are
  scoped behind an `html.js` class, so content is never hidden by default.
