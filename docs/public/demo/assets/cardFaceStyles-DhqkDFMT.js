import{f as i}from"./vendor-react-CK9Q3ZQe.js";function l(e){return e?e.replace(/\boverflow(-x|-y)?(\s*:\s*)hidden\b/gi,"overflow$1$2auto"):""}const s=`
:where(img) { max-width: 100%; height: auto; }
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
.anki-sound {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  padding: 0.1em 0.55em;
  border: 1px solid currentColor;
  border-radius: 999px;
  font-size: 0.85em;
  line-height: 1.4;
  opacity: 0.75;
  vertical-align: baseline;
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
`,d=`
:where(html) { color-scheme: dark; }
:where(body) { color: #e5e7eb; }
:where(a) { color: #93c5fd; }
:where(hr) { border-color: rgba(255, 255, 255, 0.18); }
.anki-hint > .anki-hint-summary { color: #93c5fd; }
`,u=`
html, body { min-height: 100vh; scrollbar-gutter: auto; }
body { box-sizing: border-box; margin: 0; align-content: center; align-content: safe center; }
`;function b(e,t={}){const n=[s,l(e||"")];return t.surfaceColor&&n.push(`html, body { background: ${t.surfaceColor}; }`),t.darkMode&&n.push(d),t.stage&&n.push(u),n.join(`
`)}const a=e=>{if(typeof document>"u"||typeof MutationObserver>"u")return()=>{};const t=new MutationObserver(e);return t.observe(document.documentElement,{attributes:!0,attributeFilter:["class","data-theme"]}),()=>t.disconnect()},c=()=>{if(typeof document>"u")return!1;const e=document.documentElement;return e.classList.contains("dark")||e.getAttribute("data-theme")==="dark"};function p(){return i.useSyncExternalStore(a,c,()=>!1)}let o=null;function m(){if(typeof document>"u")return null;const e=document.documentElement,t=`${e.className}|${e.getAttribute("data-theme")??""}`;if(o?.key===t)return o.value;if(!document.body)return null;const n=document.createElement("div");n.style.cssText="position:absolute;visibility:hidden;pointer-events:none;background:hsl(var(--background))",document.body.appendChild(n);const r=getComputedStyle(n).backgroundColor||null;return n.remove(),o={key:t,value:r},r}function f(){return i.useSyncExternalStore(a,m,()=>null)}export{p as a,b,f as u};
