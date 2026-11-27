import{decodeUserAnswer as s}from"./questionBankApi-BLWh6TtX.js";import{h as d,k as f}from"./structured-CTXt6MmO.js";import"./i18n-D3qTCL3j.js";import{b as p}from"./vendor-i18n-CxOtV7Ik.js";function h(a,i){const o=i.trim();if(a.questionType==="true_false"&&(o==="true"||o==="false"))return p.t(`practice:batch.${o}`);const e=s(a.questionType,i);if(e?.type==="fill_blank")return e.blanks.map((r,t)=>`${t+1}. ${r}`).join(`
`);if(e?.type==="matching"){const r=d(a.structured_data);return e.pairs.map(t=>`${r?.left.find(n=>n.key===t.left)?.content??t.left} → ${r?.right.find(n=>n.key===t.right)?.content??t.right}`).join(`
`)}if(e?.type==="ordering"){const r=f(a.structured_data);return e.order.map((t,n)=>`${n+1}. ${r?.items.find(c=>c.key===t)?.content??t}`).join(`
`)}return i}export{h as p};
