import{N as g}from"./vendor-micro-DbbzlYBM.js";import{f as $}from"./vendor-react-CK9Q3ZQe.js";import{invoke as z}from"./core-DhEqZVGG.js";const x=256,b=new Map,p=new Map,L="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",B=/^(?:data:|blob:|https?:|asset:)/i,F=/^(?:data:|blob:|https:)/i,W=/\.(?:mp3|ogg|oga|opus|wav|m4a|aac|flac|webm)(?:$|[?#])/i,j=/\.(?:mp4)(?:$|[?#])/i,U=/\.(?:png|jpe?g|gif|webp|svg|bmp|avif|mp3|ogg|oga|opus|wav|m4a|aac|flac|webm|mp4)(?:$|[?#])/i;function C(t,i){if(p.has(t))p.delete(t);else if(p.size>=x){const e=p.keys().next().value;e!==void 0&&p.delete(e)}p.set(t,i)}function O(t){const i=p.get(t);if(i)return i;const e=m(u(t));return e&&e!==t.trim()&&!/[\\/:]/.test(e)&&e!=="."&&e!==".."?p.get(e)??null:null}function nt(){b.clear(),p.clear()}function it(t){return W.test(t.trim())}function st(t){return j.test(t.trim())}function q(t){const i=t.trim();return!i||B.test(i)?!1:/[\\/]anki_media[\\/]/i.test(i)||/^anki-media:\/\//i.test(i)?!0:!/[\\/:]/.test(i)&&U.test(i)}function m(t){const i=t.trim().replace(/^anki-media:\/\/\/?/i,"").split(/[?#]/)[0]??t,e=i.split(/[\\/]/);return e[e.length-1]??i}function R(t){const i=p.get(t);if(i)return Promise.resolve(i);const e=b.get(t);if(e)return e;const s=z("read_anki_media",{path:t}).then(n=>{if(typeof n=="string"&&n.startsWith("data:")){C(t,n);const a=m(u(t));return a&&a!==t&&!/[\\/:]/.test(a)&&a!=="."&&a!==".."&&C(a,n),n}return b.delete(t),null}).catch(()=>(b.delete(t),null));if(b.set(t,s),b.size>x){const n=b.keys().next().value;n!==void 0&&b.delete(n)}return s}async function I(t){const i=await R(t);if(i)return i;const e=m(u(t));return e&&e!==t.trim()&&!/[\\/:]/.test(e)&&e!=="."&&e!==".."?R(e):null}function rt(t){if(!t)return[];const i=[],e=new Set,s=n=>{const a=n.trim();if(!a||B.test(a))return;const r=m(u(a));if(!r||r==="."||r===".."||/[\\/:]/.test(r))return;const o=r.toLowerCase();e.has(o)||(e.add(o),i.push(r))};for(const n of t.matchAll(/\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s"'=<>`]+))/gi))s(n[1]??n[2]??n[3]??"");for(const n of t.matchAll(k))s(n[1]??"");return i}function D(t,i){if(t.size===0)return;const e=i.trim();if(!e)return;const s=u(e),n=m(e),a=m(s),r=t.get(a)??t.get(n);if(r)return r;const o=a.toLowerCase();for(const[c,l]of t.entries())if(c.toLowerCase()===o)return l}function H(t,i){const e=[],s=new Set;for(const n of t??[]){if(!q(n))continue;const a=m(u(n));if(!a)continue;const r=a.toLowerCase();s.has(r)||(s.add(r),e.push(n))}for(const n of i??[]){const a=m(u(n));if(!a||a==="."||a===".."||/[\\/:]/.test(a))continue;const r=a.toLowerCase();s.has(r)||(s.add(r),e.push(a))}return e}function M(t){const i=new Map;let e=!0;for(const s of t){const n=O(s);n?i.set(m(u(s)),n):e=!1}return{media:i,allResolved:e}}function ot(t,i){const e=H(t,i);if(e.length===0)return Promise.resolve();const s=e.filter(n=>!O(n)).map(n=>I(n));return s.length===0?Promise.resolve():Promise.all(s).then(()=>{})}function ct(t,i,e=0){const s=H(t,i),n=s.join(`
`),a=`${e}\0${n}`,r=M(s),[o,c]=$.useState(()=>({requestKey:!n||r.allResolved?a:"",media:r.media}));return $.useEffect(()=>{const l=n?n.split(`
`):[];if(l.length===0){c(d=>d.requestKey===a&&d.media.size===0?d:{requestKey:a,media:new Map});return}const y=M(l);if(y.allResolved){c(d=>d.requestKey===a?d:{requestKey:a,media:y.media});return}let f=!1;return Promise.all(l.map(async d=>[m(u(d)),await I(d)])).then(d=>{if(f)return;const h=new Map;for(const[A,w]of d)w&&h.set(A,w);c({requestKey:a,media:h})}),()=>{f=!0}},[n,a]),o.requestKey===a?{media:o.media,loading:!1}:!n||r.allResolved?{media:r.media,loading:!1}:{media:r.media,loading:!0}}function T(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}function u(t){try{return decodeURIComponent(t.trim())}catch{return t.trim()}}const k=/\[sound:([^\]]+)\]/gi;function dt(t){const i=new Set;for(const e of t.matchAll(k))i.add(u(e[1]));return i}function lt(t,i,e={}){let s=t.replace(/<(img|audio|video|source)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi,(n,a,r)=>{const o=a.toLowerCase();let c=!1;const l=r.replace(/(\ssrc\s*=\s*)(?:(["'])([^"']*)\2|([^\s"'=<>`]+))/gi,(y,f,d,h,A)=>{const v=(h??A??"").trim();if(v&&F.test(v))return y;c=!0;const E=v?D(i,v):void 0,S=d??'"';if(E)return`${f}${S}${E}${S}`;const _=v?` data-anki-media-ref="${T(v)}"`:"";if(o==="img"){const P=/\bwidth\s*=/i.test(r),N=/\bheight\s*=/i.test(r);return`${f}"${L}" data-anki-media-pending="1"${`${P?"":' width="240"'}${N?"":' height="160"'}`}${_}`}return` data-anki-media-pending="1"${_}`});return c?`<${a}${l}>`:n});return s=s.replace(k,(n,a)=>{const r=u(a),o=D(i,r),c=T(r);if(!o)return e.mediaLoading?`<button type="button" class="anki-sound anki-sound-btn" data-sound-file="${c}" data-sound-state="loading" aria-busy="true" aria-label="Loading audio ${c}" title="${c}" disabled><span class="anki-sound-icon" aria-hidden="true">&#9654;</span><span class="anki-sound-label">Loading&#8230;</span></button>`:`<button type="button" class="anki-sound anki-sound-btn" data-sound-file="${c}" data-sound-state="unavailable" aria-label="Play audio ${c}" title="${c}"><span class="anki-sound-icon" aria-hidden="true">&#9654;</span><span class="anki-sound-name">${c}</span></button>`;const l=e.noAutoplay?.has(r)?"0":"1";return`<span class="anki-sound-player" data-sound-file="${c}"><button type="button" class="anki-sound-play" data-sound-file="${c}" data-sound-state="ready" aria-label="Play audio ${c}" title="${c}"><span class="anki-sound-icon" aria-hidden="true">&#9654;</span></button><audio class="anki-audio" controls preload="auto" src="${o}" data-sound-file="${c}" data-autoplay="${l}"></audio></span>`}),s}function ut(t){return/<(details|audio|video|img|a\s|input|select|button|textarea)\b|\sonclick\s*=|<script\b/i.test(t)}function ft(t){return/<\/?(?:[a-z][a-z0-9]*)\b[^>]*>/i.test(t)||/\[sound:[^\]]+\]/i.test(t)}const G=`<script>(function(){
  var audios = Array.prototype.slice.call(document.querySelectorAll('audio.anki-audio'));
  function syncBtn(a, playing){
    var p = a && a.closest ? a.closest('.anki-sound-player') : null;
    var btn = p ? p.querySelector('button.anki-sound-play') : null;
    if (!btn) return;
    btn.setAttribute('data-playing', playing ? '1' : '0');
    var icon = btn.querySelector('.anki-sound-icon');
    if (icon) icon.textContent = playing ? '\\u23F8' : '\\u25B6';
  }
  audios.forEach(function(a){
    a.addEventListener('play', function(){ syncBtn(a, true); });
    a.addEventListener('pause', function(){ syncBtn(a, false); });
    a.addEventListener('ended', function(){ syncBtn(a, false); });
  });
  function stopAll(){ audios.forEach(function(a){ try { a.pause(); } catch (e) {} }); }
  function playFrom(list, i){
    if (i >= list.length) return;
    var a = list[i];
    a.onended = function(){ syncBtn(a, false); playFrom(list, i + 1); };
    try { a.currentTime = 0; var p = a.play(); if (p && p.catch) p.catch(function(){}); } catch (e) {}
  }
  var auto = audios.filter(function(a){ return a.getAttribute('data-autoplay') === '1'; });
  if (auto.length) playFrom(auto, 0);
  window.addEventListener('message', function(event){
    if (event.data && event.data.type === 'sdp-replay-audio') { stopAll(); playFrom(audios, 0); }
  });
  document.addEventListener('click', function(event){
    var target = event.target;
    var playBtn = target && target.closest ? target.closest('button.anki-sound-play') : null;
    if (playBtn) {
      event.preventDefault();
      event.stopPropagation();
      var player = playBtn.closest('.anki-sound-player');
      var audio = player ? player.querySelector('audio.anki-audio') : null;
      if (audio) {
        if (!audio.paused && !audio.ended) {
          try { audio.pause(); } catch (e) {}
        } else {
          stopAll();
          try {
            if (audio.ended) audio.currentTime = 0;
            var p = audio.play();
            if (p && p.catch) p.catch(function(){});
          } catch (e) {}
        }
      }
      return;
    }
    var soundBtn = target && target.closest ? target.closest('button.anki-sound-btn') : null;
    if (soundBtn) {
      event.preventDefault();
      event.stopPropagation();
      try { parent.postMessage({ type: 'sdp-sound-click', soundFile: soundBtn.getAttribute('data-sound-file') || '' }, '*'); } catch (e) {}
      return;
    }
    var img = target && target.closest ? target.closest('img') : null;
    if (img && (!img.closest || !img.closest('a,button'))) {
      var pending = img.getAttribute('data-anki-media-pending') === '1';
      var src = img.currentSrc || img.getAttribute('src') || '';
      if (!pending && src) {
        event.preventDefault();
        event.stopPropagation();
        try { parent.postMessage({ type: 'sdp-image-click', src: src, alt: img.getAttribute('alt') || '' }, '*'); } catch (e) {}
        return;
      }
    }
    if (target && target.closest && target.closest('a,button,summary,details,audio,video,input,select,textarea,label,[onclick]')) return;
    try { parent.postMessage({ type: 'sdp-click' }, '*'); } catch (e) {}
  });
  function canScroll(el, dy){
    if (!el) return false;
    var max = el.scrollHeight - el.clientHeight;
    if (max <= 1) return false;
    return dy > 0 ? el.scrollTop < max - 1 : el.scrollTop > 1;
  }
  window.addEventListener('wheel', function(event){
    var dy = event.deltaY || 0;
    if (!dy) return;
    // 复习舞台把 iframe 高度设成内容高度，文档自身滚不动，而 WebKit 不会把 iframe
    // 里的滚轮链回宿主卡片的统一 viewport（宿主因此收不到滚轮，长卡面只能拖滚动条）。
    // 这里把「文档自己滚不动」的滚轮转发给宿主；文档还能滚时保持原生滚动，避免双滚。
    if (canScroll(document.body, dy) || canScroll(document.documentElement, dy)) return;
    try { parent.postMessage({ type: 'sdp-wheel', deltaY: dy, deltaMode: event.deltaMode || 0 }, '*'); } catch (e) {}
  }, { passive: true });
})();<\/script>`;function pt(t=document){t.querySelectorAll("iframe").forEach(s=>{try{s.contentWindow?.postMessage({type:"sdp-replay-audio"},"*")}catch{}});const i=Array.from(t.querySelectorAll("audio.anki-audio"));if(i.length===0)return;i.forEach(s=>{try{s.pause()}catch{}});const e=s=>{if(s>=i.length)return;const n=i[s];n.onended=()=>e(s+1);try{n.currentTime=0;const a=n.play();a&&typeof a.catch=="function"&&a.catch(()=>{})}catch{}};e(0)}const X=G.replace(/^<script>/,"").replace(/<\/script>$/,""),K=/^(?:data:image\/|blob:|https:)/i,Y=/^(?:data:|blob:|https:)/i,V=`<script>
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
  function sdpNotify() {
    var h = sdpMeasure();
    if (h > 0) window.parent.postMessage({ type: 'sdp-resize', height: h }, '*');
  }
  var sdpRo = new ResizeObserver(sdpNotify);
  sdpRo.observe(document.documentElement);
  function sdpWatchBody() {
    if (document.body) sdpRo.observe(document.body);
    var imgs = document.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      if (!img.complete) {
        img.addEventListener('load', sdpNotify, { once: true });
        img.addEventListener('error', sdpNotify, { once: true });
      }
      if (typeof img.decode === 'function') {
        img.decode().then(sdpNotify, sdpNotify);
      }
    }
    sdpNotify();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sdpWatchBody, { once: true });
  } else {
    sdpWatchBody();
  }
  window.addEventListener('load', sdpNotify);
<\/script>`;function Q(t){return t.replace(/\/\*[\s\S]*?\*\//g,"")}function mt(t,i){if(!t)return"";let e=Q(t);return e=e.replace(/\\[0-9a-fA-F]{1,6}\s?/g,"_"),e=e.replace(/<\s*\/\s*style/gi,"<\\/style"),e=e.replace(/@import\s+[^;]+;?/gi,""),e=e.replace(/@charset\s+[^;]+;?/gi,""),e=e.replace(/@font-face\s*\{[^}]*\}/gi,""),e=e.replace(/expression\s*\(/gi,""),e=e.replace(/behavior\s*:/gi,"blocked-behavior:"),e=e.replace(/-moz-binding\s*:/gi,"blocked-moz-binding:"),e=e.replace(/javascript\s*:/gi,"blocked-javascript:"),e=e.replace(/url\s*\(\s*(['"]?)\s*(.*?)\s*\1\s*\)/gi,(s,n,a)=>String(a).trim().toLowerCase().startsWith("data:image/")?`url(${n}${a}${n})`:`url(${n}blocked${n})`),e}function gt(t,i){if(!t)return"";const e=/^\s*(<!doctype|<html[\s>])/i.test(t.trim()),s=a=>{const r=a.tagName;if(r==="IMG"&&a.hasAttribute("src")){const o=(a.getAttribute("src")??"").trim();K.test(o)||(a.setAttribute("src",L),i==="template-safe"&&(a.setAttribute("data-anki-media-pending","1"),o&&!a.hasAttribute("data-anki-media-ref")&&a.setAttribute("data-anki-media-ref",o)))}else if((r==="AUDIO"||r==="VIDEO"||r==="SOURCE")&&a.hasAttribute("src")){const o=(a.getAttribute("src")??"").trim();Y.test(o)||(a.removeAttribute("src"),i==="template-safe"&&(a.setAttribute("data-anki-media-pending","1"),o&&!a.hasAttribute("data-anki-media-ref")&&a.setAttribute("data-anki-media-ref",o)))}};if(i==="template-safe"){const a=(r,o)=>{o.tagName==="script"&&r.textContent!==X&&r.remove()};g.addHook("uponSanitizeElement",a),g.addHook("afterSanitizeAttributes",s);try{return g.sanitize(t,{WHOLE_DOCUMENT:e,ADD_TAGS:["style","meta","script"],ADD_ATTR:["onclick"],FORBID_TAGS:["iframe","embed","object","form","base"],FORBID_ATTR:["onerror","onload","onmouseover","onfocus","onblur"],ALLOW_DATA_ATTR:!0})}finally{g.removeHook("uponSanitizeElement",a),g.removeHook("afterSanitizeAttributes",s)}}const n=t.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,"").replace(/<script\b[\s\S]*$/i,"");g.addHook("afterSanitizeAttributes",s);try{return g.sanitize(n,{WHOLE_DOCUMENT:e,ADD_TAGS:["style","meta"],FORBID_TAGS:["script","iframe","embed","object","form","base","link"],FORBID_ATTR:["onerror","onload","onclick","onmouseover","onfocus","onblur"],ALLOW_DATA_ATTR:!1})}finally{g.removeHook("afterSanitizeAttributes",s)}}function bt(t){return t==="template-safe"?"allow-scripts":""}function Z(t){return t==="template-safe"?["default-src 'none'","img-src data: blob: https:","media-src data: blob: https:","style-src 'unsafe-inline'","font-src data:","connect-src 'none'","script-src 'unsafe-inline'","frame-src 'none'","object-src 'none'","base-uri 'none'","form-action 'none'"].join("; "):["default-src 'none'","img-src data: blob: https:","media-src data: blob: https:","style-src 'unsafe-inline'","font-src data:","connect-src 'none'","script-src 'none'","frame-src 'none'","object-src 'none'","base-uri 'none'","form-action 'none'"].join("; ")}function ht({html:t,css:i,mode:e,compact:s=!1,fidelity:n="default",darkMode:a=!1,trustedCss:r=""}){const o=n==="anki",c=o||e==="chat-safe"?t:`<div class="card-content-container">${t}</div>`,l=e==="template-safe"?V:"",y=Z(e),f=[];o&&f.push("card"),a&&f.push("nightMode","night_mode");const d=f.length>0?` class="${f.join(" ")}"`:"",h=a?"#14161a":"white";return`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${y}">
${r?`<style>${r.replace(/<\s*\/\s*style/gi,"<\\/style")}</style>
`:""}<style>
  :root {
    ${a?`color-scheme: dark;
    `:""}--preview-scrollbar-thumb: color-mix(in srgb, CanvasText 28%, transparent);
    --preview-scrollbar-track: transparent;
  }
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    background: ${s||o?"transparent":h};
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
    background: ${s?"transparent":h};
    border-radius: ${s?"0":"16px"};
    padding: ${s?"4px":"20px"};
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
  ${i}
</style>
${l}
</head>
<body${d}>
${c}
</body>
</html>`}export{G as C,bt as a,ht as b,nt as c,q as d,rt as e,it as f,Z as g,ut as h,lt as i,st as j,D as k,ft as l,m,gt as n,dt as o,ot as p,pt as r,mt as s,ct as u};
