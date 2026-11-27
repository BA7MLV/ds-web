import{f as t,j as s}from"./vendor-react-CK9Q3ZQe.js";import{x as ce}from"./vendor-pptx-BatiBamA.js";import{j as ee,bL as le}from"./ui-boot-Cr8X9_oz.js";import{S as ue}from"./Skeleton-Cx-SLdlR.js";import{n as de,w as re,f as pe}from"./previewUtils-Br-wrrMW.js";import{s as fe}from"./sanitizeRenderedDom-BG85uIwo.js";import{u as me}from"./vendor-i18n-CxOtV7Ik.js";const W=".pptx-preview-slide-wrapper",U=104,he=1400,xe=160,te=()=>typeof window<"u"&&!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,V=22,we=65535,be=/end of central directory|corrupted zip|invalid zip|unexpected end|bad archive|invalid signature|not a valid|malformed|truncated|xml|invalid (?:block|stored|distance|code|bit|literal)|incorrect (?:header|data) check|unknown compression|uncompressed data size mismatch|data size mismatch|crc|deflate|inflate/i;function ve(n){if(n.length<V||n[0]!==80||n[1]!==75||n[2]!==3||n[3]!==4)return!1;const i=new DataView(n.buffer,n.byteOffset,n.byteLength),x=Math.max(0,n.length-(V+we));for(let c=n.length-V;c>=x;c-=1)if(n[c]===80&&n[c+1]===75&&n[c+2]===5&&n[c+3]===6){const w=i.getUint16(c+20,!0);if(c+V+w!==n.length)continue;const l=i.getUint32(c+12,!0),a=i.getUint32(c+16,!0);return l===4294967295||a===4294967295?!0:!(a+l>c||l>0&&(n[a]!==80||n[a+1]!==75||n[a+2]!==1||n[a+3]!==2))}return!1}function ge(n){const i=new Uint8Array(n);return i.length>=4&&i[0]===208&&i[1]===207&&i[2]===17&&i[3]===224?"encrypted-or-legacy":i.length>=2&&i[0]===80&&i[1]===75?ve(i)?null:"truncated":"invalid"}const Te="160px 0px",Re=({index:n,isActive:i,meta:x,cloneSlide:c,onSelect:w,label:l})=>{const a=t.useRef(null),b=t.useRef(null),[f,O]=t.useState(!1),E=x?.width||960,$=x?Math.max(1,Math.round(U/x.width*x.height)):Math.round(U*9/16);return t.useEffect(()=>{const v=a.current;if(!v)return;const d=new IntersectionObserver(T=>{for(const P of T)O(P.isIntersecting)},{rootMargin:Te});return d.observe(v),()=>d.disconnect()},[]),t.useEffect(()=>{const v=b.current;if(!v||(v.replaceChildren(),!f||!x))return;const d=c(n);if(!d)return;const T=U/E;return d.style.position="absolute",d.style.top="0",d.style.left="0",d.style.transform=`scale(${T})`,d.style.transformOrigin="top left",v.appendChild(d),()=>{v.replaceChildren()}},[f,x,n,c,E]),t.useEffect(()=>{i&&a.current?.scrollIntoView({block:"nearest",behavior:te()?"auto":"smooth"})},[i]),s.jsxs("button",{ref:a,type:"button",onClick:()=>w(n),"aria-label":l,"aria-current":i?"true":void 0,className:`group relative shrink-0 self-center overflow-hidden rounded-md border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background [@media(pointer:coarse)]:inline-flex [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:items-center [@media(pointer:coarse)]:justify-center ${i?"border-primary shadow-sm ring-1 ring-primary":"border-border/60 hover:border-border hover:shadow-sm"}`,children:[s.jsx("div",{ref:b,"aria-hidden":!0,className:"pptx-thumb-canvas relative overflow-hidden bg-white",style:{width:U,height:$}}),s.jsx("span",{"aria-hidden":!0,className:`absolute left-1 top-1 rounded px-1 text-2xs font-medium leading-4 tabular-nums shadow-sm transition-colors duration-150 ${i?"bg-primary text-primary-foreground":"bg-background/85 text-muted-foreground"}`,children:n+1})]})},Ne=({base64Content:n,fileName:i,className:x="",zoomScale:c,onSlideInfoChange:w})=>{const{t:l}=me(["learningHub"]),a=t.useRef(null),b=t.useRef(null),f=t.useRef(0),O=t.useRef(null),E=t.useRef([]),[$,v]=t.useState(0),[d,T]=t.useState(!0),[P,z]=t.useState(null),[L,C]=t.useState(0),[p,G]=t.useState(0),[K,X]=t.useState(1),[ne,Z]=t.useState(!1),_=t.useRef(null),B=t.useRef(!1),N=t.useRef(null),F=t.useCallback(()=>{N.current&&window.clearTimeout(N.current),N.current=window.setTimeout(()=>{B.current=!1,N.current=null},xe)},[]),Y=c??1,ie=t.useMemo(()=>Number((K*Y).toFixed(3)),[K,Y]),D=t.useCallback(()=>{Z(!0),_.current&&window.clearTimeout(_.current),_.current=window.setTimeout(()=>Z(!1),he)},[]);t.useEffect(()=>()=>{_.current&&window.clearTimeout(_.current),N.current&&window.clearTimeout(N.current)},[]),t.useEffect(()=>{if(!a.current)return;let e=!0;const r=++f.current,o=a.current;return(async()=>{T(!0),z(null),X(1),G(0),C(0),E.current=[],v(u=>u+1);try{const u=de(n);if(!u){e&&r===f.current&&(z(l("learningHub:docPreview.emptyContent")),T(!1));return}if(await re(),!e||r!==f.current)return;const g=pe(u),R=ge(g);if(R){e&&r===f.current&&(z(l(R==="encrypted-or-legacy"?"learningHub:officePreview.encryptedOrLegacy":R==="truncated"?"learningHub:officePreview.corruptedOrTruncated":"learningHub:officePreview.invalidFormat")),T(!1));return}if(!e||r!==f.current)return;o&&(o.innerHTML="");const S=b.current?.clientWidth||o.clientWidth,y=Math.max(320,Math.min(960,Math.round(S||960))),k=ce(o,{width:y});if(O.current=k,await k.preview(g),await new Promise(h=>window.setTimeout(h,0)),await re(),e&&r===f.current){fe(o);const h=o.querySelectorAll(W),I=[];h.forEach(j=>{const A=j,H=A.getBoundingClientRect(),q=parseFloat(A.style.width)||960,se=parseFloat(A.style.height)||(H.width>0?H.height/H.width*q:q*9/16);I.push({width:q,height:se})}),E.current=I,v(j=>j+1),G(h?.length||0),C(0),T(!1)}}catch(u){if(le.warn("[PptxPreview] Failed to render PPTX:",u),e&&r===f.current){o.innerHTML="";const g=u instanceof Error?u.message:"";z(be.test(g)?l("learningHub:officePreview.corruptedOrTruncated"):l("learningHub:docPreview.renderPptxFailed")),T(!1)}}})(),()=>{e=!1,f.current+=1;try{O.current?.destroy()}catch{}O.current=null,E.current=[],o.innerHTML=""}},[n]),t.useEffect(()=>{const e=a.current;if(!e)return;let r=0,o=0,m=null,u=null;const g=()=>e.querySelector(".pptx-preview-wrapper"),R=()=>{const k=b.current,h=g();if(!k||!h)return;const I=k.clientWidth,j=h.scrollWidth||h.clientWidth;if(!I||!j)return;const A=Math.min(1,I/j);X(H=>Math.abs(H-A)<.01?H:Number(A.toFixed(3)))},S=()=>{r&&cancelAnimationFrame(r),r=requestAnimationFrame(R)},y=()=>{o&&window.clearTimeout(o),o=window.setTimeout(S,120)};return u=new MutationObserver(y),u.observe(e,{childList:!0,subtree:!0}),b.current&&(m=new ResizeObserver(S),m.observe(b.current)),S(),()=>{r&&cancelAnimationFrame(r),o&&window.clearTimeout(o),m?.disconnect(),u?.disconnect()}},[n]),t.useEffect(()=>{const e=a.current,r=b.current;if(!e||!r||p===0)return;const o=Array.from(e.querySelectorAll(W));if(!o.length)return;const m=new Map,u=new IntersectionObserver(g=>{for(const y of g)m.set(y.target,y.isIntersecting?y.intersectionRatio:0);if(B.current)return;let R=-1,S=0;o.forEach((y,k)=>{const h=m.get(y)??0;h>S&&(S=h,R=k)}),R>=0&&C(R)},{root:r,threshold:[0,.25,.5,.75,1]});return o.forEach(g=>u.observe(g)),()=>u.disconnect()},[p]),t.useEffect(()=>{const e=b.current;if(!e||p===0)return;const r=()=>{D(),B.current&&F()};return e.addEventListener("scroll",r,{passive:!0}),()=>e.removeEventListener("scroll",r)},[p,D,F]);const M=t.useCallback(e=>{if(!a.current)return;const r=a.current.querySelectorAll(W);r[e]&&(B.current=!0,F(),r[e].scrollIntoView({behavior:te()?"auto":"smooth",block:"start"}),C(e),D())},[D,F]),oe=t.useCallback(e=>{const r=a.current;if(!r)return null;const o=r.querySelectorAll(W)[e];if(!o)return null;const m=o.cloneNode(!0);return m.classList.remove("pptx-preview-slide-wrapper"),m.classList.add("pptx-thumb-slide"),m},[]),J=t.useRef(w);J.current=w,t.useEffect(()=>{w&&(p>0?w({current:L,total:p,navigateTo:M}):w(null))},[L,p,M,w]),t.useEffect(()=>()=>{J.current?.(null)},[]);const ae=e=>{if(p===0||e.ctrlKey||e.metaKey||e.altKey)return;const r=e.target;if(!(r&&(r.tagName==="INPUT"||r.tagName==="TEXTAREA"||r.isContentEditable))){switch(e.key){case"PageDown":case"ArrowRight":M(Math.min(p-1,L+1));break;case"PageUp":case"ArrowLeft":M(Math.max(0,L-1));break;case"Home":M(0);break;case"End":M(p-1);break;default:return}e.preventDefault()}},Q=!P&&p>0;return s.jsxs("div",{className:`relative flex h-full min-h-0 flex-col overflow-hidden bg-muted/30 ${x}`,"aria-busy":d&&!P,tabIndex:0,onKeyDown:ae,children:[d&&!P&&s.jsx("div",{className:"absolute inset-0 z-10 flex flex-col items-center gap-6 overflow-hidden bg-background/90 px-8 py-10",role:"status","aria-label":l("learningHub:docPreview.pptxLoading"),children:[0,1,2].map(e=>s.jsx(ue,{className:"aspect-video w-full max-w-xl shrink-0 rounded-lg",style:{opacity:1-e*.28}},e))}),P&&s.jsx("div",{className:"absolute inset-0 flex items-center justify-center p-8 text-destructive bg-background z-10",role:"alert",children:s.jsxs("p",{children:[l("learningHub:docPreview.cannotPreviewSlides"),": ",P]})}),s.jsxs("div",{className:"flex min-h-0 flex-1 flex-row",children:[Q&&s.jsx("nav",{className:"pptx-thumb-rail ui-rise-in hidden min-h-0 w-[8.5rem] shrink-0 flex-col overflow-hidden border-r border-border/60 bg-muted/20 md:flex","aria-label":l("learningHub:docPreview.pptxThumbnails"),children:s.jsx(ee,{className:"min-h-0 flex-1",orientation:"vertical",children:s.jsx("div",{className:"flex flex-col items-center gap-2.5 px-3 py-3",children:Array.from({length:p},(e,r)=>s.jsx(Re,{index:r,isActive:r===L,meta:E.current[r],cloneSlide:oe,onSelect:M,label:l("learningHub:docPreview.pptxThumbnailItem",{index:r+1})},`${$}-${r}`))})})}),s.jsxs("div",{className:"relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",children:[s.jsx(ee,{className:"pptx-container min-h-0 flex-1",viewportRef:b,orientation:"both",children:s.jsx("div",{ref:a,className:"pptx-content-wrapper",style:{"--pptx-scale":ie},"aria-label":i?l("learningHub:docPreview.pptxPreviewLabel",{name:i}):l("learningHub:docPreview.pptxPreviewDefault")})}),Q&&s.jsxs("div",{"aria-hidden":!0,"data-wb-blur-surface":!0,className:`pointer-events-none absolute bottom-3 right-4 z-10 select-none rounded-full border border-border/60 bg-background/90 px-2.5 py-1 text-xs font-medium tabular-nums text-foreground shadow-sm backdrop-blur transition-opacity duration-150 ${ne?"opacity-100":"opacity-0"}`,children:[L+1," / ",p]})]})]}),s.jsx("style",{children:`
        /* 整体容器 */
        .pptx-container .pptx-content-wrapper {
          min-height: 200px;
          overflow: visible;
          width: max-content;
          margin: 0 auto;
        }
        
        /* pptx-preview 库生成的主包装器 - 覆盖其内联样式。
           缩放使用 zoom 而非 transform:scale——zoom 参与布局，
           滚动范围随缩放同步变化，且等比缩放保持幻灯片纵横比 */
        .pptx-container .pptx-preview-wrapper {
          background: transparent !important;
          height: auto !important;
          overflow: visible !important;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          padding: 16px 0 32px 0;
          zoom: var(--pptx-scale, 1);
          width: max-content;
        }
        
        /* 每个幻灯片容器：默认白底卡片（无 !important，保留内联/主题背景）+ 柔投影 + 圆角 */
        .pptx-container .pptx-preview-wrapper > .pptx-preview-slide-wrapper,
        .pptx-container .pptx-preview-wrapper > div[class*="slide"] {
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 
            0 4px 6px -1px hsl(var(--foreground) / 0.08),
            0 2px 4px -2px hsl(var(--foreground) / 0.06),
            0 0 0 1px hsl(var(--border) / 0.5);
          overflow: hidden;
          flex-shrink: 0;
          scroll-margin-top: 16px;
          transition: box-shadow 150ms ease;
        }
        .pptx-container .pptx-preview-wrapper > .pptx-preview-slide-wrapper:hover,
        .pptx-container .pptx-preview-wrapper > div[class*="slide"]:hover {
          box-shadow: 
            0 8px 18px -4px hsl(var(--foreground) / 0.12),
            0 2px 4px -2px hsl(var(--foreground) / 0.06),
            0 0 0 1px hsl(var(--ring) / 0.35);
        }
        
        /* 内容/母版/版式前景层保持透明，避免遮挡 .slide-background 主题背景（如深蓝底白字） */
        .pptx-container .slide-wrapper,
        .pptx-container .slide-master-wrapper,
        .pptx-container .slide-layout-wrapper {
          background: transparent;
        }
        
        /* 隐藏 pptx-preview 内置的翻页按钮和分页 */
        .pptx-container .pptx-preview-wrapper-next,
        .pptx-container .pptx-preview-wrapper-pagination {
          display: none !important;
        }
        
        /* 图片样式 */
        .pptx-container img {
          max-width: 100%;
          height: auto;
        }
        
        /* 表格样式 */
        .pptx-container table {
          border-collapse: collapse;
          margin: 8px 0;
        }
        .pptx-container td, .pptx-container th {
          border: 1px solid hsl(var(--border));
          padding: 8px;
        }

        /* 缩略图克隆体：纯展示，不参与交互与选区，保留幻灯片原有主题背景 */
        .pptx-thumb-canvas .pptx-thumb-slide {
          background: #ffffff;
          pointer-events: none;
          user-select: none;
        }
      `})]})};export{Ne as PptxPreview,Ne as default};
