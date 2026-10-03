import{f as o,j as g}from"./vendor-react-C80K2e6c.js";import{p as R}from"./DsButton-CQYjv_Uv.js";import{n as a}from"./demo-C3MatDI7.js";import{L as S,j,i as v}from"./systemStatusStore-D389mI_8.js";import{a as c}from"./vendor-i18n-BpK6uTJl.js";import{w as F}from"./vendor-micro-yyEm3M76.js";import{c as M,s as k}from"./settingsApi-D9WxQCvE.js";import{k as D}from"./shared-BnqW-aGO.js";const $=new Map([["bold",o.createElement(o.Fragment,null,o.createElement("path",{d:"M200,28H165.47a51.88,51.88,0,0,0-74.94,0H56A20,20,0,0,0,36,48V216a20,20,0,0,0,20,20H200a20,20,0,0,0,20-20V48A20,20,0,0,0,200,28ZM155.71,60H100.29a28,28,0,0,1,55.42,0ZM196,212H60V52H77.41A52.13,52.13,0,0,0,76,64v8A12,12,0,0,0,88,84h80a12,12,0,0,0,12-12V64a52.13,52.13,0,0,0-1.41-12H196Z"}))],["duotone",o.createElement(o.Fragment,null,o.createElement("path",{d:"M208,48V216a8,8,0,0,1-8,8H56a8,8,0,0,1-8-8V48a8,8,0,0,1,8-8H96a39.83,39.83,0,0,0-8,24v8h80V64a39.83,39.83,0,0,0-8-24h40A8,8,0,0,1,208,48Z",opacity:"0.2"}),o.createElement("path",{d:"M200,32H163.74a47.92,47.92,0,0,0-71.48,0H56A16,16,0,0,0,40,48V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm-72,0a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm72,184H56V48H82.75A47.93,47.93,0,0,0,80,64v8a8,8,0,0,0,8,8h80a8,8,0,0,0,8-8V64a47.93,47.93,0,0,0-2.75-16H200Z"}))],["fill",o.createElement(o.Fragment,null,o.createElement("path",{d:"M200,32H163.74a47.92,47.92,0,0,0-71.48,0H56A16,16,0,0,0,40,48V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm-72,0a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Z"}))],["light",o.createElement(o.Fragment,null,o.createElement("path",{d:"M200,34H162.83a45.91,45.91,0,0,0-69.66,0H56A14,14,0,0,0,42,48V216a14,14,0,0,0,14,14H200a14,14,0,0,0,14-14V48A14,14,0,0,0,200,34Zm-72-4a34,34,0,0,1,34,34v2H94V64A34,34,0,0,1,128,30Zm74,186a2,2,0,0,1-2,2H56a2,2,0,0,1-2-2V48a2,2,0,0,1,2-2H85.67A45.77,45.77,0,0,0,82,64v8a6,6,0,0,0,6,6h80a6,6,0,0,0,6-6V64a45.77,45.77,0,0,0-3.67-18H200a2,2,0,0,1,2,2Z"}))],["regular",o.createElement(o.Fragment,null,o.createElement("path",{d:"M200,32H163.74a47.92,47.92,0,0,0-71.48,0H56A16,16,0,0,0,40,48V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm-72,0a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm72,184H56V48H82.75A47.93,47.93,0,0,0,80,64v8a8,8,0,0,0,8,8h80a8,8,0,0,0,8-8V64a47.93,47.93,0,0,0-2.75-16H200Z"}))],["thin",o.createElement(o.Fragment,null,o.createElement("path",{d:"M200,36H161.92a44,44,0,0,0-67.84,0H56A12,12,0,0,0,44,48V216a12,12,0,0,0,12,12H200a12,12,0,0,0,12-12V48A12,12,0,0,0,200,36Zm-72-8a36,36,0,0,1,36,36v4H92V64A36,36,0,0,1,128,28Zm76,188a4,4,0,0,1-4,4H56a4,4,0,0,1-4-4V48a4,4,0,0,1,4-4H88.83A43.71,43.71,0,0,0,84,64v8a4,4,0,0,0,4,4h80a4,4,0,0,0,4-4V64a43.71,43.71,0,0,0-4.83-20H200a4,4,0,0,1,4,4Z"}))]]),P=o.forwardRef((e,n)=>o.createElement(R,{ref:n,...e,weights:$}));P.displayName="ClipboardIcon";const de=P,l="_global",y={async historyList(e,n,t=30,r=!1){return a("notes_history_list",{noteId:e,cursor:n??null,limit:t,pinnedOnly:r})},async historyGet(e,n){return a("notes_history_get",{noteId:e,versionId:n})},async historySetPinned(e,n,t){return a("notes_history_set_pinned",{noteId:e,versionId:n,pinned:t})},async historyRestoreCopy(e,n,t){return t?a("notes_history_restore_selection_copy",{noteId:e,versionId:n,selection:t}):a("notes_history_restore_copy",{noteId:e,versionId:n})},async historyCurrent(e){return a("notes_history_current",{noteId:e})},async historyRestoreCurrent(e,n,t,r,s){return a("notes_history_restore_current",{noteId:e,versionId:n,expectedUpdatedAt:t,selection:r??null,...s?{lease:s}:{}})},async historyGetRetention(){return a("notes_history_get_retention")},async historySetRetention(e){return a("notes_history_set_retention",{policy:e})},async saveAsset(e,n,t){return await a("notes_save_asset",{subject:l,noteId:e,base64Data:n,defaultExt:t})},async listAssets(e){return await a("notes_list_assets",{subject:l,noteId:e})},async deleteAsset(e){return await a("notes_delete_asset",{relativePath:e})},async resolveAssetPath(e){return await a("notes_resolve_asset_path",{relativePath:e})},async setPref(e,n){return await a("notes_set_pref",{key:e,value:n})},async getPref(e){return await a("notes_get_pref",{key:e})},async saveNoteAnnotations(e,n){const t=`note_annotations:${e}`;return await y.setPref(t,JSON.stringify(n||[]))},async loadNoteAnnotations(e){const n=`note_annotations:${e}`,t=await y.getPref(n);if(!t)return[];try{return JSON.parse(t)}catch{return[]}},async dbStats(){return await a("notes_db_stats",{})},async dbVacuum(){return await a("notes_db_vacuum",{})},async listTags(){return await a("notes_list_tags",{subject:l})},async renameTag(e,n){throw console.warn("[NotesAPI] renameTag is deprecated - use NotesContext.renameTagAcrossNotes (DSTU) instead"),new Error(`renameTag('${e}' -> '${n}') is no longer supported here: note CRUD has moved to the DSTU API. Use NotesContext.renameTagAcrossNotes instead.`)},async searchNotesByTag(e,n=50){return await a("notes_search",{subject:l,keyword:`tag:${e}`,limit:n})},async listDeleted(e=0,n=20){return await a("notes_list_deleted",{subject:l,page:e,page_size:n})},async emptyTrash(){return await a("notes_empty_trash",{subject:l})},async hardDelete(e){return await a("notes_hard_delete",{subject:l,id:e})},async restore(e){return await a("notes_restore",{subject:l,id:e})},async mentionsSearch(e,n){const t={keyword:e};return typeof n?.limit=="number"&&(t.limit=n.limit),{irec_cards:(await a("notes_mentions_search",t))?.irec_cards??[]}},async indexAssets(e){return await a("notes_assets_index_scan",{subject:l,noteId:e})},async scanOrphanAssets(){return await a("notes_assets_scan_orphans",{subject:l})},async bulkDeleteAssets(e){return await a("notes_assets_bulk_delete",{paths:e})},async exportNotes(e={}){const n={output_path:e.outputPath,include_versions:e.includeVersions??!0};try{return await a("notes_export",{request:n})}catch(t){throw console.error("[NotesAPI] exportNotes failed:",t),t}},async exportSingleNote(e){const n={subject:l,note_id:e.noteId,output_path:e.outputPath,include_versions:e.includeVersions??!0};try{return await a("notes_export_single",{request:n})}catch(t){throw console.error("[NotesAPI] exportSingleNote failed:",t),t}},async importNotes(e){const n={file_path:e.filePath,conflict_strategy:e.conflictStrategy};try{return await a("notes_import",{request:n})}catch(t){throw console.error("[NotesAPI] importNotes failed:",t),t}},async canvasReadContent(e,n){return await a("canvas_note_read",{subject:l,noteId:e,section:n})},async canvasAppendContent(e,n,t){await a("canvas_note_append",{subject:l,noteId:e,content:n,section:t})},async canvasReplaceContent(e,n,t,r){return await a("canvas_note_replace",{subject:l,noteId:e,search:n,replace:t,isRegex:r})},async canvasSetContent(e,n){await a("canvas_note_set",{subject:l,noteId:e,content:n})}},Z=["standard","compact","wide"],W=["","📄","📚","💡","🧪","📝"],q=[{key:"subjects",icons:["📐","📏","🧮","➗","🔢","🧬","⚗️","🔬","🔭","🌍","🗺️","🏛️","📜","⚖️","💻","🖥️","🤖","🧠","🎨","🎵","🏃","🗣️","🈶","🔤"]},{key:"study",icons:["📖","📒","📓","📔","📕","📗","📘","📙","🗂️","📌","📎","🖊️","✏️","🖍️","🗒️","📋","🗓️","⏰","⏳","🎯","🏆","🎓","✅","❓"]},{key:"symbols",icons:["⭐","🌟","✨","🔥","⚡","💎","❤️","🧡","💛","💚","💙","💜","🔴","🟠","🟡","🟢","🔵","🟣","⚠️","🚩","🔖","🏷️","🔑","🧩"]},{key:"nature",icons:["🌱","🌿","🍀","🌸","🌻","🌙","☀️","🌈","❄️","🌊","⛰️","🍎","🍵","☕","🐱","🐶","🦊","🐼","🦉","🐝","🦋","🐢","🚀","🛸"]}],me=[...W.filter(Boolean),...q.flatMap(e=>e.icons)];function H(e){return e===""?!0:typeof e=="string"&&e.length<=16&&/\p{Extended_Pictographic}/u.test(e)&&!/\s/.test(e)}const G=["default","serif","mono"],w={preset:"standard",icon:"",smallText:!1,fullWidth:!1,font:"default"};function x(e){return`note_appearance:${e}`}function U(e){if(!e)return w;try{const n=JSON.parse(e),t=Z.includes(n?.preset)?n.preset:"standard";return{preset:t,icon:H(n?.icon)?n.icon:"",smallText:typeof n?.smallText=="boolean"?n.smallText:t==="compact",fullWidth:typeof n?.fullWidth=="boolean"?n.fullWidth:t==="wide",font:G.includes(n?.font)?n.font:"default"}}catch{return w}}const C=new Map,T={value:w,loading:!1,saving:!1,error:null};function f(e){let n=C.get(e);return n||(n={snapshot:{...T,loading:!0},listeners:new Set,loaded:!1},C.set(e,n)),n}function p(e,n){e.snapshot={...e.snapshot,...n},e.listeners.forEach(t=>t())}async function A(e){const n=f(e);if(!n.loaded)return n.pendingLoad||(p(n,{loading:!0,error:null}),n.pendingLoad=(async()=>{try{const t=await y.getPref(x(e));n.loaded=!0,p(n,{value:U(t),loading:!1})}catch{p(n,{loading:!1,error:"load"})}finally{n.pendingLoad=void 0}})()),n.pendingLoad}async function J(e,n){const t=f(e);if(!t.loaded||t.snapshot.saving||n.icon!==void 0&&!H(n.icon))return;const r={...t.snapshot.value,...n};p(t,{saving:!0,error:null});try{if(!await y.setPref(x(e),JSON.stringify(r)))throw new Error("Appearance preference was not saved");p(t,{value:r,saving:!1})}catch{p(t,{saving:!1,error:"save"})}}function pe(e){const n=o.useCallback(s=>{if(!e)return()=>{};const i=f(e);return i.listeners.add(s),()=>{i.listeners.delete(s)}},[e]),t=o.useCallback(()=>e?f(e).snapshot:T,[e]),r=o.useSyncExternalStore(n,t,()=>T);return o.useEffect(()=>{e&&A(e)},[e]),{...r,update:s=>e?J(e,s):Promise.resolve(),reload:()=>e?A(e):Promise.resolve()}}function B(e,n=!0){const t=o.useCallback(s=>{if(!e)return()=>{};const i=f(e);return i.listeners.add(s),()=>{i.listeners.delete(s)}},[e]),r=o.useSyncExternalStore(t,()=>e?f(e).snapshot.value.icon:"",()=>"");return o.useEffect(()=>{e&&n&&A(e)},[e,n]),r}const fe=({noteId:e,size:n=15,fallback:t,className:r})=>{const s=B(e);return s?g.jsx("span",{className:r?`notes-page-glyph ${r}`:"notes-page-glyph","aria-hidden":"true",style:{fontSize:Math.round(n*.95),width:n,height:n,lineHeight:`${n}px`,display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:s}):g.jsx(g.Fragment,{children:t})},K=[{id:"lecture",title:"听课笔记",summary:"目标、核心概念、例题推导与课后问题",markdown:`> {{date}}

## 本节目标

- 

## 核心概念


## 例题与推导


## 课后问题

- [ ] `},{id:"mistake",title:"错题复盘",summary:"原题、错因分析与同类题提醒",markdown:`> {{date}}

## 原题


## 我的解法


## 错因

- 

## 正确思路


## 同类提醒

- [ ] `},{id:"exam",title:"应试整理",summary:"考查范围、高频考点与考前速记",markdown:`> {{date}}

## 考查范围

- 

## 高频考点

- 

## 易错清单

- [ ] 

## 时间分配


## 考前速记

`},{id:"meeting",title:"会议记录",summary:"参会人、讨论要点、决议与行动项",markdown:`# {{title}}

> {{date}} {{time}}

## 参会人

- 

## 议程

1. 

## 讨论要点


## 决议

- 

## 行动项

- [ ] `},{id:"reading",title:"读书笔记",summary:"核心观点、精彩摘录与个人思考",markdown:`# {{title}}

> {{date}}

## 书籍信息

- 作者：
- 章节：

## 核心观点

- 

## 精彩摘录

> 

## 我的思考


## 行动启发

- [ ] `},{id:"weekly",title:"周计划",summary:"本周目标、重点任务与周末复盘",markdown:`> {{date}}

## 本周目标

- [ ] 

## 重点任务

1. 

## 每日安排

- 周一：
- 周二：
- 周三：
- 周四：
- 周五：
- 周末：

## 周末复盘

`},{id:"cornell",title:"康奈尔笔记",summary:"线索、笔记与总结三栏式记录法",markdown:`> {{date}}

## 线索（Cues）

- 

## 笔记（Notes）


## 总结（Summary）

`},{id:"literature",title:"文献笔记",summary:"文献信息、研究问题、方法与结论",markdown:`# {{title}}

> {{date}}

## 文献信息

- 标题：
- 作者：
- 来源 / DOI：
- 年份：

## 研究问题


## 方法


## 关键结论

- 

## 局限与疑问

- 

## 与我的研究关联

`}],X=[{id:"lecture",title:"Lecture notes",summary:"Goals, core concepts, derivations, follow-ups",markdown:`> {{date}}

## Learning goals

- 

## Core concepts


## Examples and derivations


## Follow-up questions

- [ ] `},{id:"mistake",title:"Mistake review",summary:"Original problem, root cause, reminders",markdown:`> {{date}}

## Original problem


## My approach


## Root cause

- 

## Correct approach


## Reminder for similar problems

- [ ] `},{id:"exam",title:"Exam review",summary:"Scope, high-frequency topics, final review",markdown:`> {{date}}

## Scope

- 

## High-frequency topics

- 

## Common mistakes

- [ ] 

## Time allocation


## Final review

`},{id:"meeting",title:"Meeting notes",summary:"Attendees, discussion, decisions, actions",markdown:`# {{title}}

> {{date}} {{time}}

## Attendees

- 

## Agenda

1. 

## Discussion


## Decisions

- 

## Action items

- [ ] `},{id:"reading",title:"Reading notes",summary:"Key ideas, highlights, personal thoughts",markdown:`# {{title}}

> {{date}}

## Book info

- Author: 
- Chapter: 

## Key ideas

- 

## Highlights

> 

## My thoughts


## Takeaways

- [ ] `},{id:"weekly",title:"Weekly plan",summary:"Weekly goals, focus tasks, retrospective",markdown:`> {{date}}

## Goals this week

- [ ] 

## Focus tasks

1. 

## Daily schedule

- Mon: 
- Tue: 
- Wed: 
- Thu: 
- Fri: 
- Weekend: 

## Retrospective

`},{id:"cornell",title:"Cornell notes",summary:"Cues, notes and summary layout",markdown:`> {{date}}

## Cues

- 

## Notes


## Summary

`},{id:"literature",title:"Literature notes",summary:"Source info, question, method, findings",markdown:`# {{title}}

> {{date}}

## Source

- Title: 
- Authors: 
- Venue / DOI: 
- Year: 

## Research question


## Method


## Key findings

- 

## Limitations and questions

- 

## Relevance to my work

`}];function ye(e){return e?.toLowerCase().startsWith("zh")?K:X}function Y(e,n){try{return n.toLocaleDateString(e||void 0,{year:"numeric",month:"2-digit",day:"2-digit"})}catch{return n.toLocaleDateString()}}function z(e,n){try{return n.toLocaleTimeString(e||void 0,{hour:"2-digit",minute:"2-digit"})}catch{return n.toLocaleTimeString()}}function I(e,n={}){const t=n.now??new Date,r={date:n.date??Y(n.locale,t),time:n.time??z(n.locale,t),title:n.title??""};return Q(e.replace(/\{\{\s*(date|time|title)\s*\}\}/g,(s,i)=>r[i]))}function Q(e){return e.replace(/^(\s*[-*+] \[[ xX]\])[ \t]*$/gm,"$1 <br />")}function he(e,n,t,r="append"){const s=I(n,t).trim();if(!s)return e;if(r==="replace")return`${s}
`;if(!e.trim())return`${s}
`;const i=e.endsWith(`
`)?`
---

`:`

---

`;return`${e}${i}${s}
`}function _e(e,n){const t={};for(const r of Object.keys(n))Object.keys(e).some(s=>s.trim().toLowerCase()===S[r])||(t[r]=n[r]);return j(e,t)}async function ge(e,n,t,r,s){const i=e.getDocument();if(i.noteId!==n.noteId||i.revision!==n.revision||i.markdown!==n.markdown)throw new Error(c.t("notes:personalTemplates.errors.note_changed"));if(!t.trim())throw new Error(c.t("notes:personalTemplates.errors.empty_body"));if(r==="insert"){if(!e.insertDocument||!s)throw new Error(c.t("notes:personalTemplates.errors.no_selection",{defaultValue:"请先在编辑器中选择插入位置，再重新预览。"}));if(await e.insertDocument(t,n,s)===!1)throw new Error(c.t("notes:personalTemplates.errors.not_applied"));return}const m=t.trim(),u=r==="replace"||!n.markdown.trim()?`${m}
`:`${n.markdown}${n.markdown.endsWith(`
`)?`
---

`:`

---

`}${m}
`;if(await e.replaceDocument(u,n)===!1)throw new Error(c.t("notes:personalTemplates.errors.not_applied"))}const E=500,ee=100,we=100,Te=450;function Ae(e){return[...e].length}const O=/[\u0000-\u0008\u000A-\u001F\u007F]/;function Ee(e){return e.trim()?[...e].length>E?"too_long":O.test(e)?"control_chars":null:"empty"}function ve(e){const n=e.trim();return n?[...n].length>ee?"too_long":O.test(n)||n.includes("	")?"control_chars":null:"empty"}function Ne(e){const n=e.replace(/[\r\n]+/g," ").replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g,""),t=[...n];return t.length>E?t.slice(0,E).join(""):n}const h="notes.personalTemplates.v1",b="notes:personal-templates-changed";function L(e){if(!e||typeof e!="object"||Array.isArray(e)||Object.entries(e).some(([n,t])=>!Object.hasOwn(S,n)||!v(n,t)))throw new Error(c.t("notes:personalTemplates.errors.invalid_preset"))}function Ce(e,n){return n.trim()?e.find(t=>t.defaultForCourse===n.trim()):void 0}async function V(){const e=D?await a("get_setting",{key:h}):await M(h);if(e===null)return[];const n=JSON.parse(e);if(!Array.isArray(n)||!n.every(t=>t&&typeof t.id=="string"&&t.id.startsWith("personal:")&&typeof t.title=="string"&&typeof t.summary=="string"&&typeof t.markdown=="string"))throw new Error(c.t("notes:personalTemplates.errors.load_failed"));for(const t of n)if(t.learningPreset!==void 0&&L(t.learningPreset),t.defaultForCourse!==void 0&&!v("course",t.defaultForCourse))throw new Error(c.t("notes:personalTemplates.errors.invalid_stored_course"));return n}let _=Promise.resolve();function Se(e){const n=_.then(async()=>{const t=e.title.trim();if(!t||!e.markdown.trim())throw new Error(c.t("notes:personalTemplates.errors.required"));if(t.length>120)throw new Error(c.t("notes:personalTemplates.errors.title_too_long"));if(new TextEncoder().encode(e.markdown).byteLength>1048576)throw new Error(c.t("notes:personalTemplates.errors.body_too_large"));const r=await V(),s=r.find(d=>d.id===e.id);if(e.expectedRevision!==void 0&&(!s||(s.revision??0)!==e.expectedRevision))throw new Error(c.t("notes:personalTemplates.errors.version_conflict",{defaultValue:"模板已被修改，请重新选择模板并核对后再保存。"}));const i=e.defaultForCourse===void 0?s?.defaultForCourse:e.defaultForCourse.trim();if(i&&!v("course",i))throw new Error(c.t("notes:personalTemplates.errors.invalid_course"));const m=e.learningPreset??s?.learningPreset;m!==void 0&&L(m);const u={...s,id:e.id??`personal:${F()}`,title:t,summary:e.summary?.trim()??"",markdown:e.markdown,revision:(s?.revision??0)+1};if(i?u.defaultForCourse=i:delete u.defaultForCourse,m!==void 0&&(u.learningPreset=m),i)for(const d of r)d.id!==u.id&&d.defaultForCourse===i&&(delete d.defaultForCourse,d.revision=(d.revision??0)+1);const N=r.findIndex(d=>d.id===u.id);return N<0?r.push(u):r[N]=u,await k(h,JSON.stringify(r)),typeof window<"u"&&window.dispatchEvent(new Event(b)),u});return _=n.catch(()=>{}),n}function ke(e,n){const t=_.then(async()=>{const r=await V(),s=r.find(i=>i.id===e);if(s){if(n!==void 0&&(s.revision??0)!==n)throw new Error(c.t("notes:personalTemplates.errors.version_conflict",{defaultValue:"模板已被修改，请重新选择模板并核对后再保存。"}));await k(h,JSON.stringify(r.filter(i=>i.id!==e))),typeof window<"u"&&window.dispatchEvent(new Event(b))}});return _=t.catch(()=>{}),t}const ne=o.createContext(void 0),Pe=()=>o.useContext(ne),te=o.createContext(null),He=()=>o.useContext(te);export{me as A,W as N,b as P,G as a,q as b,we as c,ee as d,Te as e,E as f,fe as g,y as h,te as i,he as j,ge as k,de as l,Ae as m,ke as n,_e as o,Ce as p,ye as q,V as r,I as s,Ne as t,Se as u,Pe as v,pe as w,He as x,ve as y,Ee as z};
