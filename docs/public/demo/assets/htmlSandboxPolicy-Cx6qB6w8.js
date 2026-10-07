import{G as s}from"./vendor-micro-ZOaxVYfF.js";const l=`<script>
  function sdpMeasure() {
    var b = document.body;
    if (!b) return 0;
    var de = document.documentElement;
    var deh = de.style.height, bh = b.style.height, bm = b.style.minHeight;
    de.style.height = 'auto'; b.style.height = 'auto'; b.style.minHeight = '0';
    var h = b.scrollHeight;
    de.style.height = deh; b.style.height = bh; b.style.minHeight = bm;
    return h;
  }
  new ResizeObserver(function() {
    var h = sdpMeasure();
    if (h > 0) window.parent.postMessage({ type: 'sdp-resize', height: h }, '*');
  }).observe(document.documentElement);
  window.addEventListener('load', function() {
    var h = sdpMeasure();
    if (h > 0) window.parent.postMessage({ type: 'sdp-resize', height: h }, '*');
  });
<\/script>`;function d(t){return t.replace(/\/\*[\s\S]*?\*\//g,"")}function p(t,n){if(!t)return"";let e=d(t);return e=e.replace(/\\[0-9a-fA-F]{1,6}\s?/g,"_"),e=e.replace(/<\s*\/\s*style/gi,"<\\/style"),e=e.replace(/@import\s+[^;]+;?/gi,""),e=e.replace(/@charset\s+[^;]+;?/gi,""),e=e.replace(/@font-face\s*\{[^}]*\}/gi,""),e=e.replace(/expression\s*\(/gi,""),e=e.replace(/behavior\s*:/gi,"blocked-behavior:"),e=e.replace(/-moz-binding\s*:/gi,"blocked-moz-binding:"),e=e.replace(/javascript\s*:/gi,"blocked-javascript:"),e=e.replace(/url\s*\(\s*(['"]?)\s*(.*?)\s*\1\s*\)/gi,(a,r,o)=>String(o).trim().toLowerCase().startsWith("data:image/")?`url(${r}${o}${r})`:`url(${r}blocked${r})`),e}function u(t,n){if(!t)return"";const e=/^\s*(<!doctype|<html[\s>])/i.test(t.trim());return n==="template-safe"?s.sanitize(t,{WHOLE_DOCUMENT:e,ADD_TAGS:["style","meta","script"],ADD_ATTR:["onclick"],FORBID_TAGS:["iframe","embed","object","form","base"],FORBID_ATTR:["onerror","onload","onmouseover","onfocus","onblur"],ALLOW_DATA_ATTR:!0}):s.sanitize(t,{WHOLE_DOCUMENT:e,ADD_TAGS:["style","meta"],FORBID_TAGS:["script","iframe","embed","object","form","base","link"],FORBID_ATTR:["onerror","onload","onclick","onmouseover","onfocus","onblur"],ALLOW_DATA_ATTR:!1})}function f(t){return t==="template-safe"?"allow-scripts":""}function b(t){return t==="template-safe"?["default-src 'none'","img-src data: blob: https:","media-src data: blob: https:","style-src 'unsafe-inline'","font-src data:","connect-src 'none'","script-src 'unsafe-inline'","frame-src 'none'","object-src 'none'","base-uri 'none'","form-action 'none'"].join("; "):["default-src 'none'","img-src data: blob: https:","media-src data: blob: https:","style-src 'unsafe-inline'","font-src data:","connect-src 'none'","script-src 'none'","frame-src 'none'","object-src 'none'","base-uri 'none'","form-action 'none'"].join("; ")}function g({html:t,css:n,mode:e,compact:a=!1,fidelity:r="default"}){const o=r==="anki",i=o||e==="chat-safe"?t:`<div class="card-content-container">${t}</div>`,c=e==="template-safe"?l:"";return`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${b(e)}">
<style>
  :root {
    --preview-scrollbar-thumb: color-mix(in srgb, CanvasText 28%, transparent);
    --preview-scrollbar-track: transparent;
  }
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    background: ${a||o?"transparent":"white"};
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-gutter: stable both-edges;
    scrollbar-color: var(--scrollbar-thumb, var(--preview-scrollbar-thumb))
      var(--scrollbar-track, var(--preview-scrollbar-track));
    max-width: 100%;
    min-height: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    -webkit-overflow-scrolling: touch;
  }
  .card-content-container {
    background: ${a?"transparent":"white"};
    border-radius: ${a?"0":"16px"};
    padding: ${a?"4px":"20px"};
    box-sizing: border-box;
    overflow: visible;
    position: relative;
    max-width: 100%;
  }
  .card-content-container * {
    max-width: 100%;
    box-sizing: border-box;
  }
  img, video, canvas, svg {
    max-width: 100%;
    height: auto;
  }
  table {
    max-width: 100%;
    overflow-x: auto;
    display: block;
  }
  pre, code {
    max-width: 100%;
    overflow-x: auto;
    word-wrap: break-word;
  }
  /* KaTeX 豁免：内部绝对定位子元素对强制 max-width 敏感，强压会破坏公式布局；
     超宽的展示公式改为容器内横向滚动（与 table/pre 同策略），窄屏不再被裁剪。 */
  .katex, .katex * {
    max-width: none;
  }
  .katex-display {
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
  }
  ${n}
</style>
${c}
</head>
<body${o?' class="card"':""}>
${i}
</body>
</html>`}export{f as a,g as b,u as c,b as g,p as s};
