import{_ as c}from"./vite-runtime-B5U0W3t5.js";import{a as d,D as p}from"./mockIpc-D216uQgL.js";import{a as u,f as m,D as h,r as g}from"./attachmentAssets-CYQ4Tr7T.js";import{t as n}from"./i18n-D3qTCL3j.js";async function f(){const{default:r}=await c(async()=>{const{default:t}=await import("./vendor-docx-CV-TY9-w.js").then(o=>o.j);return{default:t}},[],import.meta.url),e=new r;e.file(u,m(),{base64:!0});for(const t of h)e.file(t.name,await g(t.svg),{base64:!0});e.file(n("双语阅读原文.txt","Bilingual-Reading-Source.txt"),d);const i=n("提问与资料","Prompts-and-Sources");for(const t of p){const o=t.followUp.flatMap(a=>a.toolOutput?.sources??[]),s=[`# ${t.meta.title}`,n("## 开始提问","## Opening Prompt"),t.autoPrompt??"",n("## 继续探究","## Follow-up Prompts"),...(t.continuations??[]).map(a=>`### ${a.label}

${a.prompt}`),n("## 材料与来源","## Materials & Sources"),...o.map(a=>`### ${a.title}

${a.snippet??""}

${a.url?.startsWith("https://")?a.url:""}`)].join(`

`),l=(t.meta.title??t.meta.id).replace(/[\\/:*?"<>|]/g,"-");e.file(`${i}/${l}.md`,s)}return e.file(n("从这里开始.md","Start-Here.md"),n(`# 在 Deep Student 中继续学习

这个材料包包含三张高数习题图片、一份 60 页的数据并行教学样本、英文阅读原文，以及六组提问与来源摘录。PDF 与习题图片由项目编写，供练习和功能体验使用。第 45、47、52 页对应数据并行、同步训练与通信优化。

## 准备工作

打开桌面版，配置可用的对话模型。图片阅读需要模型支持视觉输入；研究综述需要配置网络与学术检索服务。出题需要在模型分配中选择可用的题目生成模型。外部模型服务会按你的选择接收提问与相关材料。

## 从材料开始

1. PDF 精读：把 PDF 加入学习资源，再引用到对话，粘贴对应提问。请模型给出页码引用、章节导图、挖空卡片和自测题。
2. 错题制卡：将三张 PNG 加入对话。把对应的来源摘录存成自己的学习笔记，供知识库检索引用；选择问答卡模板生成五张卡片。
3. 研究综述：将每天 90 分钟复习、先回忆再核对的偏好存入记忆。启用记忆、网络与学术检索能力，按来源链接检查论文和开源项目。
4. 周度学习看板：在提问中提供自己的材料记录，启用交互界面能力，生成材料清单与复习安排。
5. 知识点出题：在学习资源中新建「数据并行训练」题目集，将它引用到对话，启用题库工具。生成草稿后勾选题目，点击「加入所选」；打开题目集，进入练习并提交选项，结合答案解析回顾知识点。再次打开题目集可以查看作答记录。
6. 双语阅读：将英文原文和术语要求粘贴到对话，启用交互界面能力，请模型生成带复制操作的双语表格。在会话底部展开产物并复制到自己的笔记。

## 接着做下去

每份提问文件都附有进一步探究的问题。按需选择卡片模板、题库工具、交互界面等技能；这些能力可以在对话的技能入口启用。卡片可在桌面版保存和导出，连接本机 Anki 后可同步。

网页中的内容由预设材料与回答驱动，交互使用桌面版组件。网页收录的数据保留在本次访问的内存中。桌面版调用你配置的模型与工具，输出措辞、检索排序和布局会随模型与资料变化；这里提供复现输入与操作步骤。
`,`# Continue Learning in Deep Student

This starter pack includes three calculus mistake images, a 60-page sample textbook on data-parallel training, an English reading passage, and six sets of prompts and source excerpts. The PDF and problem images are authored for practice and feature walkthroughs. Pages 45, 47, and 52 cover data parallelism, synchronous training, and communication optimization.

## Setup

Open the desktop app and configure a chat model. Image reading requires a vision-capable model; research reviews require web and academic search services; question generation requires assigning a question-generation model in Model Assignments. Your chosen external model provider receives the prompts and attached materials.

## Where to Start

1. PDF Deep Read: Add the PDF to your Library, reference it in Chat, and paste the matching prompt to generate page citations, a chapter mind map, cloze cards, and self-check questions.
2. Mistakes to Flashcards: Attach the three PNGs in Chat, save the matching source excerpts as notes for knowledge-base retrieval, and select the Q&A Card template to generate five cards.
3. Research Review: Save your 90-minute daily review habit and recall-first preference into Memory. Enable Memory, Web Search, and Academic Search, then inspect the original papers and open-source repos via links.
4. Weekly Study Dashboard: Provide your weekly material notes in the prompt and enable Interactive UI to generate a material checklist and next review plan.
5. Practice Question Generation: Create a "Data-Parallel Training" question bank in the Library, reference it in Chat with Question Bank tools enabled, select generated drafts, and click "Add Selected" to practice with explanations.
6. Bilingual Reading: Paste the passage and terminology rules into Chat with Interactive UI enabled to generate a copyable bilingual table and glossary.

## Keep Going

Each prompt file includes follow-up questions. Enable card templates, question-bank tools, or Interactive UI from the skills menu in Chat as needed. In the desktop app, cards can be saved, exported to APKG, and synced with AnkiConnect.

The web demo runs on scripted materials using the same desktop UI components, keeping saved items in memory for the current session. The desktop app calls your configured models and tools, so phrasing, retrieval ranking, and layout will adapt to your setup.
`)),e.generateAsync({type:"blob",compression:"DEFLATE"})}async function D(){const r=URL.createObjectURL(await f()),e=document.createElement("a");e.href=r,e.download=n("DeepStudent-学习材料.zip","DeepStudent-Study-Materials.zip"),document.body.appendChild(e),e.click(),e.remove(),setTimeout(()=>URL.revokeObjectURL(r),6e4)}export{f as buildDemoMaterials,D as downloadDemoMaterials};
