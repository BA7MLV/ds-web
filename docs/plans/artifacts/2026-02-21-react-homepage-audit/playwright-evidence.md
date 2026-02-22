# Playwright Evidence (2026-02-21)

> Scope: React 官网首页（`/`）与下载视图（`/?view=download`）
>
> Local dev server: `npm run dev -- --host 127.0.0.1 --port 5173`

## Screenshots

- Home (Desktop, Light): `docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-light.png`
- Home (Desktop, Dark): `docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-dark.png`
- Download (Desktop, Light): `docs/plans/artifacts/2026-02-21-react-homepage-audit/download-desktop-light.png`
- Home (Mobile menu open, Light): `docs/plans/artifacts/2026-02-21-react-homepage-audit/home-mobile-menu-open.png`

## A11y/UX probes (extracted)

### Home (Desktop, Light)

```json
{
  "navLinks": ["DeepStudent", "功能", "QA", "文档", "GitHub", "下载", "GitHub"],
  "heroToggleAria": "代码开源，数据可控，定义属于你的学习Agent。当前第 1 项 / 共 4 项，可切换",
  "heroToggleText": "代码开源，数据可控，定义属于你的学习Agent1/4点击切换当前第 1 项 / 共 4 项，可切换",
  "eagerImages": 1,
  "highPriority": 1
}
```

### Home (Desktop, Dark)

```json
{
  "rootClass": "ds-js dark",
  "navLinks": ["DeepStudent", "功能", "QA", "文档", "GitHub", "下载", "GitHub"],
  "eagerImages": 1,
  "highPriority": 1
}
```

### Mobile menu focus/escape behavior

```json
{
  "dialogCountOnOpen": 1,
  "activeElementAriaOnOpen": "关闭菜单",
  "dialogCountAfterEscape": 0,
  "triggerFocusedAfterEscape": true
}
```

### Transition timing probe (computed styles)

> Note: this is a lightweight spot-check (CTA button + first FAQ details).

```json
{
  "normal": {
    "cta": {
      "transitionDuration": "0.2s",
      "transitionProperty": "all",
      "transitionTimingFunction": "cubic-bezier(0.4, 0, 0.2, 1)"
    },
    "faq": {
      "transitionDuration": "0.3s",
      "transitionProperty": "all",
      "transitionTimingFunction": "cubic-bezier(0.4, 0, 0.2, 1)"
    }
  },
  "reducedMotion": {
    "cta": {
      "transitionDuration": "0.2s",
      "transitionProperty": "all",
      "transitionTimingFunction": "cubic-bezier(0.4, 0, 0.2, 1)"
    },
    "faq": {
      "transitionDuration": "0.3s",
      "transitionProperty": "all",
      "transitionTimingFunction": "cubic-bezier(0.4, 0, 0.2, 1)"
    }
  }
}
```

### Mobile viewport probes (CTA visibility + horizontal scroll)

```json
{
  "mobile-light": {
    "viewport": {"width": 390, "height": 844},
    "hScroll": "no",
    "ctaInViewport": "yes"
  },
  "mobile-dark-forced": {
    "viewport": {"width": 390, "height": 844},
    "hScroll": "no",
    "ctaInViewport": "yes"
  }
}
```

### Download view probe

```json
{
  "url": "http://127.0.0.1:5173/?view=download",
  "h1": "DeepStudent v0.9.15",
  "navLinks": ["GitHub"]
}
```

### Preview smoke check (npm run preview)

```json
{
  "desktop": {
    "url": "http://127.0.0.1:4173/",
    "title": "您的终身学习空间｜DeepStudent",
    "h1": "AI原生\n学习方案",
    "hScroll": "no",
    "cta": {"found": true, "inViewport": "yes", "text": "下载"}
  },
  "desktopDark": {"rootClass": "ds-js light dark", "hScroll": "no"},
  "mobile": {"hScroll": "no", "cta": {"found": true, "inViewport": null, "text": "下载"}},
  "mobileMenu": {
    "dialogCountOnOpen": 1,
    "activeElementAriaOnOpen": "关闭菜单",
    "dialogCountAfterEscape": 0,
    "triggerFocusedAfterEscape": true
  },
  "download": {
    "url": "http://127.0.0.1:4173/?view=download",
    "title": "您的终身学习空间｜DeepStudent",
    "h1": "DeepStudent v0.9.15",
    "navLinks": ["GitHub"]
  }
}
```

```json
{
  "checked": [
    "http://127.0.0.1:4173/",
    "http://127.0.0.1:4173/?view=download"
  ],
  "errorCount": 0,
  "warningCount": 0,
  "errors": [],
  "warnings": []
}
```

## Notes

- Download view title observed: `DeepStudent v0.9.15` (see `download-desktop-light.png`).
