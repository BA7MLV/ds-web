import{f as o,j as u}from"./vendor-react-CK9Q3ZQe.js";import{r as ee}from"./vendor-docx-CV-TY9-w.js";import{s as te}from"./FileX.es-CVMgPFlG.js";import{C as re}from"./custom-scroll-area-Dq46hhq4.js";import{S as oe}from"./Skeleton-BKYxH1II.js";import{a as ne}from"./useBreakpoint-Cu8cLYg8.js";import{n as ae,w as se,f as ce}from"./previewUtils-DdkQNf3r.js";import{s as ie}from"./sanitizeRenderedDom-DyD-3O9N.js";import{u as le}from"./vendor-i18n-CxOtV7Ik.js";const de=".docx-content-wrapper";function V(n,e,f){const l=[];for(const m of Array.from(n)){const a=m.toLowerCase();let s=n.getPropertyValue(m).trim();if(!s||a==="behavior"||a==="-moz-binding"||/expression\s*\(|javascript\s*:/i.test(s)||/url\s*\(/i.test(s)&&(!e||!/url\(\s*["']?(?:data:(?:font\/|application\/(?:x-)?font|application\/octet-stream)|blob:)/i.test(s)))continue;f&&a==="font-size"&&!s.includes(f)&&(s=`calc(${s} * var(${f}, 1))`);const c=n.getPropertyPriority(m);l.push(`${m}: ${s}${c?` !${c}`:""};`)}return l.join(" ")}function ue(n){try{const l=new CSSStyleSheet;if(l.replaceSync(n),l.cssRules.length)return Array.from(l.cssRules)}catch{}try{const l=document.implementation.createHTMLDocument(""),m=l.createElement("style");m.textContent=n,l.head.append(m);const a=m.sheet?.cssRules;if(a?.length)return Array.from(a)}catch{}const e=document.createElement("style");e.media="not all",e.textContent=n,document.head.append(e);const f=e.sheet?.cssRules?Array.from(e.sheet.cssRules):[];return e.remove(),f}function fe(n,e={}){const f=e.scope??de,l=[];for(const m of Array.from(n.querySelectorAll("style"))){const a=ue(m.textContent??"");if(!a.length)continue;const s=[];for(const c of a)if(c.type===CSSRule.STYLE_RULE){const b=c,R=V(b.style,!1,e.fontScaleVar);if(!R)continue;const v=b.selectorText.split(",").map(E=>E.trim()).filter(Boolean).map(E=>`${f} ${E}`);v.length&&s.push(`${v.join(", ")} { ${R} }`)}else if(c.type===CSSRule.FONT_FACE_RULE){const b=V(c.style,!0);b&&s.push(`@font-face { ${b} }`)}if(s.length){const c=document.createElement("style");c.textContent=s.join(`
`),l.push(c)}}return l}function pe(n){const e=new Uint8Array(n);return e.length>=2&&e[0]===80&&e[1]===75?null:e.length>=4&&e[0]===208&&e[1]===207&&e[2]===17&&e[3]===224?"encrypted-or-legacy":"invalid"}const T="--docx-font-scale",me=32,xe=28,he=12,we=16;function ge(n){for(const e of Array.from(n.querySelectorAll('[style*="font-size"]'))){const f=e.style.fontSize;!f||f.includes(T)||(e.style.fontSize=`calc(${f} * var(${T}, 1))`)}}const be=["w-3/5","w-full","w-full","w-11/12","w-full","w-4/5","w-full","w-2/3","w-full","w-full","w-5/6","w-1/2"],Ne=({base64Content:n,fileName:e,className:f="",zoomScale:l,fontScale:m})=>{const{t:a}=le(["learningHub"]),s=ne(),c=s?he:me,b=s?we:xe,R=o.useRef(c);R.current=c;const v=o.useRef(null),E=o.useRef(null),D=o.useRef(null),y=o.useRef(0),[S,N]=o.useState(!0),[w,L]=o.useState(null),[A,I]=o.useState(1),[z,j]=o.useState({current:1,total:0}),[F,M]=o.useState(!1),H=o.useRef(void 0),_=o.useId(),O=o.useMemo(()=>`docx-${_.replace(/[^a-zA-Z0-9_-]/g,"")}`,[_]),x=`[data-docx-instance="${O}"]`,B=l??1,K=m??1,Q=o.useMemo(()=>Number((A*B).toFixed(3)),[A,B]),W=o.useMemo(()=>!s||A>=.7?1:Math.min(1.6,Number(Math.sqrt(.7/A).toFixed(3))),[s,A]),Z=o.useMemo(()=>Number((K*W).toFixed(3)),[K,W]);o.useEffect(()=>{if(!v.current)return;let r=!0;const t=++y.current,i=v.current,d=E.current;return(async()=>{N(!0),L(null),j({current:1,total:0});try{I(1);const p=ae(n);if(!p){r&&t===y.current&&(L(a("learningHub:docPreview.emptyContent")),N(!1));return}if(await se(),!r||t!==y.current)return;const g=ce(p),k=pe(g);if(k){r&&t===y.current&&(L(a(k==="encrypted-or-legacy"?"learningHub:officePreview.encryptedOrLegacy":"learningHub:officePreview.invalidFormat")),N(!1));return}if(!r||t!==y.current)return;i.innerHTML="",d&&(d.innerHTML="");const $=document.createElement("div"),C=document.createElement("div");await ee(g,$,C,{className:"docx-preview",inWrapper:!0,ignoreWidth:!1,ignoreHeight:!0,ignoreFonts:!1,breakPages:!0,ignoreLastRenderedPageBreak:!0,experimental:!1,trimXmlDeclaration:!0,useBase64URL:!0,renderHeaders:!0,renderFooters:!0,renderFootnotes:!0,renderEndnotes:!0,renderComments:!0,debug:!1}),r&&t===y.current&&(ie($),ge($),i.replaceChildren(...Array.from($.childNodes)),d&&d.replaceChildren(...fe(C,{scope:x,fontScaleVar:T})),N(!1))}catch(p){if(console.error("Failed to render DOCX:",p),r&&t===y.current){i.innerHTML="";const g=p instanceof Error?p.message:a("learningHub:docPreview.renderDocxFailed");L(g),N(!1)}}})(),()=>{r=!1,y.current+=1,i.innerHTML="",d&&(d.innerHTML="")}},[n]),o.useEffect(()=>{const r=v.current;if(!r)return;let t=0,i=0,d=null,h=null,p=null;const g=()=>r.querySelector(".docx-preview-wrapper")??r.querySelector(".docx-wrapper"),k=()=>{const q=D.current,P=g();if(!q||!P)return;h&&P!==d&&(d&&h.unobserve(d),h.observe(P),d=P);const X=q.clientWidth-R.current*2,U=P.scrollWidth||P.clientWidth;if(X<=0||!U)return;const G=Math.min(1,X/U);I(Y=>Math.abs(Y-G)<.01?Y:Number(G.toFixed(3)))},$=()=>{t&&cancelAnimationFrame(t),t=requestAnimationFrame(k)},C=()=>{window.clearTimeout(i),i=window.setTimeout($,150)};return p=new MutationObserver(C),p.observe(r,{childList:!0,subtree:!0}),h=new ResizeObserver($),D.current&&h.observe(D.current),$(),()=>{t&&cancelAnimationFrame(t),window.clearTimeout(i),h?.disconnect(),p?.disconnect()}},[n,c]),o.useEffect(()=>{if(S||w)return;const r=v.current,t=D.current;if(!r||!t)return;const i=Array.from(r.querySelectorAll("section.docx-preview, section.docx"));if(j({current:1,total:i.length}),i.length<2)return;const d=new IntersectionObserver(h=>{for(const p of h){if(!p.isIntersecting)continue;const g=i.indexOf(p.target);g<0||j(k=>k.current===g+1?k:{...k,current:g+1})}},{root:t,rootMargin:"-45% 0px -45% 0px",threshold:0});return i.forEach(h=>d.observe(h)),()=>d.disconnect()},[S,w,n]),o.useEffect(()=>{if(!(S||w||z.total<=1))return M(!0),window.clearTimeout(H.current),H.current=window.setTimeout(()=>M(!1),1600),()=>window.clearTimeout(H.current)},[z,S,w]);const J=r=>{const t=D.current;if(!t||r.ctrlKey||r.metaKey||r.altKey)return;const i=t.clientHeight*.9;switch(r.key){case"PageDown":t.scrollBy({top:i,behavior:"smooth"});break;case"PageUp":t.scrollBy({top:-i,behavior:"smooth"});break;case"Home":t.scrollTo({top:0,behavior:"smooth"});break;case"End":t.scrollTo({top:t.scrollHeight,behavior:"smooth"});break;default:return}r.preventDefault()};return u.jsxs("div",{className:`relative min-h-0 overflow-hidden ${f}`,"data-docx-instance":O,"aria-busy":S&&!w,tabIndex:0,onKeyDown:J,children:[S&&!w&&u.jsx("div",{className:"absolute inset-0 z-10 flex justify-center overflow-hidden",style:{background:"var(--docx-desk)",padding:`${b}px ${c}px 0`},role:"status","aria-label":a("learningHub:docPreview.loadingDocument"),children:u.jsx("div",{className:"flex aspect-[210/297] w-full max-w-[794px] flex-col gap-3 rounded-[2px] px-10 py-12",style:{background:"var(--docx-paper)",boxShadow:"var(--docx-page-shadow)"},"aria-hidden":"true",children:be.map((r,t)=>u.jsx(oe,{className:`${t===0?"mb-3 h-5":"h-3"} ${r}`},t))})}),w&&u.jsx("div",{className:"absolute inset-0 z-10 flex items-center justify-center p-8",style:{background:"var(--docx-desk)"},role:"alert",children:u.jsxs("div",{className:"flex max-w-sm flex-col items-center gap-2 text-center",children:[u.jsx(te,{size:40,weight:"thin",className:"mb-1 text-muted-foreground","aria-hidden":"true"}),u.jsx("p",{className:"text-sm font-medium text-foreground",children:a("learningHub:docPreview.cannotPreviewDoc")}),u.jsx("p",{className:"text-xs text-muted-foreground",children:w})]})}),u.jsx("div",{ref:E,"aria-hidden":"true"}),u.jsx(re,{className:"docx-container h-full min-h-0",orientation:"both",viewportRef:D,children:u.jsx("div",{ref:v,className:`docx-content-wrapper${!S&&!w?" ui-rise-in":""}`,"aria-label":e?a("learningHub:docPreview.docxPreviewLabel",{name:e}):a("learningHub:docPreview.docxPreviewDefault"),style:{"--docx-scale":Q.toString(),[T]:Z.toString()}})}),!S&&!w&&z.total>1&&u.jsx("div",{"data-wb-blur-surface":!0,className:`pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-border bg-background/90 px-3 py-1 text-xs tabular-nums text-muted-foreground shadow-sm backdrop-blur-sm transition-opacity duration-150 ${F?"opacity-100":"opacity-0"}`,"aria-hidden":!F,children:a("learningHub:docPreview.pageIndicator",{current:z.current,total:z.total})}),u.jsx("style",{children:`
        /* ============ 台面 / 纸面 / 墨色（语义变量组合，无硬编码色值） ============
           暗色模式沿用 Word 网页版与 macOS Quick Look 的策略：纸面保持浅色，
           文档原有的彩色文字、品牌色、高亮不做任何重写，保真且天然可读 */
        ${x} {
          --docx-desk: hsl(var(--muted));
          --docx-paper: hsl(var(--background));
          --docx-ink: hsl(var(--foreground));
          --docx-page-shadow:
            0 1px 2px hsl(var(--foreground) / 0.08),
            0 8px 24px hsl(var(--foreground) / 0.08);
          background: var(--docx-desk);
        }
        :root.dark ${x} {
          --docx-desk: hsl(var(--card));
          --docx-paper: hsl(var(--foreground));
          --docx-ink: hsl(var(--background));
          --docx-page-shadow:
            0 1px 3px hsl(var(--background) / 0.7),
            0 10px 28px hsl(var(--background) / 0.55);
        }

        /* 内容容器：台面留白 + 水平居中 */
        ${x} .docx-content-wrapper {
          min-height: 200px;
          overflow: visible;
          width: max-content;
          margin: 0 auto;
          padding: ${b}px ${c}px;
        }

        /* docx-preview 外层包装（可能带内联 padding）
           注意：docx-preview 库根据 className 配置生成 .{className}-wrapper，
           当前配置 className='docx-preview' → 生成 .docx-preview-wrapper
           同时兼容默认的 .docx-wrapper 以防配置变化

           缩放使用 zoom 而非 transform:scale——zoom 参与布局，
           垂直/水平滚动范围随缩放同步变化，不会出现
           缩小后残留空白滚动区域、放大后底部内容无法滚动到的问题 */
        ${x} .docx-preview-wrapper,
        ${x} .docx-wrapper {
          padding: 0 !important;
          margin: 0;
          background: transparent !important;
          box-shadow: none !important;
          width: max-content;
          max-width: none;
          box-sizing: border-box;
          overflow: visible;
          zoom: var(--docx-scale, 1);
        }

        /* 页面分节 = 一张白纸：柔和投影 + 页间距 + 渐进渲染
           （content-visibility 让离屏页面跳过排版渲染，大文档滚动丝滑；
           选择器特异度需压过库注入的默认 section 样式，保证暗色纸面生效） */
        ${x} .docx-preview-wrapper > section.docx-preview,
        ${x} .docx-wrapper > section.docx {
          background: var(--docx-paper);
          box-shadow: var(--docx-page-shadow);
          border: none;
          border-radius: 2px;
          margin-bottom: 28px;
          box-sizing: border-box;
          overflow-wrap: break-word;
          content-visibility: auto;
          contain-intrinsic-size: auto 794px auto 1123px;
        }

        /* 默认墨色与基准字号：:where() 保持零特异度，
           任何文档自带的颜色/字号规则（生成样式、内联样式）都优先生效——
           这是"亮色保留原色、字号不抹平层级"的关键 */
        ${x} :where(section.docx-preview, section.docx) {
          color: var(--docx-ink);
          font-size: calc(12pt * var(${T}, 1));
        }

        /* 图片安全约束：不超出纸面（文档内显式尺寸仍然生效） */
        ${x} :where(section.docx-preview, section.docx) img {
          max-width: 100%;
          height: auto;
        }

        /* 被安全策略拦截的链接：明确的禁用观感 */
        ${x} a[data-blocked] {
          text-decoration: line-through;
        }
      `})]})};export{Ne as DocxPreview,Ne as default};
