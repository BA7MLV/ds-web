import{_ as pe}from"./vite-runtime-B5U0W3t5.js";import{f as r,j as p}from"./vendor-react-CK9Q3ZQe.js";import{x as fe}from"./vendor-pptx-BatiBamA.js";import{j as ie,bL as me}from"./ui-boot-D3Jplikg.js";import{S as he}from"./Skeleton-DVcxRk7X.js";import{n as xe,w as ae,f as we}from"./previewUtils-XhCmziuZ.js";import{i as ge}from"./officeZipContainer-D574AL58.js";import{s as be}from"./sanitizeRenderedDom-BG85uIwo.js";import{u as ve}from"./vendor-i18n-CxOtV7Ik.js";const U=".pptx-preview-slide-wrapper",Z=104,ye=1400,Te=160,se=()=>typeof window<"u"&&!!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,Se=/end of central directory|corrupted zip|invalid zip|unexpected end|bad archive|invalid signature|not a valid|malformed|truncated|xml|invalid (?:block|stored|distance|code|bit|literal)|incorrect (?:header|data) check|unknown compression|uncompressed data size mismatch|data size mismatch|crc|deflate|inflate/i;function Re(x){for(let f=0;f<x.length;f+=1){const w=x[f];if((w.textContent??"").trim().length>0||w.querySelector("img, svg, canvas, table, video, audio"))return!0}return!1}function Ee(x,f,w){if(f&&w&&typeof DOMParser<"u"){const R=new DOMParser,m=R.parseFromString(w,"application/xml"),c=new Map,u=m.getElementsByTagName("*");for(let E=0;E<u.length;E+=1){const a=u[E];if(a.localName!=="Relationship")continue;const n=a.getAttribute("Id"),d=a.getAttribute("Target");if(n&&d){const l=d.replace(/^\/+/,"");c.set(n,l.startsWith("ppt/")?l:`ppt/${l}`)}}const b=R.parseFromString(f,"application/xml"),s=[],k=new Set,v=b.getElementsByTagName("*");for(let E=0;E<v.length;E+=1){const a=v[E];if(a.localName!=="sldId")continue;const n=a.getAttribute("r:id")??a.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships","id"),d=n?c.get(n):void 0;d&&!k.has(d)&&(k.add(d),s.push(d))}if(s.length>0)return s}return x.filter(R=>/^ppt\/slides\/slide\d+\.xml$/i.test(R)).sort((R,m)=>{const c=Number(/slide(\d+)\.xml$/i.exec(R)?.[1]??0),u=Number(/slide(\d+)\.xml$/i.exec(m)?.[1]??0);return c-u})}async function Pe(x,f,w){if(typeof DOMParser>"u")return 0;const{default:R}=await pe(async()=>{const{default:l}=await import("./vendor-docx-CV-TY9-w.js").then(o=>o.j);return{default:l}},[],import.meta.url),m=await R.loadAsync(f),c=Object.keys(m.files),u=await m.file("ppt/presentation.xml")?.async("string")??null,b=await m.file("ppt/_rels/presentation.xml.rels")?.async("string")??null,s=Ee(c,u,b);if(s.length===0)return 0;const k=new DOMParser,v=[];for(let l=0;l<s.length;l+=1){const o=await m.file(s[l])?.async("string");if(!o)continue;const S=k.parseFromString(o,"application/xml"),M=[],y=S.getElementsByTagName("*");for(let h=0;h<y.length;h+=1){const g=y[h];if(g.localName!=="p")continue;let $="";const B=g.getElementsByTagName("*");for(let F=0;F<B.length;F+=1)B[F].localName==="t"&&($+=B[F].textContent??"");const W=$.trim();W&&M.push(W)}v.push({index:l+1,paragraphs:M})}if(!v.some(l=>l.paragraphs.length>0))return 0;const a=Math.max(320,Math.min(960,Math.round(w||960))),n=Math.round(a*9/16);x.innerHTML="";const d=document.createElement("div");d.className="pptx-preview-wrapper";for(const l of v){const o=document.createElement("div");o.className=`pptx-preview-slide-wrapper pptx-preview-slide-wrapper-${l.index-1}`,o.style.width=`${a}px`,o.style.minHeight=`${n}px`,o.style.position="relative",o.style.boxSizing="border-box",o.style.padding="40px 48px",o.style.display="flex",o.style.flexDirection="column",o.style.justifyContent="center",o.style.gap="14px",o.style.color="hsl(var(--card-foreground))",o.style.background="hsl(var(--card))";const S=document.createElement("div");S.className="slide-wrapper",S.style.display="flex",S.style.flexDirection="column",S.style.gap="12px",l.paragraphs.forEach((M,y)=>{const h=document.createElement(y===0?"h2":"p");h.textContent=M,h.style.margin="0",h.style.lineHeight=y===0?"1.35":"1.6",h.style.fontSize=y===0?"24px":"16px",h.style.fontWeight=y===0?"600":"400",h.style.color=y===0?"hsl(var(--card-foreground))":"hsl(var(--muted-foreground))",h.style.wordBreak="break-word",S.appendChild(h)}),o.appendChild(S),d.appendChild(o)}return x.appendChild(d),v.length}const Ne="160px 0px",ke=({index:x,isActive:f,meta:w,cloneSlide:R,onSelect:m,label:c})=>{const u=r.useRef(null),b=r.useRef(null),[s,k]=r.useState(!1),v=w?.width||960,E=w?Math.max(1,Math.round(Z/w.width*w.height)):Math.round(Z*9/16);return r.useEffect(()=>{const a=u.current;if(!a)return;const n=new IntersectionObserver(d=>{for(const l of d)k(l.isIntersecting)},{rootMargin:Ne});return n.observe(a),()=>n.disconnect()},[]),r.useEffect(()=>{const a=b.current;if(!a||(a.replaceChildren(),!s||!w))return;const n=R(x);if(!n)return;const d=Z/v;return n.style.position="absolute",n.style.top="0",n.style.left="0",n.style.transform=`scale(${d})`,n.style.transformOrigin="top left",a.appendChild(n),()=>{a.replaceChildren()}},[s,w,x,R,v]),r.useEffect(()=>{f&&u.current?.scrollIntoView({block:"nearest",behavior:se()?"auto":"smooth"})},[f]),p.jsxs("button",{ref:u,type:"button",onClick:()=>m(x),"aria-label":c,"aria-current":f?"true":void 0,className:`group relative shrink-0 self-center overflow-hidden rounded-md border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background [@media(pointer:coarse)]:inline-flex [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:items-center [@media(pointer:coarse)]:justify-center ${f?"border-primary shadow-sm ring-1 ring-primary":"border-border/60 hover:border-border hover:shadow-sm"}`,children:[p.jsx("div",{ref:b,"aria-hidden":!0,className:"pptx-thumb-canvas relative overflow-hidden bg-white",style:{width:Z,height:E}}),p.jsx("span",{"aria-hidden":!0,className:`absolute left-1 top-1 rounded px-1 text-2xs font-medium leading-4 tabular-nums shadow-sm transition-colors duration-150 ${f?"bg-primary text-primary-foreground":"bg-background/85 text-muted-foreground"}`,children:x+1})]})},De=({base64Content:x,fileName:f,className:w="",zoomScale:R,onSlideInfoChange:m})=>{const{t:c}=ve(["learningHub"]),u=r.useRef(null),b=r.useRef(null),s=r.useRef(0),k=r.useRef(null),v=r.useRef([]),[E,a]=r.useState(0),[n,d]=r.useState(!1),[l,o]=r.useState(!0),[S,M]=r.useState(null),[y,h]=r.useState(0),[g,$]=r.useState(0),[B,W]=r.useState(1),[F,ee]=r.useState(!1),V=r.useRef(null),G=r.useRef(!1),I=r.useRef(null),K=r.useCallback(()=>{I.current&&window.clearTimeout(I.current),I.current=window.setTimeout(()=>{G.current=!1,I.current=null},Te)},[]),te=R??1,le=r.useMemo(()=>Number((B*te).toFixed(3)),[B,te]),X=r.useCallback(()=>{ee(!0),V.current&&window.clearTimeout(V.current),V.current=window.setTimeout(()=>ee(!1),ye)},[]);r.useEffect(()=>()=>{V.current&&window.clearTimeout(V.current),I.current&&window.clearTimeout(I.current)},[]),r.useEffect(()=>{if(!u.current)return;let t=!0;const e=++s.current,i=u.current;return(async()=>{o(!0),M(null),W(1),$(0),h(0),v.current=[],a(T=>T+1);try{const T=xe(x);if(!T){t&&e===s.current&&(M(c("learningHub:docPreview.emptyContent")),o(!1));return}if(await ae(),!t||e!==s.current)return;const A=we(T),{issue:j,normalizedBuffer:O}=ge(A);if(j){t&&e===s.current&&(M(c(j==="encrypted-or-legacy"?"learningHub:officePreview.encryptedOrLegacy":j==="truncated"?"learningHub:officePreview.corruptedOrTruncated":"learningHub:officePreview.invalidFormat")),o(!1));return}if(!t||e!==s.current)return;i&&(i.innerHTML="");const H=b.current?.clientWidth||i.clientWidth,D=Math.max(320,Math.min(960,Math.round(H||960))),L=fe(i,{width:D});k.current=L;let _=null;try{await L.preview(O)}catch(P){_=P}if(await new Promise(P=>window.setTimeout(P,0)),await ae(),t&&e===s.current){_||be(i);let P=i.querySelectorAll(U);if(_||P.length===0||!Re(P)){const C=await Pe(i,O,D).catch(()=>0);if(!t||e!==s.current)return;if(C>0)P=i.querySelectorAll(U);else if(_)throw _}const q=[];P.forEach(C=>{const J=C,Y=J.getBoundingClientRect(),Q=parseFloat(J.style.width)||960,de=parseFloat(J.style.height)||(Y.width>0?Y.height/Y.width*Q:Q*9/16);q.push({width:Q,height:de})}),v.current=q,a(C=>C+1),$(P?.length||0),h(0),o(!1)}}catch(T){if(me.warn("[PptxPreview] Failed to render PPTX:",T),t&&e===s.current){i.innerHTML="";const A=T instanceof Error?T.message:"";M(Se.test(A)?c("learningHub:officePreview.corruptedOrTruncated"):c("learningHub:docPreview.renderPptxFailed")),o(!1)}}})(),()=>{t=!1,s.current+=1;try{k.current?.destroy()}catch{}k.current=null,v.current=[],i.innerHTML=""}},[x]),r.useEffect(()=>{const t=u.current;if(!t)return;let e=0,i=0,N=null,T=null;const A=()=>t.querySelector(".pptx-preview-wrapper"),j=()=>{const D=b.current,L=A();if(!D||!L)return;const _=D.clientWidth,P=L.scrollWidth||L.clientWidth;if(!_||!P)return;const q=Math.min(1,_/P);W(C=>Math.abs(C-q)<.01?C:Number(q.toFixed(3)))},O=()=>{e&&cancelAnimationFrame(e),e=requestAnimationFrame(j)},H=()=>{i&&window.clearTimeout(i),i=window.setTimeout(O,120)};return T=new MutationObserver(H),T.observe(t,{childList:!0,subtree:!0}),b.current&&(N=new ResizeObserver(O),N.observe(b.current)),O(),()=>{e&&cancelAnimationFrame(e),i&&window.clearTimeout(i),N?.disconnect(),T?.disconnect()}},[x]),r.useEffect(()=>{const t=u.current,e=b.current;if(!t||!e||g===0)return;const i=Array.from(t.querySelectorAll(U));if(!i.length)return;const N=new Map,T=new IntersectionObserver(A=>{for(const H of A)N.set(H.target,H.isIntersecting?H.intersectionRatio:0);if(G.current)return;let j=-1,O=0;i.forEach((H,D)=>{const L=N.get(H)??0;L>O&&(O=L,j=D)}),j>=0&&h(j)},{root:e,threshold:[0,.25,.5,.75,1]});return i.forEach(A=>T.observe(A)),()=>T.disconnect()},[g]),r.useEffect(()=>{const t=b.current;if(!t||g===0)return;const e=()=>{X(),G.current&&K()};return t.addEventListener("scroll",e,{passive:!0}),()=>t.removeEventListener("scroll",e)},[g,X,K]);const z=r.useCallback(t=>{if(!u.current)return;const e=u.current.querySelectorAll(U);e[t]&&(G.current=!0,K(),e[t].scrollIntoView({behavior:se()?"auto":"smooth",block:"start"}),h(t),X())},[X,K]),ce=r.useCallback(t=>{const e=u.current;if(!e)return null;const i=e.querySelectorAll(U)[t];if(!i)return null;const N=i.cloneNode(!0);return N.classList.remove("pptx-preview-slide-wrapper"),N.classList.add("pptx-thumb-slide"),N},[]),re=r.useRef(m);re.current=m;const ne=r.useCallback(()=>{d(t=>{const e=!t;return e&&window.getSelection()?.removeAllRanges(),e})},[]);r.useEffect(()=>{m&&(g>0?m({current:y,total:g,navigateTo:z,thumbnailsOpen:n,onToggleThumbnails:ne}):m(null))},[y,g,z,n,ne,m]),r.useEffect(()=>()=>{re.current?.(null)},[]);const ue=t=>{if(g===0||t.ctrlKey||t.metaKey||t.altKey)return;const e=t.target;if(!(e&&(e.tagName==="INPUT"||e.tagName==="TEXTAREA"||e.isContentEditable))){switch(t.key){case"PageDown":case"ArrowRight":z(Math.min(g-1,y+1));break;case"PageUp":case"ArrowLeft":z(Math.max(0,y-1));break;case"Home":z(0);break;case"End":z(g-1);break;default:return}t.preventDefault()}},oe=!S&&g>0;return p.jsxs("div",{className:`relative flex h-full min-h-0 flex-col overflow-hidden bg-muted/30 ${w}`,"aria-busy":l&&!S,tabIndex:0,onKeyDown:ue,children:[l&&!S&&p.jsx("div",{className:"absolute inset-0 z-10 flex flex-col items-center gap-6 overflow-hidden bg-background/90 px-8 py-10",role:"status","aria-label":c("learningHub:docPreview.pptxLoading"),children:[0,1,2].map(t=>p.jsx(he,{className:"aspect-video w-full max-w-xl shrink-0 rounded-lg",style:{opacity:1-t*.28}},t))}),S&&p.jsx("div",{className:"absolute inset-0 flex items-center justify-center p-8 text-destructive bg-background z-10",role:"alert",children:p.jsxs("p",{children:[c("learningHub:docPreview.cannotPreviewSlides"),": ",S]})}),p.jsxs("div",{className:"relative flex min-h-0 flex-1 flex-row",children:[oe&&p.jsx("nav",{"data-open":n,"aria-hidden":!n,className:`pptx-thumb-rail absolute inset-y-0 left-0 z-20 flex min-h-0 w-[8.5rem] flex-col overflow-hidden border-r border-border/60 bg-background/95 shadow-md transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none ${n?"translate-x-0 opacity-100":"pointer-events-none -translate-x-full opacity-0"}`,"aria-label":c("learningHub:docPreview.pptxThumbnails"),children:p.jsx(ie,{className:"min-h-0 flex-1",orientation:"vertical",children:p.jsx("div",{className:"flex flex-col items-center gap-2.5 px-3 py-3",children:n&&Array.from({length:g},(t,e)=>p.jsx(ke,{index:e,isActive:e===y,meta:v.current[e],cloneSlide:ce,onSelect:i=>{z(i),(b.current?.clientWidth??0)<840&&d(!1)},label:c("learningHub:docPreview.pptxThumbnailItem",{index:e+1})},`${E}-${e}`))})})}),p.jsxs("div",{className:"relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",children:[p.jsx(ie,{className:"pptx-container min-h-0 flex-1",viewportRef:b,orientation:"both",children:p.jsx("div",{ref:u,className:"pptx-content-wrapper",style:{"--pptx-scale":le},"aria-label":f?c("learningHub:docPreview.pptxPreviewLabel",{name:f}):c("learningHub:docPreview.pptxPreviewDefault")})}),oe&&p.jsxs("div",{"aria-hidden":!0,"data-wb-blur-surface":!0,className:`pointer-events-none absolute bottom-3 right-4 z-10 select-none rounded-full border border-border/60 bg-background/90 px-2.5 py-1 text-xs font-medium tabular-nums text-foreground shadow-sm backdrop-blur transition-opacity duration-150 ${F?"opacity-100":"opacity-0"}`,children:[y+1," / ",g]})]})]}),p.jsx("style",{children:`
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
      `})]})};export{De as PptxPreview,De as default};
