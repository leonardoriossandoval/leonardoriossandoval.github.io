# Leo Ríos — Portfolio

Personal portfolio of Leonardo Ríos Sandoval, junior software developer (Terrassa / Barcelona).
Static site with no build step, ready for GitHub Pages: `https://leonardoriossandoval.github.io/`

## Structure

```
index.html              Page markup (sections and SVG illustrations)
css/
  base.css              Colour tokens, reset, buttons, nav, layout helpers
  sections.css          Hero, about, projects, skills, studies, contact
  chapters.css          Pinned scroll chapters (Formula Student, PCB, SQL/ERP, soft skills) and timeline
  responsive.css        Breakpoints (1060 / 900 / 640 px) and reduced motion
js/
  core.js               Shared helpers (window.LR): selectors, "in view" watcher
  nav.js                Sticky header, scroll progress, active link, mobile menu
  reveal.js             Reveal-on-scroll
  terminals.js          Project terminals that type when visible
  chapters.js           Scroll-scrubbed animations: car, PCB, SQL → table → chart, soft-skill words
  skills.js             Spotlight effect on skill cards
  studies.js            UOC roadmap, filters, progress ring and counters
  contact.js            Copy email button
  hero-network.js       Animated node network behind the hero
  main.js               Starts the shared watcher (loaded last)
assets/icons/           Technology icons (Devicon, MIT licence)
img/                    Photos (fot.png, etc.) — already in the repo
```

## Deploy

1. Copy these files into the root of the `leonardoriossandoval.github.io` repository (keep the existing `img/` folder).
2. Commit and push to `main`. GitHub Pages publishes automatically.

## Editing

- **Colours:** variables in `:root` at the top of `css/base.css`.
- **Subjects and credits:** `plan` array in `js/studies.js` (`d` = passed, `p` = in progress, `t` = to go) and the KPI figures in `index.html`.
- **Animation timing:** each chapter uses a progress value `p` from 0 to 1. The ranges are set in `js/chapters.js` and in the `data-r` attributes on each `.beat` in `index.html`.
