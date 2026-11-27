import{f as t}from"./vendor-react-CK9Q3ZQe.js";function i(o){return o?o.replace(/\boverflow(-x|-y)?(\s*:\s*)hidden\b/gi,"overflow$1$2auto"):""}const c=`
:where(img) { max-width: 100%; height: auto; }
:where(img:not([data-anki-media-pending="1"])) { cursor: zoom-in; }
img[data-anki-media-pending="1"] {
  display: inline-block;
  min-width: 160px;
  min-height: 120px;
  border-radius: 8px;
  background: rgba(128, 128, 128, 0.14);
  opacity: 0.65;
  cursor: progress;
}
:where(audio) { display: block; width: 100%; max-width: 320px; margin: 6px auto; }
:where(video) { max-width: 100%; height: auto; }
.anki-hint { display: inline-block; margin: 2px 0; }
.anki-hint > .anki-hint-summary {
  cursor: pointer;
  color: #2563eb;
  text-decoration: underline dotted;
  list-style: none;
  display: inline;
  user-select: none;
}
.anki-hint > .anki-hint-summary::-webkit-details-marker { display: none; }
.anki-hint[open] > .anki-hint-summary { opacity: 0.65; }
.anki-hint > .anki-hint-content { display: inline-block; margin-left: 0.4em; }
.anki-sound-player {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-width: 100%;
  margin: 6px auto;
  vertical-align: middle;
}
.anki-sound-player > audio.anki-audio {
  margin: 0;
  flex: 1 1 auto;
  min-width: 180px;
}
.anki-sound,
.anki-sound-play,
.anki-sound-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35em;
  min-height: 32px;
  padding: 0.25em 0.7em;
  border: 1px solid currentColor;
  border-radius: 999px;
  background: rgba(128, 128, 128, 0.14);
  color: inherit;
  font: inherit;
  font-size: 0.85em;
  line-height: 1.3;
  cursor: pointer;
  vertical-align: baseline;
  flex-shrink: 0;
}
.anki-sound-play {
  min-width: 34px;
  padding: 0.25em 0.55em;
}
.anki-sound-play:hover,
.anki-sound-btn:hover:not(:disabled) {
  background: rgba(128, 128, 128, 0.26);
}
.anki-sound-btn:disabled {
  opacity: 0.72;
  cursor: progress;
}
.anki-sound-name { max-width: 14em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.anki-type-input {
  display: inline-block;
  min-width: 10em;
  min-height: 1.2em;
  border-bottom: 1.5px dashed currentColor;
  opacity: 0.6;
  vertical-align: baseline;
}
.anki-type-answer { font-weight: 600; border-bottom: 1.5px solid currentColor; }
`,b=`
:where(html) { color-scheme: dark; }
:where(body) { color: #e5e7eb; }
:where(a) { color: #93c5fd; }
:where(hr) { border-color: rgba(255, 255, 255, 0.18); }
.anki-hint > .anki-hint-summary { color: #93c5fd; }
:where(body.nightMode .cloze, body.night_mode .cloze) {
  background: #1e3a5f;
  color: #bfdbfe;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  padding: 1px 6px;
  font-weight: 600;
}
body.card.nightMode:has(.glass-panel, .lab-card, .redact-card, .exam-paper, .mono-page, .fn-page, .mg-sheet, .sem-sheet, .nom-sheet),
body.card.night_mode:has(.glass-panel, .lab-card, .redact-card, .exam-paper, .mono-page, .fn-page, .mg-sheet, .sem-sheet, .nom-sheet) {
  background: #14161a !important;
  color: #f3f4f6 !important;
}
body.card.nightMode .glass-panel,
body.card.night_mode .glass-panel,
body.card.nightMode .lab-card,
body.card.night_mode .lab-card {
  background: #1e222a !important;
  color: #f3f4f6 !important;
  border-color: #333a47 !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45) !important;
}
body.card.nightMode .glass-sub,
body.card.night_mode .glass-sub,
body.card.nightMode .lab-tag,
body.card.night_mode .lab-tag {
  color: #9ca3af !important;
}
body.card.nightMode .glass-text,
body.card.night_mode .glass-text,
body.card.nightMode .lab-q,
body.card.night_mode .lab-q {
  color: #f3f4f6 !important;
  border-bottom-color: #333a47 !important;
}
body.card.nightMode .glass-extra,
body.card.night_mode .glass-extra {
  color: #9ca3af !important;
  border-top-color: #333a47 !important;
}
body.card.nightMode .glass-panel .cloze,
body.card.night_mode .glass-panel .cloze,
body.card.nightMode .glass-panel .cloze b,
body.card.night_mode .glass-panel .cloze b {
  background: #1e3a5f !important;
  color: #bfdbfe !important;
  border: 1px solid #3b82f6 !important;
  font-weight: 600 !important;
}
body.card.nightMode .glass-panel.revealed .cloze,
body.card.night_mode .glass-panel.revealed .cloze,
body.card.nightMode .glass-panel.revealed .cloze b,
body.card.night_mode .glass-panel.revealed .cloze b {
  background: #14532d !important;
  color: #86efac !important;
  border-color: #22c55e !important;
  font-weight: 600 !important;
}
body.card.nightMode .redact-card,
body.card.night_mode .redact-card {
  background: #1b1f27 !important;
  color: #f3f4f6 !important;
  border-color: #374151 !important;
}
body.card.nightMode .redact-header,
body.card.night_mode .redact-header {
  color: #9ca3af !important;
}
body.card.nightMode .redact-text,
body.card.night_mode .redact-text {
  color: #f3f4f6 !important;
}
body.card.nightMode .redact-card .cloze,
body.card.night_mode .redact-card .cloze,
body.card.nightMode .redact-card .cloze b,
body.card.night_mode .redact-card .cloze b {
  background: #334155 !important;
  color: #f8fafc !important;
  border: 1px solid #64748b !important;
  font-weight: 600 !important;
}
body.card.nightMode .redact-card.revealed .cloze,
body.card.night_mode .redact-card.revealed .cloze,
body.card.nightMode .redact-card.revealed .cloze b,
body.card.night_mode .redact-card.revealed .cloze b {
  background: rgba(248, 113, 113, 0.14) !important;
  color: #fca5a5 !important;
  border-color: transparent !important;
  border-bottom: 2px solid #f87171 !important;
}
body.card.nightMode .exam-paper,
body.card.night_mode .exam-paper {
  background: #211f1c !important;
  color: #edeae2 !important;
  border: 1px solid #38332c !important;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.45) !important;
}
body.card.nightMode .exam-head,
body.card.night_mode .exam-head {
  color: #b5aa97 !important;
}
body.card.nightMode .exam-rule,
body.card.night_mode .exam-rule {
  border-color: #6b6356 !important;
}
body.card.nightMode .exam-front .cloze,
body.card.night_mode .exam-front .cloze {
  color: #93c5fd !important;
  background: rgba(59, 130, 246, 0.16) !important;
  border-bottom: 1.5px solid #60a5fa !important;
  border-radius: 3px;
}
body.card.nightMode .exam-front .cloze-hint,
body.card.night_mode .exam-front .cloze-hint {
  color: #cbd5e1 !important;
}
body.card.nightMode .exam-back .cloze,
body.card.night_mode .exam-back .cloze,
body.card.nightMode .exam-back .cloze-revealed,
body.card.night_mode .exam-back .cloze-revealed {
  color: #fda4af !important;
  border-bottom-color: rgba(253, 164, 175, 0.65) !important;
}
body.card.nightMode .exam-remark-sep,
body.card.night_mode .exam-remark-sep {
  border-top-color: #575046 !important;
}
body.card.nightMode .exam-remark-body,
body.card.night_mode .exam-remark-body {
  color: #c7bfb1 !important;
}
body.card.nightMode .exam-remark-body .exam-remark-label,
body.card.night_mode .exam-remark-body .exam-remark-label {
  color: #fda4af !important;
}
body.card.nightMode .lab-opt,
body.card.night_mode .lab-opt {
  color: #e5e7eb !important;
  background: #262b36 !important;
  border-color: #3a4252 !important;
}
body.card.nightMode .lab-opt:hover:not(.answered),
body.card.night_mode .lab-opt:hover:not(.answered) {
  background: #303746 !important;
}
body.card.nightMode .lab-opt.correct,
body.card.night_mode .lab-opt.correct {
  background: #14532d !important;
  border-color: #22c55e !important;
  color: #bbf7d0 !important;
}
body.card.nightMode .lab-opt.wrong,
body.card.night_mode .lab-opt.wrong {
  background: #7f1d1d !important;
  border-color: #f87171 !important;
  color: #fecaca !important;
}
body.card.nightMode .explanation-box,
body.card.night_mode .explanation-box {
  background: #252a34 !important;
  color: #d1d5db !important;
}
body.card.nightMode .mono-page,
body.card.night_mode .mono-page,
body.card.nightMode .fn-page,
body.card.night_mode .fn-page,
body.card.nightMode .mg-sheet,
body.card.night_mode .mg-sheet,
body.card.nightMode .sem-sheet,
body.card.night_mode .sem-sheet,
body.card.nightMode .nom-sheet,
body.card.night_mode .nom-sheet {
  background: #211f1c !important;
  color: #edeae2 !important;
  border: 1px solid #38332c;
}
body.card.nightMode .mono-a,
body.card.night_mode .mono-a,
body.card.nightMode .fn-note,
body.card.night_mode .fn-note,
body.card.nightMode .mg-def,
body.card.night_mode .mg-def,
body.card.nightMode .sem-text,
body.card.night_mode .sem-text,
body.card.nightMode .nom-def-body,
body.card.night_mode .nom-def-body,
body.card.nightMode .nom-name,
body.card.night_mode .nom-name {
  color: #d6d0c4 !important;
}
`,m=`
html, body { min-height: 100vh; scrollbar-gutter: auto; }
body { box-sizing: border-box; margin: 0; align-content: center; align-content: safe center; }
`;function s(o,e={}){const a=[c,i(o||"")];return e.surfaceColor&&a.push(`html, body { background: ${e.surfaceColor}; }`),e.darkMode&&a.push(b),e.stage&&a.push(m),a.join(`
`)}const n=o=>{if(typeof document>"u"||typeof MutationObserver>"u")return()=>{};const e=new MutationObserver(o);return e.observe(document.documentElement,{attributes:!0,attributeFilter:["class","data-theme"]}),()=>e.disconnect()},l=()=>{if(typeof document>"u")return!1;const o=document.documentElement;return o.classList.contains("dark")||o.getAttribute("data-theme")==="dark"};function p(){return t.useSyncExternalStore(n,l,()=>!1)}let r=null;function g(){if(typeof document>"u")return null;const o=document.documentElement,e=`${o.className}|${o.getAttribute("data-theme")??""}`;if(r?.key===e)return r.value;if(!document.body)return null;const a=document.createElement("div");a.style.cssText="position:absolute;visibility:hidden;pointer-events:none;background:hsl(var(--background))",document.body.appendChild(a);const d=getComputedStyle(a).backgroundColor||null;return a.remove(),r={key:e,value:d},d}function y(){return t.useSyncExternalStore(n,g,()=>null)}export{p as a,s as b,y as u};
