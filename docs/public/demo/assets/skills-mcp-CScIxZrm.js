const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./UnifiedNotification-C8r-sH-B.css","./SystemWindowShared-Dh8Yi1nc.css","./i18n-Bqupimfy.css"])))=>i.map(i=>d[i]);
import{_ as k}from"./vite-runtime-B5U0W3t5.js";import{t as f}from"./i18n-C6-tUKoQ.js";const u="~/.deep-student/skills",d=(s,e)=>`---
name: ${s.name}
description: ${s.description}
version: ${s.version}
author: ${s.author}
tags: [${s.tags.join(", ")}]
---

${e.trim()}
`,g={"kaoyan-math-coach":{files:[{path:"SKILL.md",content:d({name:"考研数学错题教练",description:"针对考研数学一的错题做归因：先判断是概念、计算还是审题问题，再给出同类变式题与易错点清单。用户上传错题、问「为什么我总错这类题」时使用。",version:"1.2.0",author:"我",tags:["考研","高等数学","错题"]},`
# 考研数学错题教练

## 工作流程
1. 读题并复述已知条件，确认用户的错误答案与正确答案。
2. 归因：概念不清 / 计算失误 / 审题偏差 / 方法选择不当，四选一并说明依据。
3. 给出 1 道同类变式题，让用户先做；做完再讲评。
4. 把易错点整理成一张「错因 → 对策」小表，必要时建议做成闪卡。

## 风格
- 不直接给完整解答，先给提示；用户卡住两次再展开。
- 公式用 LaTeX，步骤编号。
`)},{path:"references/易错点清单.md",content:`# 高数易错点

- 洛必达法则使用前未验证 0/0 或 ∞/∞ 型
- 定积分换元忘记换上下限
- 多元函数可微与偏导存在混淆
`}]},"english-long-sentence":{files:[{path:"SKILL.md",content:d({name:"英语长难句拆解",description:"把考研 / 四六级阅读里的长难句拆成主干与修饰成分，标出从句类型和翻译顺序，最后给出通顺译文。",version:"2.0.1",author:"study-tools-lab",tags:["考研英语","阅读","语法"]},`
# 英语长难句拆解

1. 找谓语动词，确定主干（主谓宾 / 主系表）。
2. 用方括号标出从句、圆括号标出非谓语与介词短语。
3. 说明每个修饰成分修饰谁。
4. 按中文语序给出译文，并指出一个可以积累的表达。
`)}]},"organic-mechanism":{files:[{path:"SKILL.md",content:d({name:"有机化学反应机理",description:"用电子推动箭头逐步讲解亲核取代、消除、加成等有机反应机理，并对比 SN1 / SN2 / E1 / E2 的条件差异。",version:"0.9.3",author:"chem-notes",tags:["有机化学","反应机理"]},`
# 有机化学反应机理

- 每一步写出中间体，标明电子流向。
- 先判断底物级数、亲核试剂强弱、溶剂类型，再判断走哪条机理。
- 结尾用一张表对比四种机理的速率方程、立体化学与重排可能。
`)},{path:"scripts/draw_mechanism.py",content:`# 用 RDKit 画反应机理示意图（需要本机 Python 环境）
`}]}},c=[["linear-algebra-visual","线性代数几何直观","用二维 / 三维图像解释矩阵变换、特征向量与行列式的几何含义。","1.4.0",3812,"math-viz",412],["feynman-explainer","费曼学习法讲解员","让你用自己的话讲一遍概念，AI 找出讲不清的地方追问到底。","2.1.0",9604,"learn-better",1208],["ml-paper-reader","机器学习论文精读","按「问题—方法—实验—局限」四段结构精读一篇机器学习论文，并生成复习卡片。","1.0.6",5127,"paper-club",637],["kaoyan-politics-outline","考研政治知识框架","把马原、毛中特、史纲知识点整理成可背诵的框架与关键词。","3.0.2",7960,"exam-notes",889],["ielts-writing-coach","雅思写作教练","按 TR / CC / LR / GRA 四项评分标准给出修改建议与范文片段。","1.8.1",6245,"writing-desk",744],["pomodoro-planner","番茄学习计划","把一周的学习任务拆成番茄钟，结合待办自动排进日程。","0.7.0",2031,"focus-kit",198]],a=new Map(Object.entries(g).map(([s,{files:e}])=>[`${u}/${s}`,e.map(t=>({...t}))])),p=(s,e)=>new Error(f(`${s}请在桌面版中使用。`,`${e} is available in the desktop app.`)),w=s=>new TextEncoder().encode(s).length,m=s=>s.replace(/\/[^/]*$/,""),_=s=>{let e=2166136261;for(let t=0;t<s.length;t++)e=Math.imul(e^s.charCodeAt(t),16777619)>>>0;return e.toString(16).padStart(8,"0").repeat(8)};function h(s){const[e,t,n,r,o,i,l]=s;return{slug:e,displayName:t,summary:n,version:r,downloads:o,ownerHandle:i,stars:l,verify:{ok:!0,decision:"pass",reasons:[],slug:e,version:r,securityStatus:"clean",securityPassed:!0,publisherHandle:i,publisherDisplayName:i}}}function S(s,e,t){const n=t.filter(r=>r.path.startsWith("scripts/")).length;return{skill_id:s,path:e,files_extracted:t.length,scripts_count:n,references_count:t.filter(r=>r.path.startsWith("references/")).length,allowed_tools_count:0,package_sha256:_(s+t.map(r=>r.content).join("")),risk_level:n?"medium":"low",risk_signals:n?["包含脚本文件（scripts/）"]:[],requires:{bins:[],env:[],python_packages:[],invalid:[],missing_count:0}}}function $(s){const[,e,t,n,,r]=s;return[{path:"SKILL.md",content:d({name:e,description:t,version:n,author:r,tags:["社区市场"]},`# ${e}

${t}
`)}]}function y(s){return a.has(`${u}/${s}`)||c.some(e=>e[0]===s)}function L(s,e){switch(s){case"skill_list_directories":{const t=String(e.path??"");return t!==u?[]:[...a.keys()].map(n=>({name:n.slice(t.length+1),path:n}))}case"skill_read_file":{const t=String(e.path??""),n=a.get(m(t))?.find(r=>`${m(t)}/${r.path}`===t);if(!n)throw new Error(`File not found: ${t}`);return{content:n.content,path:t}}case"skill_list_package_files":return(a.get(String(e.path??""))??[]).map(n=>({path:n.path,size:w(n.content)}));case"skill_create":{const t=`${String(e.basePath??u)}/${String(e.skillId)}`;return a.set(t,[{path:"SKILL.md",content:String(e.content??"")}]),{content:e.content,path:`${t}/SKILL.md`}}case"skill_update":{const t=String(e.path??""),n=a.get(m(t));if(!n)throw new Error(`File not found: ${t}`);const r=n.find(o=>o.path==="SKILL.md");return r&&(r.content=String(e.content??"")),{content:e.content,path:t}}case"skill_delete":return a.delete(String(e.path??"").replace(/\/SKILL\.md$/,"")),null;case"chat_v2_set_skill_trust":{const t=String(e.packageRoot??""),n=a.get(t)??[];return{skill_id:e.skillId,trusted:!!e.trusted,package_sha256:e.trusted?_(t+n.map(r=>r.content).join("")):null}}case"skill_check_updates":return[{skillId:"english-long-sentence",checkable:!0,updateAvailable:!1,sourceKind:"skill_market",sourceSummary:"skill_market:english-long-sentence@2.0.1",currentSha256:_("english-long-sentence"),remoteSha256:null,currentVersion:"2.0.1",remoteVersion:"2.0.1",error:null}];case"skill_market_search":{const t=String(e.q??"").trim().toLowerCase(),n=c.filter(i=>!t||`${i[0]} ${i[1]} ${i[2]}`.toLowerCase().includes(t)),r=String(e.sort??"trending"),o=[...n].sort((i,l)=>r==="stars"?l[6]-i[6]:l[4]-i[4]);return{mode:t?"search":"browse",items:o.slice(0,Number(e.limit??30)).map(h)}}case"skill_market_skill_detail":{const t=c.find(r=>r[0]===e.slug);if(!t)throw new Error("not found");const n=h(t);return{...n,description:n.summary,ownerDisplayName:n.ownerHandle}}case"skill_market_verify":{const t=c.find(n=>n[0]===e.slug);if(!t)throw new Error("not found");return h(t).verify}case"skill_market_download_and_scan":{const t=c.find(o=>o[0]===e.slug);if(!t)throw new Error("not found");const n=$(t),r=`${u}/${t[0]}`;return e.install&&a.set(r,n),{slug:t[0],version:t[3],provenance:`skill_market:${t[0]}@${t[3]}`,tempZipPath:e.install?null:`/tmp/skill-market/${t[0]}.zip`,sourceKind:"skill_market",scan:S(t[0],r,n),installed:!!e.install}}case"skill_tap_catalog":case"skill_tap_install":throw p("从 GitHub 技能源安装需要联网，","Installing from a GitHub skill source");case"skill_import_zip":throw p("导入技能包要读取本机文件，","Importing a skill package");case"skill_export_tap":throw p("导出技能源要写入本机文件，","Exporting a skill source");case"skill_update_from_source":throw p("更新技能需要联网，","Updating a skill");default:return}}const v={"deep-student.skill-trust-overrides":JSON.stringify({"kaoyan-math-coach":{trust:"trusted",grantedAt:Date.now()-12*864e5},"english-long-sentence":{trust:"trusted",grantedAt:Date.now()-5*864e5}})},I={title:"技能与 MCP 扩展",load:()=>k(()=>import("./SkillsWindow-BahwfMfT.js"),__vite__mapDeps([0,1]),import.meta.url).then(s=>s.default),handle:L,localStorage:v,namespaces:["skills","workbench","mcp","settings","app_menu"],async prepare(){const{default:s}=await k(async()=>{const{default:n}=await import("./i18n-C6-tUKoQ.js").then(r=>r.i);return{default:n}},__vite__mapDeps([2]),import.meta.url),e=s.options.missingKeyHandler;if(typeof e!="function")return;const t=/^builtin(Names|Descriptions)\.(.+)$/;s.options.missingKeyHandler=(n,r,o,...i)=>{const l=r==="skills"?t.exec(o):null;l&&y(l[2])||e(n,r,o,...i)}}};export{I as default};
