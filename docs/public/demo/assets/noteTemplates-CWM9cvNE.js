import"./i18n-ClNheWgt.js";import{L as c,d}from"./noteLearningProps-hBROs2sx.js";import{b as a}from"./vendor-i18n-CxOtV7Ik.js";const s=500,p=100,N=100,A=450;function L(e){return[...e].length}const l=/[\u0000-\u0008\u000A-\u001F\u007F]/;function C(e){return e.trim()?[...e].length>s?"too_long":l.test(e)?"control_chars":null:"empty"}function O(e){const n=e.trim();return n?[...n].length>p?"too_long":l.test(n)||n.includes("	")?"control_chars":null:"empty"}function S(e){const n=e.replace(/[\r\n]+/g," ").replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g,""),t=[...n];return t.length>s?t.slice(0,s).join(""):n}const f=[{id:"lecture",title:"听课笔记",summary:"目标、核心概念、例题推导与课后问题",markdown:`> {{date}}

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

`}],g=[{id:"lecture",title:"Lecture notes",summary:"Goals, core concepts, derivations, follow-ups",markdown:`> {{date}}

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

`}];function D(e){return e?.toLowerCase().startsWith("zh")?f:g}function y(e,n){try{return n.toLocaleDateString(e||void 0,{year:"numeric",month:"2-digit",day:"2-digit"})}catch{return n.toLocaleDateString()}}function h(e,n){try{return n.toLocaleTimeString(e||void 0,{hour:"2-digit",minute:"2-digit"})}catch{return n.toLocaleTimeString()}}function w(e,n={}){const t=n.now??new Date,r={date:n.date??y(n.locale,t),time:n.time??h(n.locale,t),title:n.title??""};return T(e.replace(/\{\{\s*(date|time|title)\s*\}\}/g,(o,i)=>r[i]))}function T(e){return e.replace(/^(\s*[-*+] \[[ xX]\])[ \t]*$/gm,"$1 <br />")}function R(e,n,t,r="append"){const o=w(n,t).trim();if(!o)return e;if(r==="replace")return`${o}
`;if(!e.trim())return`${o}
`;const i=e.endsWith(`
`)?`
---

`:`

---

`;return`${e}${i}${o}
`}function v(e,n){const t={};for(const r of Object.keys(n))Object.keys(e).some(o=>o.trim().toLowerCase()===c[r])||(t[r]=n[r]);return d(e,t)}async function $(e,n,t,r,o){const i=e.getDocument();if(i.noteId!==n.noteId||i.revision!==n.revision||i.markdown!==n.markdown)throw new Error(a.t("notes:personalTemplates.errors.note_changed"));if(!t.trim())throw new Error(a.t("notes:personalTemplates.errors.empty_body"));if(r==="insert"){if(!e.insertDocument||!o)throw new Error(a.t("notes:personalTemplates.errors.no_selection",{defaultValue:"请先在编辑器中选择插入位置，再重新预览。"}));if(await e.insertDocument(t,n,o)===!1)throw new Error(a.t("notes:personalTemplates.errors.not_applied"));return}const m=t.trim(),u=r==="replace"||!n.markdown.trim()?`${m}
`:`${n.markdown}${n.markdown.endsWith(`
`)?`
---

`:`

---

`}${m}
`;if(await e.replaceDocument(u,n)===!1)throw new Error(a.t("notes:personalTemplates.errors.not_applied"))}export{N,p as a,A as b,s as c,R as d,$ as e,L as f,v as g,D as h,C as i,w as r,S as s,O as v};
