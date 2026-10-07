import{f as t,j as o}from"./vendor-react-CK9Q3ZQe.js";import{x as ie}from"./vendor-pptx-CXOvnA5I.js";import{C as J}from"./custom-scroll-area-Dq46hhq4.js";import{S as se}from"./Skeleton-BKYxH1II.js";import{n as ae,w as Q,f as ce}from"./previewUtils-DdkQNf3r.js";import{s as le}from"./sanitizeRenderedDom-DyD-3O9N.js";import{u as ue}from"./vendor-i18n-CxOtV7Ik.js";const V=".pptx-preview-slide-wrapper",W=104,pe=1400,de=160,ee=()=>typeof window<"u"&&!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;function fe(m){const i=new Uint8Array(m);return i.length>=2&&i[0]===80&&i[1]===75?null:i.length>=4&&i[0]===208&&i[1]===207&&i[2]===17&&i[3]===224?"encrypted-or-legacy":"invalid"}const me="160px 0px",he=({index:m,isActive:i,meta:g,cloneSlide:z,onSelect:y,label:p})=>{const l=t.useRef(null),w=t.useRef(null),[d,H]=t.useState(!1),S=g?.width||960,$=g?Math.max(1,Math.round(W/g.width*g.height)):Math.round(W*9/16);return t.useEffect(()=>{const h=l.current;if(!h)return;const a=new IntersectionObserver(b=>{for(const E of b)H(E.isIntersecting)},{rootMargin:me});return a.observe(h),()=>a.disconnect()},[]),t.useEffect(()=>{const h=w.current;if(!h||(h.replaceChildren(),!d||!g))return;const a=z(m);if(!a)return;const b=W/S;return a.style.position="absolute",a.style.top="0",a.style.left="0",a.style.transform=`scale(${b})`,a.style.transformOrigin="top left",h.appendChild(a),()=>{h.replaceChildren()}},[d,g,m,z,S]),t.useEffect(()=>{i&&l.current?.scrollIntoView({block:"nearest",behavior:ee()?"auto":"smooth"})},[i]),o.jsxs("button",{ref:l,type:"button",onClick:()=>y(m),"aria-label":p,"aria-current":i?"true":void 0,className:`group relative shrink-0 self-center overflow-hidden rounded-md border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background [@media(pointer:coarse)]:inline-flex [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:items-center [@media(pointer:coarse)]:justify-center ${i?"border-primary shadow-sm ring-1 ring-primary":"border-border/60 hover:border-border hover:shadow-sm"}`,children:[o.jsx("div",{ref:w,"aria-hidden":!0,className:"pptx-thumb-canvas relative overflow-hidden bg-white",style:{width:W,height:$}}),o.jsx("span",{"aria-hidden":!0,className:`absolute left-1 top-1 rounded px-1 text-2xs font-medium leading-4 tabular-nums shadow-sm transition-colors duration-150 ${i?"bg-primary text-primary-foreground":"bg-background/85 text-muted-foreground"}`,children:m+1})]})},Re=({base64Content:m,fileName:i,className:g="",zoomScale:z,onSlideInfoChange:y})=>{const{t:p}=ue(["learningHub"]),l=t.useRef(null),w=t.useRef(null),d=t.useRef(0),H=t.useRef(null),S=t.useRef([]),[$,h]=t.useState(0),[a,b]=t.useState(!0),[E,O]=t.useState(null),[M,_]=t.useState(0),[c,q]=t.useState(0),[U,G]=t.useState(1),[re,K]=t.useState(!1),I=t.useRef(null),C=t.useRef(!1),N=t.useRef(null),F=t.useCallback(()=>{N.current&&window.clearTimeout(N.current),N.current=window.setTimeout(()=>{C.current=!1,N.current=null},de)},[]),X=z??1,te=t.useMemo(()=>Number((U*X).toFixed(3)),[U,X]),B=t.useCallback(()=>{K(!0),I.current&&window.clearTimeout(I.current),I.current=window.setTimeout(()=>K(!1),pe)},[]);t.useEffect(()=>()=>{I.current&&window.clearTimeout(I.current),N.current&&window.clearTimeout(N.current)},[]),t.useEffect(()=>{if(!l.current)return;let e=!0;const r=++d.current,n=l.current;return(async()=>{b(!0),O(null),G(1),q(0),_(0),S.current=[],h(s=>s+1);try{const s=ae(m);if(!s){e&&r===d.current&&(O(p("learningHub:docPreview.emptyContent")),b(!1));return}if(await Q(),!e||r!==d.current)return;const T=ce(s),R=fe(T);if(R){e&&r===d.current&&(O(p(R==="encrypted-or-legacy"?"learningHub:officePreview.encryptedOrLegacy":"learningHub:officePreview.invalidFormat")),b(!1));return}if(!e||r!==d.current)return;n&&(n.innerHTML="");const v=ie(n,{width:960});if(H.current=v,await v.preview(T),await new Promise(u=>window.setTimeout(u,0)),await Q(),e&&r===d.current){le(n);const u=n.querySelectorAll(V),P=[];u.forEach(x=>{const j=x,A=j.getBoundingClientRect(),L=parseFloat(j.style.width)||960,D=parseFloat(j.style.height)||(A.width>0?A.height/A.width*L:L*9/16);P.push({width:L,height:D})}),S.current=P,h(x=>x+1),q(u?.length||0),_(0),b(!1)}}catch(s){console.error("Failed to render PPTX:",s),e&&r===d.current&&(n.innerHTML="",O(s instanceof Error?s.message:p("learningHub:docPreview.renderPptxFailed")),b(!1))}})(),()=>{e=!1,d.current+=1;try{H.current?.destroy()}catch{}H.current=null,S.current=[],n.innerHTML=""}},[m]),t.useEffect(()=>{const e=l.current;if(!e)return;let r=0,n=0,f=null,s=null;const T=()=>e.querySelector(".pptx-preview-wrapper"),R=()=>{const P=w.current,x=T();if(!P||!x)return;const j=P.clientWidth,A=x.scrollWidth||x.clientWidth;if(!j||!A)return;const L=Math.min(1,j/A);G(D=>Math.abs(D-L)<.01?D:Number(L.toFixed(3)))},v=()=>{r&&cancelAnimationFrame(r),r=requestAnimationFrame(R)},u=()=>{n&&window.clearTimeout(n),n=window.setTimeout(v,120)};return s=new MutationObserver(u),s.observe(e,{childList:!0,subtree:!0}),w.current&&(f=new ResizeObserver(v),f.observe(w.current)),v(),()=>{r&&cancelAnimationFrame(r),n&&window.clearTimeout(n),f?.disconnect(),s?.disconnect()}},[m]),t.useEffect(()=>{const e=l.current,r=w.current;if(!e||!r||c===0)return;const n=Array.from(e.querySelectorAll(V));if(!n.length)return;const f=new Map,s=new IntersectionObserver(T=>{for(const u of T)f.set(u.target,u.isIntersecting?u.intersectionRatio:0);if(C.current)return;let R=-1,v=0;n.forEach((u,P)=>{const x=f.get(u)??0;x>v&&(v=x,R=P)}),R>=0&&_(R)},{root:r,threshold:[0,.25,.5,.75,1]});return n.forEach(T=>s.observe(T)),()=>s.disconnect()},[c]),t.useEffect(()=>{const e=w.current;if(!e||c===0)return;const r=()=>{B(),C.current&&F()};return e.addEventListener("scroll",r,{passive:!0}),()=>e.removeEventListener("scroll",r)},[c,B,F]);const k=t.useCallback(e=>{if(!l.current)return;const r=l.current.querySelectorAll(V);r[e]&&(C.current=!0,F(),r[e].scrollIntoView({behavior:ee()?"auto":"smooth",block:"start"}),_(e),B())},[B,F]),ne=t.useCallback(e=>{const r=l.current;if(!r)return null;const n=r.querySelectorAll(V)[e];if(!n)return null;const f=n.cloneNode(!0);return f.classList.remove("pptx-preview-slide-wrapper"),f.classList.add("pptx-thumb-slide"),f},[]),Y=t.useRef(y);Y.current=y,t.useEffect(()=>{y&&(c>0?y({current:M,total:c,navigateTo:k}):y(null))},[M,c,k,y]),t.useEffect(()=>()=>{Y.current?.(null)},[]);const oe=e=>{if(c===0||e.ctrlKey||e.metaKey||e.altKey)return;const r=e.target;if(!(r&&(r.tagName==="INPUT"||r.tagName==="TEXTAREA"||r.isContentEditable))){switch(e.key){case"PageDown":case"ArrowRight":k(Math.min(c-1,M+1));break;case"PageUp":case"ArrowLeft":k(Math.max(0,M-1));break;case"Home":k(0);break;case"End":k(c-1);break;default:return}e.preventDefault()}},Z=!E&&c>0;return o.jsxs("div",{className:`relative flex h-full min-h-0 flex-col overflow-hidden bg-muted/30 ${g}`,"aria-busy":a&&!E,tabIndex:0,onKeyDown:oe,children:[a&&!E&&o.jsx("div",{className:"absolute inset-0 z-10 flex flex-col items-center gap-6 overflow-hidden bg-background/90 px-8 py-10",role:"status","aria-label":p("learningHub:docPreview.pptxLoading"),children:[0,1,2].map(e=>o.jsx(se,{className:"aspect-video w-full max-w-xl shrink-0 rounded-lg",style:{opacity:1-e*.28}},e))}),E&&o.jsx("div",{className:"absolute inset-0 flex items-center justify-center p-8 text-destructive bg-background z-10",role:"alert",children:o.jsxs("p",{children:[p("learningHub:docPreview.cannotPreviewSlides"),": ",E]})}),o.jsxs("div",{className:"flex min-h-0 flex-1 flex-row",children:[Z&&o.jsx("nav",{className:"pptx-thumb-rail ui-rise-in hidden min-h-0 w-[8.5rem] shrink-0 flex-col overflow-hidden border-r border-border/60 bg-muted/20 md:flex","aria-label":p("learningHub:docPreview.pptxThumbnails"),children:o.jsx(J,{className:"min-h-0 flex-1",orientation:"vertical",children:o.jsx("div",{className:"flex flex-col items-center gap-2.5 px-3 py-3",children:Array.from({length:c},(e,r)=>o.jsx(he,{index:r,isActive:r===M,meta:S.current[r],cloneSlide:ne,onSelect:k,label:p("learningHub:docPreview.pptxThumbnailItem",{index:r+1})},`${$}-${r}`))})})}),o.jsxs("div",{className:"relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",children:[o.jsx(J,{className:"pptx-container min-h-0 flex-1",viewportRef:w,orientation:"both",children:o.jsx("div",{ref:l,className:"pptx-content-wrapper",style:{"--pptx-scale":te},"aria-label":i?p("learningHub:docPreview.pptxPreviewLabel",{name:i}):p("learningHub:docPreview.pptxPreviewDefault")})}),Z&&o.jsxs("div",{"aria-hidden":!0,"data-wb-blur-surface":!0,className:`pointer-events-none absolute bottom-3 right-4 z-10 select-none rounded-full border border-border/60 bg-background/90 px-2.5 py-1 text-xs font-medium tabular-nums text-foreground shadow-sm backdrop-blur transition-opacity duration-150 ${re?"opacity-100":"opacity-0"}`,children:[M+1," / ",c]})]})]}),o.jsx("style",{children:`
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
        
        /* 每个幻灯片容器：白底卡片 + 柔投影 + 圆角，hover 态微妙边框 */
        .pptx-container .pptx-preview-wrapper > .pptx-preview-slide-wrapper,
        .pptx-container .pptx-preview-wrapper > div[class*="slide"] {
          background: #ffffff !important;
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
        
        /* 幻灯片内容区域白色背景 */
        .pptx-container .slide-wrapper,
        .pptx-container [class*="slide-wrapper"] {
          background: #ffffff !important;
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

        /* 缩略图克隆体：纯展示，不参与交互与选区 */
        .pptx-thumb-canvas .pptx-thumb-slide {
          background: #ffffff !important;
          pointer-events: none;
          user-select: none;
        }
      `})]})};export{Re as PptxPreview,Re as default};
