import{a as $}from"./vendor-i18n-AZLnIcSV.js";import{p as x}from"./EssayGradingWorkbench-Dkaly67a.js";function c(n,e){return $.t(`essay_grading:export.${n}`,e)}function w(n){return n.replace(/^#{1,6}\s*/,"").replace(/\*\*([^*]+)\*\*/g,"$1")}function l(n,e){return w(c(n,e))}function m(n){return n?$.t(`essay_grading:markers.error.${n}`,{defaultValue:n}):""}function b(n){return $.t(`essay_grading:score.grade.${n}`,{defaultValue:n.toUpperCase()})}function d(n){return $.t(`essay_grading:data_layer.export.${n}`)}function _(n){return n.replace(/\|/g,"\\|").replace(/\n/g," ")}function u(n){const o={del:"essay_grading:markers.delete",ins:"essay_grading:markers.insert",replace:"essay_grading:markers.replace",note:"essay_grading:markers.note",good:"essay_grading:markers.good"}[n];return o?$.t(o):""}function j(n){const e=[],o=t=>t.replace(/\s*\n\s*/g," ").trim();for(const t of n)switch(t.type){case"del":e.push({label:u("del"),body:`${o(t.content)}${t.reason?`（${o(t.reason)}）`:""}`});break;case"ins":e.push({label:u("ins"),body:o(t.content)});break;case"replace":e.push({label:u("replace"),body:`${o(t.oldText??"")} → ${o(t.newText??"")}${t.reason?`（${o(t.reason)}）`:""}`});break;case"err":{const s=m(t.errorType)||u("note");e.push({label:s,body:`${o(t.content)}${t.explanation?` — ${o(t.explanation)}`:""}`});break}case"note":e.push({label:u("note"),body:`${o(t.content)}${t.comment?` — ${o(t.comment)}`:""}`});break;case"good":e.push({label:u("good"),body:o(t.content)});break}return e.filter(t=>t.body.length>0)}function A(n,e,o){let t="";if(o?.includeOriginal&&e.trim()&&(t+=c("original_text")+`

`,t+=e.trim(),t+=`

---

`),!n.trim())return t+d("empty_result")+`
`;const s=x(n,!0);s.score&&(t+=S(s.score),t+=`

---

`),t+=c("grading_details")+`

`,t+=E(s.markers).trim()||d("empty_result"),t+=`

`;const r=j(s.markers);return r.length>0&&(t+=`---

`+d("corrections_title")+`

`,t+=r.map((p,g)=>`${g+1}. **${p.label}**：${p.body}`).join(`
`),t+=`

`),s.polishItems.length>0&&(t+=`---

`+c("polish_suggestions")+`

`,t+=I(s.polishItems),t+=`

`),s.modelEssay&&(t+=`---

`+c("model_essay")+`

`,t+=s.modelEssay,t+=`
`),t}function S(n){let e=c("score_title",{total:n.total,max:n.maxTotal,grade:b(n.grade)})+`

`;return n.dimensions.length>0&&(e+=c("table_header")+`
`,e+=c("table_separator")+`
`,n.dimensions.forEach(o=>{const t=o.comment?_(o.comment):"-";e+=`| ${_(o.name)} | ${o.score} | ${o.maxScore} | ${t} |
`})),e}function E(n){return n.map(e=>{switch(e.type){case"text":return e.content;case"del":{const o=e.reason?` (${c("delete_reason")}${e.reason})`:"";return`~~${e.content}~~${o}`}case"ins":return`**${e.content}**`;case"replace":{const o=e.reason?` (${e.reason})`:"";return`~~${e.oldText??""}~~ → **${e.newText??""}**${o}`}case"err":{const o=[];e.errorType&&o.push(m(e.errorType)),e.explanation&&o.push(e.explanation);const t=o.length>0?`(❌ ${o.join(": ")})`:"";return`${e.content}${t}`}case"note":return e.comment?`${e.content} (📝 ${e.comment})`:e.content;case"good":return`**${e.content}** (✨)`;case"pending":return e.content;default:return e.content}}).join("")}function I(n){return n.map((e,o)=>`${c("original_sentence",{index:o+1})}${e.original}

   ${c("polished_sentence")}${e.polished}
`).join(`
`)}function D(n,e,o){const t="----------------------------------------",s=[];if(o?.includeOriginal&&e.trim()&&s.push(`${l("original_text")}

${e.trim()}`),!n.trim())return s.push(d("empty_result")),s.join(`

${t}

`)+`
`;const r=x(n,!0);r.score&&s.push(M(r.score)),s.push(`${l("grading_details")}

${C(r.markers).trim()||d("empty_result")}`);const p=j(r.markers);if(p.length>0){const g=p.map((h,y)=>`${y+1}. [${h.label}] ${h.body}`).join(`
`);s.push(`${w(d("corrections_title"))}

${g}`)}if(r.polishItems.length>0){const g=r.polishItems.map((h,y)=>`${l("original_sentence",{index:y+1})}${h.original}
${l("polished_sentence")}${h.polished}`).join(`

`);s.push(`${l("polish_suggestions")}

${g}`)}return r.modelEssay&&s.push(`${l("model_essay")}

${r.modelEssay}`),s.join(`

${t}

`)+`
`}function M(n){const e=[l("score_title",{total:n.total,max:n.maxTotal,grade:b(n.grade)})];return n.dimensions.forEach(o=>{const t=o.comment?` — ${o.comment.replace(/\n/g," ")}`:"";e.push(`${o.name}: ${o.score}/${o.maxScore}${t}`)}),e.join(`
`)}function C(n){return n.map(e=>{switch(e.type){case"del":{const o=e.reason?`(${l("delete_reason")}${e.reason})`:"";return`${e.content}${o}`}case"ins":return e.content;case"replace":{const o=e.reason?` (${e.reason})`:"";return`${e.oldText??""} → ${e.newText??""}${o}`}case"err":{const o=[];return e.errorType&&o.push(m(e.errorType)),e.explanation&&o.push(e.explanation),o.length>0?`${e.content}(${o.join(": ")})`:e.content}case"note":return e.comment?`${e.content} (${e.comment})`:e.content;case"good":case"text":case"pending":default:return e.content}}).join("")}function a(n){return n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function H(n){return n.replace(/\n/g,"<br>")}const i={del:"color:#dc2626;text-decoration:line-through;text-decoration-color:rgba(248,113,113,0.7);",ins:"color:#059669;text-decoration:underline;text-decoration-color:rgba(52,211,153,0.7);",replaceOld:"color:#dc2626;text-decoration:line-through;",replaceNew:"color:#059669;",note:"color:#2563eb;border-bottom:1px dashed #60a5fa;",good:"color:#b45309;background:#fef3c7;border-radius:2px;padding:0 2px;",err:"color:#dc2626;text-decoration:underline wavy;text-decoration-color:rgba(248,113,113,0.6);text-underline-offset:4px;",heading:"font-size:18px;font-weight:600;margin:24px 0 12px;",tableCell:"border:1px solid #d1d5db;padding:6px 10px;text-align:left;"};function F(n,e,o){const t=[];if(o?.includeOriginal&&e.trim()&&(t.push(f(l("original_text"))),t.push(`<p style="white-space:pre-wrap;">${a(e.trim())}</p>`)),!n.trim())return t.push(`<p style="color:#6b7280;">${a(d("empty_result"))}</p>`),T(t);const s=x(n,!0);return s.score&&t.push(R(s.score)),t.push(f(l("grading_details"))),t.push(`<p style="line-height:1.9;">${P(s.markers)}</p>`),s.polishItems.length>0&&(t.push(f(l("polish_suggestions"))),t.push(v(s.polishItems))),s.modelEssay&&(t.push(f(l("model_essay"))),t.push(`<p style="white-space:pre-wrap;">${a(s.modelEssay)}</p>`)),T(t)}function T(n){return["<!DOCTYPE html>","<html>",`<head><meta charset="utf-8"><title>${a($.t("essay_grading:page_title"))}</title></head>`,`<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;color:#1f2328;max-width:720px;margin:0 auto;padding:32px 24px;font-size:15px;">`,...n,"</body>","</html>"].join(`
`)}function f(n){return`<h2 style="${i.heading}">${a(n)}</h2>`}function R(n){const e=[];if(e.push(f(l("score_title",{total:n.total,max:n.maxTotal,grade:b(n.grade)}))),n.dimensions.length>0){const t=l("table_header").split("|").map(r=>r.trim()).filter(Boolean).map(r=>`<th style="${i.tableCell}background:#f3f4f6;">${a(r)}</th>`).join(""),s=n.dimensions.map(r=>{const p=r.comment?r.comment.replace(/\n/g," "):"-";return`<tr><td style="${i.tableCell}">${a(r.name)}</td><td style="${i.tableCell}">${r.score}</td><td style="${i.tableCell}">${r.maxScore}</td><td style="${i.tableCell}">${a(p)}</td></tr>`}).join("");e.push(`<table style="border-collapse:collapse;margin:8px 0;"><thead><tr>${t}</tr></thead><tbody>${s}</tbody></table>`)}return e.join(`
`)}function P(n){return n.map(e=>{const o=a(e.content??"");switch(e.type){case"del":{const t=e.reason?` title="${a(e.reason)}"`:"";return`<del style="${i.del}"${t}>${o}</del>`}case"ins":return`<ins style="${i.ins}">${o}</ins>`;case"replace":return`<span${e.reason?` title="${a(e.reason)}"`:""}><del style="${i.replaceOld}">${a(e.oldText??"")}</del><span style="color:#9ca3af;"> → </span><span style="${i.replaceNew}">${a(e.newText??"")}</span></span>`;case"note":{const t=e.comment?` title="${a(e.comment)}"`:"";return`<span style="${i.note}"${t}>${o}</span>`}case"good":return`<span style="${i.good}">${o}</span>`;case"err":{const t=[];e.errorType&&t.push(m(e.errorType)),e.explanation&&t.push(e.explanation);const s=t.length>0?` title="${a(t.join(": "))}"`:"";return`<span style="${i.err}"${s}>${o}</span>`}case"text":case"pending":default:return H(o)}}).join("")}function v(n){return`<ul style="list-style:none;padding:0;margin:0;">${n.map((o,t)=>`<li style="margin-bottom:12px;"><div>${a(l("original_sentence",{index:t+1}))}${a(o.original)}</div><div style="color:#059669;">${a(l("polished_sentence"))}${a(o.polished)}</div></li>`).join("")}</ul>`}export{F as formatGradingResultAsHtml,D as formatGradingResultAsPlainText,A as formatGradingResultForExport};
