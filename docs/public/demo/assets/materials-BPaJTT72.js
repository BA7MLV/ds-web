import{_ as r}from"./vite-runtime-B5U0W3t5.js";import{a as s,l,D as u,r as c,c as p,b as m}from"./demo-DWkb0iTR.js";async function f(){const{default:a}=await r(async()=>{const{default:e}=await import("./vendor-docx-DzyWNocJ.js").then(n=>n.j);return{default:e}},[],import.meta.url),t=new a;t.file(s,l(),{base64:!0});for(const e of u)t.file(e.name,await c(e.svg),{base64:!0});t.file("双语阅读原文.txt",p);for(const e of m){const n=e.followUp.flatMap(o=>o.toolOutput?.sources??[]),i=[`# ${e.meta.title}`,"## 开始提问",e.autoPrompt??"","## 继续探究",...(e.continuations??[]).map(o=>`### ${o.label}

${o.prompt}`),"## 材料与来源",...n.map(o=>`### ${o.title}

${o.snippet??""}

${o.url?.startsWith("https://")?o.url:""}`)].join(`

`);t.file(`提问与资料/${e.meta.title}.md`,i)}return t.file("从这里开始.md",`# 在 Deep Student 中继续学习

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
`),t.generateAsync({type:"blob",compression:"DEFLATE"})}async function E(){const a=URL.createObjectURL(await f()),t=document.createElement("a");t.href=a,t.download="DeepStudent-学习材料.zip",document.body.appendChild(t),t.click(),t.remove(),setTimeout(()=>URL.revokeObjectURL(a),6e4)}export{f as buildDemoMaterials,E as downloadDemoMaterials};
