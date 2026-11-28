import{f as r,j as u}from"./vendor-react-CK9Q3ZQe.js";import{r as te}from"./vendor-docx-CV-TY9-w.js";import{i5 as re,gH as oe,j as ne,bL as ae}from"./ui-boot-D3Jplikg.js";import{S as se}from"./Skeleton-DVcxRk7X.js";import{n as ce,w as ie,f as le}from"./previewUtils-XhCmziuZ.js";import{i as de}from"./officeZipContainer-D574AL58.js";import{s as ue}from"./sanitizeRenderedDom-BG85uIwo.js";import{u as fe}from"./vendor-i18n-CxOtV7Ik.js";const pe=".docx-content-wrapper";function Y(s,a,f){const l=[];for(const m of Array.from(s)){const o=m.toLowerCase();let n=s.getPropertyValue(m).trim();if(!n||o==="behavior"||o==="-moz-binding"||/expression\s*\(|javascript\s*:/i.test(n)||/url\s*\(/i.test(n)&&(!a||!/url\(\s*["']?(?:data:(?:font\/|application\/(?:x-)?font|application\/octet-stream)|blob:)/i.test(n)))continue;f&&o==="font-size"&&!n.includes(f)&&(n=`calc(${n} * var(${f}, 1))`);const c=s.getPropertyPriority(m);l.push(`${m}: ${n}${c?` !${c}`:""};`)}return l.join(" ")}function me(s){try{const l=new CSSStyleSheet;if(l.replaceSync(s),l.cssRules.length)return Array.from(l.cssRules)}catch{}try{const l=document.implementation.createHTMLDocument(""),m=l.createElement("style");m.textContent=s,l.head.append(m);const o=m.sheet?.cssRules;if(o?.length)return Array.from(o)}catch{}const a=document.createElement("style");a.media="not all",a.textContent=s,document.head.append(a);const f=a.sheet?.cssRules?Array.from(a.sheet.cssRules):[];return a.remove(),f}function xe(s,a={}){const f=a.scope??pe,l=[];for(const m of Array.from(s.querySelectorAll("style"))){const o=me(m.textContent??"");if(!o.length)continue;const n=[];for(const c of o)if(c.type===CSSRule.STYLE_RULE){const v=c,D=Y(v.style,!1,a.fontScaleVar);if(!D)continue;const y=v.selectorText.split(",").map(E=>E.trim()).filter(Boolean).map(E=>`${f} ${E}`);y.length&&n.push(`${y.join(", ")} { ${D} }`)}else if(c.type===CSSRule.FONT_FACE_RULE){const v=Y(c.style,!0);v&&n.push(`@font-face { ${v} }`)}if(n.length){const c=document.createElement("style");c.textContent=n.join(`
`),l.push(c)}}return l}const Z=/end of central directory|corrupted zip|corrupt|invalid signature|bad compressed|unexpected eof|invalid stored block|invalid distance|invalid literal|unknown compression/i,L="--docx-font-scale",he=32,we=28,be=12,ge=16;function ve(s){for(const a of Array.from(s.querySelectorAll('[style*="font-size"]'))){const f=a.style.fontSize;!f||f.includes(L)||(a.style.fontSize=`calc(${f} * var(${L}, 1))`)}}const ye=["w-3/5","w-full","w-full","w-11/12","w-full","w-4/5","w-full","w-2/3","w-full","w-full","w-5/6","w-1/2"],Ne=({base64Content:s,fileName:a,className:f="",zoomScale:l,fontScale:m})=>{const{t:o}=fe(["learningHub"]),n=re(),c=n?be:he,v=n?ge:we,D=r.useRef(c);D.current=c;const y=r.useRef(null),E=r.useRef(null),$=r.useRef(null),S=r.useRef(0),[k,z]=r.useState(!0),[g,C]=r.useState(null),[N,M]=r.useState(1),[T,j]=r.useState({current:1,total:0}),[O,_]=r.useState(!1),I=r.useRef(void 0),F=r.useId(),B=r.useMemo(()=>`docx-${F.replace(/[^a-zA-Z0-9_-]/g,"")}`,[F]),h=`[data-docx-instance="${B}"]`,K=l??1,W=m??1,Q=r.useMemo(()=>Number((N*K).toFixed(3)),[N,K]),X=r.useMemo(()=>!n||N>=.7?1:Math.min(1.6,Number(Math.sqrt(.7/N).toFixed(3))),[n,N]),J=r.useMemo(()=>Number((W*X).toFixed(3)),[W,X]);r.useEffect(()=>{if(!y.current)return;let t=!0;const e=++S.current,i=y.current,d=E.current;return(async()=>{z(!0),C(null),j({current:1,total:0});try{M(1);const p=ce(s);if(!p){t&&e===S.current&&(C(o("learningHub:docPreview.emptyContent")),z(!1));return}if(await ie(),!t||e!==S.current)return;const x=le(p),{issue:b,normalizedBuffer:A}=de(x);if(b){t&&e===S.current&&(C(o(b==="encrypted-or-legacy"?"learningHub:officePreview.encryptedOrLegacy":b==="truncated"?"learningHub:officePreview.corruptedOrTruncated":"learningHub:officePreview.invalidFormat")),z(!1));return}if(!t||e!==S.current)return;i.innerHTML="",d&&(d.innerHTML="");const P=document.createElement("div"),H=document.createElement("div");await te(A,P,H,{className:"docx-preview",inWrapper:!0,ignoreWidth:!1,ignoreHeight:!0,ignoreFonts:!1,breakPages:!0,ignoreLastRenderedPageBreak:!0,experimental:!1,trimXmlDeclaration:!0,useBase64URL:!0,renderHeaders:!0,renderFooters:!0,renderFootnotes:!0,renderEndnotes:!0,renderComments:!0,debug:!1}),t&&e===S.current&&(ue(P),ve(P),i.replaceChildren(...Array.from(P.childNodes)),d&&d.replaceChildren(...xe(H,{scope:h,fontScaleVar:L})),z(!1))}catch(p){const x=p instanceof Error?p.message:"";if(Z.test(x)?ae.warn("DOCX container unreadable:",x):console.error("Failed to render DOCX:",p),t&&e===S.current){i.innerHTML="";const b=Z.test(x)?o("learningHub:officePreview.corruptedOrTruncated"):x||o("learningHub:docPreview.renderDocxFailed");C(b),z(!1)}}})(),()=>{t=!1,S.current+=1,i.innerHTML="",d&&(d.innerHTML="")}},[s]),r.useEffect(()=>{const t=y.current;if(!t)return;let e=0,i=0,d=null,w=null,p=null;const x=()=>t.querySelector(".docx-preview-wrapper")??t.querySelector(".docx-wrapper"),b=()=>{const H=$.current,R=x();if(!H||!R)return;w&&R!==d&&(d&&w.unobserve(d),w.observe(R),d=R);const q=H.clientWidth-D.current*2,U=R.scrollWidth||R.clientWidth;if(q<=0||!U)return;const G=Math.min(1,q/U);M(V=>Math.abs(V-G)<.01?V:Number(G.toFixed(3)))},A=()=>{e&&cancelAnimationFrame(e),e=requestAnimationFrame(b)},P=()=>{window.clearTimeout(i),i=window.setTimeout(A,150)};return p=new MutationObserver(P),p.observe(t,{childList:!0,subtree:!0}),w=new ResizeObserver(A),$.current&&w.observe($.current),A(),()=>{e&&cancelAnimationFrame(e),window.clearTimeout(i),w?.disconnect(),p?.disconnect()}},[s,c]),r.useEffect(()=>{if(k||g)return;const t=y.current,e=$.current;if(!t||!e)return;const i=Array.from(t.querySelectorAll("section.docx-preview, section.docx"));if(j({current:1,total:i.length}),i.length<2)return;const d=new IntersectionObserver(w=>{for(const p of w){if(!p.isIntersecting)continue;const x=i.indexOf(p.target);x<0||j(b=>b.current===x+1?b:{...b,current:x+1})}},{root:e,rootMargin:"-45% 0px -45% 0px",threshold:0});return i.forEach(w=>d.observe(w)),()=>d.disconnect()},[k,g,s]),r.useEffect(()=>{if(!(k||g||T.total<=1))return _(!0),window.clearTimeout(I.current),I.current=window.setTimeout(()=>_(!1),1600),()=>window.clearTimeout(I.current)},[T,k,g]);const ee=t=>{const e=$.current;if(!e||t.ctrlKey||t.metaKey||t.altKey)return;const i=e.clientHeight*.9;switch(t.key){case"PageDown":e.scrollBy({top:i,behavior:"smooth"});break;case"PageUp":e.scrollBy({top:-i,behavior:"smooth"});break;case"Home":e.scrollTo({top:0,behavior:"smooth"});break;case"End":e.scrollTo({top:e.scrollHeight,behavior:"smooth"});break;default:return}t.preventDefault()};return u.jsxs("div",{className:`relative min-h-0 overflow-hidden ${f}`,"data-docx-instance":B,"aria-busy":k&&!g,tabIndex:0,onKeyDown:ee,children:[k&&!g&&u.jsx("div",{className:"absolute inset-0 z-10 flex justify-center overflow-hidden",style:{background:"var(--docx-desk)",padding:`${v}px ${c}px 0`},role:"status","aria-label":o("learningHub:docPreview.loadingDocument"),children:u.jsx("div",{className:"flex aspect-[210/297] w-full max-w-[794px] flex-col gap-3 rounded-[2px] px-10 py-12",style:{background:"var(--docx-paper)",boxShadow:"var(--docx-page-shadow)"},"aria-hidden":"true",children:ye.map((t,e)=>u.jsx(se,{className:`${e===0?"mb-3 h-5":"h-3"} ${t}`},e))})}),g&&u.jsx("div",{className:"absolute inset-0 z-10 flex items-center justify-center p-8",style:{background:"var(--docx-desk)"},role:"alert",children:u.jsxs("div",{className:"flex max-w-sm flex-col items-center gap-2 text-center",children:[u.jsx(oe,{size:40,weight:"thin",className:"mb-1 text-muted-foreground","aria-hidden":"true"}),u.jsx("p",{className:"text-sm font-medium text-foreground",children:o("learningHub:docPreview.cannotPreviewDoc")}),u.jsx("p",{className:"text-xs text-muted-foreground",children:g})]})}),u.jsx("div",{ref:E,"aria-hidden":"true"}),u.jsx(ne,{className:"docx-container h-full min-h-0",orientation:"both",viewportRef:$,children:u.jsx("div",{ref:y,className:`docx-content-wrapper${!k&&!g?" ui-rise-in":""}`,"aria-label":a?o("learningHub:docPreview.docxPreviewLabel",{name:a}):o("learningHub:docPreview.docxPreviewDefault"),style:{"--docx-scale":Q.toString(),[L]:J.toString()}})}),!k&&!g&&T.total>1&&u.jsx("div",{"data-wb-blur-surface":!0,className:`pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-border bg-background/90 px-3 py-1 text-xs tabular-nums text-muted-foreground shadow-sm backdrop-blur-sm transition-opacity duration-150 ${O?"opacity-100":"opacity-0"}`,"aria-hidden":!O,children:o("learningHub:docPreview.pageIndicator",{current:T.current,total:T.total})}),u.jsx("style",{children:`
        /* ============ 台面 / 纸面 / 墨色（语义变量组合，无硬编码色值） ============
           暗色模式沿用 Word 网页版与 macOS Quick Look 的策略：纸面保持浅色，
           文档原有的彩色文字、品牌色、高亮不做任何重写，保真且天然可读 */
        ${h} {
          --docx-desk: hsl(var(--muted));
          --docx-paper: hsl(var(--background));
          --docx-ink: hsl(var(--foreground));
          --docx-page-shadow:
            0 1px 2px hsl(var(--foreground) / 0.08),
            0 8px 24px hsl(var(--foreground) / 0.08);
          background: var(--docx-desk);
        }
        :root.dark ${h} {
          --docx-desk: hsl(var(--card));
          --docx-paper: hsl(var(--foreground));
          --docx-ink: hsl(var(--background));
          --docx-page-shadow:
            0 1px 3px hsl(var(--background) / 0.7),
            0 10px 28px hsl(var(--background) / 0.55);
        }

        /* 内容容器：台面留白 + 水平居中 */
        ${h} .docx-content-wrapper {
          min-height: 200px;
          overflow: visible;
          width: max-content;
          margin: 0 auto;
          padding: ${v}px ${c}px;
        }

        /* docx-preview 外层包装（可能带内联 padding）
           注意：docx-preview 库根据 className 配置生成 .{className}-wrapper，
           当前配置 className='docx-preview' → 生成 .docx-preview-wrapper
           同时兼容默认的 .docx-wrapper 以防配置变化

           缩放使用 zoom 而非 transform:scale——zoom 参与布局，
           垂直/水平滚动范围随缩放同步变化，不会出现
           缩小后残留空白滚动区域、放大后底部内容无法滚动到的问题 */
        ${h} .docx-preview-wrapper,
        ${h} .docx-wrapper {
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
        ${h} .docx-preview-wrapper > section.docx-preview,
        ${h} .docx-wrapper > section.docx {
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
        ${h} :where(section.docx-preview, section.docx) {
          color: var(--docx-ink);
          font-size: calc(12pt * var(${L}, 1));
        }

        /* 图片安全约束：不超出纸面（文档内显式尺寸仍然生效） */
        ${h} :where(section.docx-preview, section.docx) img {
          max-width: 100%;
          height: auto;
        }

        /* 被安全策略拦截的链接：明确的禁用观感 */
        ${h} a[data-blocked] {
          text-decoration: line-through;
        }
      `})]})};export{Ne as DocxPreview,Ne as default};
