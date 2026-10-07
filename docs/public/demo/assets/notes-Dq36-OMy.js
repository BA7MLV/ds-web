const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./Switch-BbCc8Nkj.css","./UnifiedNotification-C8r-sH-B.css","./i18n-Bqupimfy.css","./vendor-katex-DSydD-fn.css","./Badge-DCWMtzTs.css","./sessionManager-CAtjYosb.css","./vendor-milkdown-DfpK-uhf.css","./notesChromeSlot-BOz0OoF5.css","./Tooltip-BBHBjTrk.css","./Progress-C3JvSlZK.css","./line-DYkQp71m.css","./NoteContentView-B42dO4S_.css","./AppMenu-Dvpdqb2x.css","./useMemoryRootFolder-BeJJ6U50.css","./SystemWindowShared-Dh8Yi1nc.css","./NotesWorkspaceApp-xRM1EpX8.css"])))=>i.map(i=>d[i]);
import{_ as L}from"./vite-runtime-B5U0W3t5.js";import{t as l}from"./i18n-C6-tUKoQ.js";import{c as N,h as P,d as j,r as R,g as q,l as V,a as F,M as ee,p as te}from"./i18nPatch-C0ClTGiL.js";const h="fd_demo_linear_algebra",z="fd_demo_la_mistakes",I="fd_demo_mlsys",ne=[{id:h,parentId:null,title:"线性代数",sortOrder:0},{id:z,parentId:h,title:"错题复盘",sortOrder:0},{id:I,parentId:null,title:"机器学习系统",sortOrder:1}],w="note_demo_eigen";function v(n){const t=new Date;return t.setDate(t.getDate()+n),`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}const oe=[{id:w,title:"特征值与特征向量",folderId:h,tags:["线性代数","期末复习"],favorite:!0,props:{study_course:"线性代数",study_chapter:"第 5 章",study_mastery:"learning",study_review_date:v(1),来源:"同济版教材 + 课堂笔记"},createdDaysAgo:9,updatedDaysAgo:0,content:`## 定义

设 $A$ 是 $n$ 阶方阵，若存在数 $\\lambda$ 和**非零**向量 $\\boldsymbol{x}$ 使

$$
A\\boldsymbol{x}=\\lambda\\boldsymbol{x}
$$

则称 $\\lambda$ 为 $A$ 的**特征值**，$\\boldsymbol{x}$ 为对应的**特征向量**。移项得齐次方程组 $(\\lambda E-A)\\boldsymbol{x}=\\boldsymbol{0}$，它有非零解当且仅当

$$
\\lvert \\lambda E-A\\rvert = 0
$$

这就是**特征方程**，左边是关于 $\\lambda$ 的 $n$ 次多项式（特征多项式）。行列式的展开技巧见 [[行列式的计算]]。

## 求解步骤

1. 写出特征多项式 $\\lvert \\lambda E-A\\rvert$，因式分解求出全部特征值 $\\lambda_1,\\dots,\\lambda_n$
2. 对每个 $\\lambda_i$，解齐次方程组 $(\\lambda_i E-A)\\boldsymbol{x}=\\boldsymbol{0}$
3. 基础解系就是属于 $\\lambda_i$ 的线性无关特征向量，全体非零线性组合即全部特征向量

## 重要性质

- 特征值之和等于迹：$\\sum_{i=1}^{n}\\lambda_i=\\operatorname{tr}A$
- 特征值之积等于行列式：$\\prod_{i=1}^{n}\\lambda_i=\\lvert A\\rvert$，所以 $A$ 可逆 $\\iff$ 没有零特征值
- 属于**不同**特征值的特征向量线性无关
- 若 $A\\boldsymbol{x}=\\lambda\\boldsymbol{x}$，则 $f(A)\\boldsymbol{x}=f(\\lambda)\\boldsymbol{x}$，例如 $A^{-1}$ 的特征值为 $\\dfrac{1}{\\lambda}$

> 易错：特征向量必须非零；同一个特征值的特征向量有无穷多个。错题见 [[错题复盘 · 第 5 章]]。

## 例题

求 $A=\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$ 的特征值。

$\\lvert \\lambda E-A\\rvert=(\\lambda-2)^2-1=(\\lambda-1)(\\lambda-3)$，所以 $\\lambda_1=1,\\ \\lambda_2=3$；对应特征向量 $(1,-1)^{\\mathrm T}$ 与 $(1,1)^{\\mathrm T}$。验算：$1+3=4=\\operatorname{tr}A$，$1\\times3=3=\\lvert A\\rvert$。

## 和后面章节的联系

- [[矩阵的相似对角化]]：有 $n$ 个线性无关的特征向量 $\\iff$ 可对角化
- [[二次型与正定矩阵]]：实对称矩阵的特征值决定二次型的标准形与正定性
- 机器学习里的 PCA 就是对协方差矩阵做特征分解，见 [[数据并行训练]] 前置的数学复习

## 待办

- [x] 整理课本例 5.3、5.5
- [ ] 做完习题 5-2 第 4、7、9 题
- [ ] 周五前把本章生成导图背一遍
`},{id:"note_demo_diag",title:"矩阵的相似对角化",folderId:h,tags:["线性代数"],props:{study_course:"线性代数",study_chapter:"第 5 章",study_mastery:"needs-review",study_review_date:v(-1)},createdDaysAgo:7,updatedDaysAgo:2,content:`## 相似

若存在可逆矩阵 $P$ 使 $P^{-1}AP=B$，称 $A$ 与 $B$ **相似**。相似矩阵有相同的特征多项式，因此特征值、迹、行列式、秩都相同。

## 可对角化的判定

- 充要条件：$A$ 有 $n$ 个线性无关的特征向量（回顾 [[特征值与特征向量]]）
- 充分条件：$A$ 有 $n$ 个互不相同的特征值
- 对每个 $k$ 重特征值 $\\lambda$，要求 $n-r(\\lambda E-A)=k$（几何重数 = 代数重数）

## 对角化步骤

1. 求出全部特征值与特征向量
2. 以特征向量为列拼出 $P=(\\boldsymbol{p}_1,\\dots,\\boldsymbol{p}_n)$
3. $P^{-1}AP=\\Lambda=\\operatorname{diag}(\\lambda_1,\\dots,\\lambda_n)$，**顺序要一一对应**

## 应用：求矩阵的幂

$$
A^{k}=P\\Lambda^{k}P^{-1}
$$

实对称矩阵还能用正交矩阵对角化，见 [[二次型与正定矩阵]]。
`},{id:"note_demo_det",title:"行列式的计算",folderId:h,tags:["线性代数","计算技巧"],props:{study_course:"线性代数",study_chapter:"第 1 章",study_mastery:"mastered"},createdDaysAgo:30,updatedDaysAgo:12,content:`## 常用方法

- **化三角形**：用行变换把行列式化成上三角，结果是主对角线乘积
- **按行（列）展开**：$D=\\sum_{j} a_{ij}A_{ij}$，优先选零多的一行
- **范德蒙德行列式**：$\\prod_{1\\le j<i\\le n}(x_i-x_j)$

## 性质速记

1. 两行互换，行列式变号
2. 某行乘 $k$，行列式乘 $k$
3. 某行的 $k$ 倍加到另一行，行列式不变
4. $\\lvert AB\\rvert=\\lvert A\\rvert\\lvert B\\rvert$，$\\lvert kA\\rvert=k^{n}\\lvert A\\rvert$

求特征多项式时经常要算含参数 $\\lambda$ 的行列式，技巧同上，见 [[特征值与特征向量]]。
`},{id:"note_demo_quadratic",title:"二次型与正定矩阵",folderId:h,tags:["线性代数","期末复习"],props:{study_course:"线性代数",study_chapter:"第 6 章",study_mastery:"unstarted",study_review_date:v(4)},createdDaysAgo:3,updatedDaysAgo:3,content:`## 二次型的矩阵表示

$$
f(\\boldsymbol{x})=\\boldsymbol{x}^{\\mathrm T}A\\boldsymbol{x},\\quad A^{\\mathrm T}=A
$$

## 化标准形

实对称矩阵 $A$ 一定存在正交矩阵 $Q$，使 $Q^{\\mathrm T}AQ=\\Lambda$。令 $\\boldsymbol{x}=Q\\boldsymbol{y}$，得标准形 $f=\\lambda_1y_1^2+\\dots+\\lambda_ny_n^2$——系数正是 [[特征值与特征向量]] 里求出的特征值。

## 正定的判定

- 全部特征值大于 0
- 顺序主子式全部大于 0（行列式算法见 [[行列式的计算]]）
- 存在可逆矩阵 $C$ 使 $A=C^{\\mathrm T}C$
`},{id:"note_demo_mistakes5",title:"错题复盘 · 第 5 章",folderId:z,tags:["错题","线性代数"],props:{study_course:"线性代数",study_chapter:"第 5 章",study_mastery:"needs-review",study_review_date:v(0)},createdDaysAgo:2,updatedDaysAgo:1,content:`## 题目

已知 $A^2=A$，求 $A$ 的特征值的可能取值。

## 我的错解

直接写 $\\lambda^2=\\lambda$，得 $\\lambda=1$，**漏了 $\\lambda=0$**。

## 正确思路

设 $A\\boldsymbol{x}=\\lambda\\boldsymbol{x}$，则 $A^2\\boldsymbol{x}=\\lambda^2\\boldsymbol{x}=A\\boldsymbol{x}=\\lambda\\boldsymbol{x}$，因 $\\boldsymbol{x}\\neq\\boldsymbol{0}$ 得 $\\lambda^2-\\lambda=0$，所以 $\\lambda\\in\\{0,1\\}$。

## 反思

- 解方程不能随手约掉 $\\lambda$
- 「矩阵多项式 → 特征值多项式」这条性质见 [[特征值与特征向量]]
`},{id:"note_demo_dp",title:"数据并行训练",folderId:I,tags:["机器学习系统","分布式"],props:{study_course:"机器学习系统",study_chapter:"第 3 章",study_mastery:"learning",study_review_date:v(6)},createdDaysAgo:14,updatedDaysAgo:4,content:`## 基本范式

1. 把一个 mini-batch 均分到 $K$ 个 worker，各自前向、反向得到局部梯度 $g_k$
2. 聚合：$g=\\frac{1}{K}\\sum_{k=1}^{K}g_k$，常用 [[AllReduce 通信原语]]
3. 每个 worker 用同一个 $g$ 更新参数，模型副本保持一致

## 同步的代价

- 每步都要等最慢的 worker（straggler）
- 通信量与参数量成正比，大模型下通信时间可能超过计算时间

## 优化方向

- 计算与通信重叠：反向传播一边算一边发送已完成层的梯度
- [[梯度压缩方法]]：量化、稀疏化，减少每步通信字节数
- 增大 batch 并配合学习率预热，降低通信频率
`},{id:"note_demo_allreduce",title:"AllReduce 通信原语",folderId:I,tags:["机器学习系统","分布式"],createdDaysAgo:13,updatedDaysAgo:5,content:`## Ring AllReduce

$K$ 个节点排成环，分两阶段：

1. **Reduce-Scatter**：$K-1$ 步后每个节点持有一段完整的归约结果
2. **All-Gather**：再 $K-1$ 步，把各段广播给所有节点

每个节点的通信量约为 $2\\cdot\\frac{K-1}{K}N$，与节点数基本无关，所以比参数服务器更易扩展。

用在 [[数据并行训练]] 的梯度聚合环节。
`},{id:"note_demo_compress",title:"梯度压缩方法",folderId:I,tags:["机器学习系统"],createdDaysAgo:10,updatedDaysAgo:8,content:`## 量化

把 32 位浮点梯度量化成 8 位甚至 1 位（signSGD），通信量降为 $\\frac{1}{4}$ 到 $\\frac{1}{32}$。

## 稀疏化

只发送绝对值最大的 top-$k$ 个分量，其余累积到本地残差，下一步再补发（误差反馈）。

## 代价

压缩引入噪声，可能要更多迭代才能收敛；与 [[AllReduce 通信原语]] 配合时需要支持稀疏格式。参见 [[数据并行训练]]。
`},{id:"note_demo_week",title:"本周学习计划",folderId:null,tags:["计划"],createdDaysAgo:2,updatedDaysAgo:0,content:`## 本周目标

- 线性代数第 5 章收尾，能独立做出对角化大题
- 机器学习系统读完第 3 章并整理笔记

## 安排

| 时间 | 内容 | 关联笔记 |
| --- | --- | --- |
| 周一 | 特征值例题 + 习题 5-2 | [[特征值与特征向量]] |
| 周三 | 相似对角化 | [[矩阵的相似对角化]] |
| 周五 | 第 3 章分布式训练 | [[数据并行训练]] |
| 周日 | 错题回顾、背导图 | [[错题复盘 · 第 5 章]] |

## 本周复盘

- [x] 周一任务完成
- [ ] 周三任务
- [ ] 周五任务
`}],E=864e5,D=Date.now(),s=new Map,f=new Map,u=new Map,_=new Map,B=new Map,x=new Map,O=new Map,y=new Map;function g(n,t,d=Date.now(),e=n.content,o={}){const r=y.get(n.id)??[],a={version_id:`nv_${n.id}_${r.length+1}_${++S}`,note_id:n.id,parent_version_id:r[0]?.version_id??null,restored_from_version_id:null,title:n.title,source:t,created_at:new Date(d).toISOString(),pinned:!1,content_md:e,tags:[...n.tags],...o},c=r[0];return t==="edit"&&c?.source==="edit"&&!c.pinned&&d-Date.parse(c.created_at)<3e5?r[0]={...a,version_id:c.version_id,parent_version_id:c.parent_version_id}:r.unshift(a),y.set(n.id,r),r[0]}function T(n){const{content_md:t,tags:d,...e}=n;return{...e,content_bytes:H.encode(t).length}}let S=0;for(const n of ne)u.set(n.id,{...n,isExpanded:!0,createdAt:D-40*E,updatedAt:D-40*E});for(const n of oe)s.set(n.id,{id:n.id,title:n.title,content:n.content,tags:[...n.tags],props:{...n.props??{}},isFavorite:!!n.favorite,createdAt:D-n.createdDaysAgo*E-36e5,updatedAt:D-n.updatedDaysAgo*E-6e5}),n.folderId&&_.set(`note:${n.id}`,n.folderId);for(const n of s.values()){const t=n.content.indexOf(`
## `,Math.floor(n.content.length/2));g(n,"created",n.createdAt,t>0?n.content.slice(0,t+1):n.content),g(n,"edit",n.updatedAt)}_.set(`mindmap:${F}`,h);_.set(`mindmap:${ee}`,I);function W(n){let t=2166136261;for(let d=0;d<n.length;d++)t=Math.imul(t^n.charCodeAt(d),16777619);return(t>>>0).toString(16).padStart(8,"0")}function m(n){return{id:n.id,path:`/${n.id}`,name:n.title,type:"note",size:new TextEncoder().encode(n.content).length,createdAt:n.createdAt,updatedAt:n.updatedAt,resourceId:`res_${n.id}`,sourceId:n.id,resourceHash:W(n.content+n.updatedAt),previewType:"markdown",metadata:{isFavorite:n.isFavorite,tags:[...n.tags],props:{...n.props}}}}function G(){return V().map(n=>({id:n.id,path:`/${n.id}`,name:n.title,type:"mindmap",createdAt:Date.parse(n.createdAt),updatedAt:Date.parse(n.updatedAt),resourceId:n.resourceId,sourceId:n.id,resourceHash:W(n.id+n.updatedAt),previewType:"mindmap",metadata:{description:n.description??null,isFavorite:n.isFavorite,defaultView:n.defaultView,theme:n.theme??null}}))}function p(n){return String(n??"").split("/").filter(Boolean).at(-1)??""}function A(n){const t=s.get(n);return t?m(t):G().find(d=>d.id===n)??null}function re(n){const t=s.get(p(n));if(!t)throw new Error(l("笔记不存在","Note not found"));return t}function M(n={},t){const d=n.types?.length?n.types:n.typeFilter?[n.typeFilter]:["note","mindmap"];let e=[];d.includes("note")&&e.push(...[...s.values()].map(m)),d.includes("mindmap")&&e.push(...G()),n.folderId&&(e=e.filter(i=>_.get(`${i.type}:${i.id}`)===n.folderId)),n.isFavorite&&(e=e.filter(i=>i.metadata.isFavorite)),n.tags?.length&&(e=e.filter(i=>{const $=i.metadata.tags??[];return n.tags.every(k=>$.includes(k))})),n.propFilters?.length&&(e=e.filter(i=>{const $=i.metadata.props??{};return n.propFilters.every(k=>String($[k.key]??"")===k.value)}));const o=(t??n.search??"").trim().toLocaleLowerCase();o&&(e=e.filter(i=>i.name.toLocaleLowerCase().includes(o)?!0:t===void 0?!1:!!(i.type==="note"?s.get(i.id)?.content:q(i.id))?.toLocaleLowerCase().includes(o)));const r=n.sortBy??"updatedAt",a=n.sortOrder==="asc"?1:-1;e.sort((i,$)=>r==="name"?i.name.localeCompare($.name,"zh-CN")*a:(i[r]-$[r])*a);const c=n.offset??0;return e.slice(c,c+(n.limit??1e3))}function U(n){const t=[];let d=0;for(const[e,o]of _){if(o!==n)continue;const[r,a]=e.split(":");(r==="note"?!s.has(a):!V().some(c=>c.id===a))||t.push({id:`fi_${r}_${a}`,folderId:n,itemType:r,itemId:a,sortOrder:d++,createdAt:D})}return t}function Y(n){return[...u.values()].filter(t=>t.parentId===n).sort((t,d)=>t.sortOrder-d.sortOrder).map(t=>({folder:t,children:Y(t.id),items:U(t.id)}))}function Q(n){for(const t of[...u.values()].filter(d=>d.parentId===n))Q(t.id);for(const[t,d]of[..._]){if(d!==n)continue;const[e,o]=t.split(":");if(e==="note"){const r=s.get(o);r&&f.set(o,r),s.delete(o)}else j(o);_.delete(t)}u.delete(n)}function de(n){const t=[];let d=n?u.get(n):void 0;for(;d;)t.unshift({id:d.id,title:d.title}),d=d.parentId?u.get(d.parentId):void 0;return t}const se=/\[\[([^\]|#\n]+)(?:#([^\]|\n]+))?(?:\|([^\]\n]+))?\]\]/g,H=new TextEncoder;function J(n){const t=[];for(const d of n.matchAll(se))t.push({title:d[1].trim(),heading:d[2]?.trim()??null,alias:d[3]?.trim()??null,position:H.encode(n.slice(0,d.index??0)).length});return t}function X(n){const t=n.toLocaleLowerCase();for(const d of s.values())if(d.title.toLocaleLowerCase()===t)return d}function ae(n){if(!s.get(n))return[];const d=[];for(const e of s.values())if(e.id!==n)for(const o of J(e.content))X(o.title)?.id===n&&d.push({sourceId:e.id,sourceTitle:e.title,heading:o.heading,alias:o.alias,position:o.position,sourceUpdatedAt:new Date(e.updatedAt).toISOString()});return d}function ie(n){const t=s.get(n);return t?J(t.content).map(d=>{const e=X(d.title);return{targetId:e?.id??null,targetTitle:d.title,heading:d.heading,alias:d.alias,position:d.position,linkType:"wikilink",resolved:!!e}}):[]}function b(n){n.updatedAt=Math.max(Date.now(),n.updatedAt+1)}function K(n,t,d,e,o){const r=`note_demo_new_${Date.now().toString(36)}${++S}`,a={id:r,title:n,content:t,tags:o??[],props:e??{},isFavorite:!1,createdAt:Date.now(),updatedAt:Date.now()};return s.set(r,a),d&&_.set(`note:${r}`,d),a}const C=()=>new Error(l("演示里不能读写本地文件，请在桌面版中使用。","Local files are available in the desktop app."));function Z(n,t){if(n==="vfs_create_mindmap"){const e=t.params??{},o=N(e.title||l("未命名导图","Untitled mind map"),e.content);return e.folderId&&u.has(e.folderId)&&_.set(`mindmap:${o.id}`,e.folderId),o}const d=P(n,t);if(d!==void 0)return d;switch(n){case"dstu_list":return M(t.options??{});case"dstu_search":return M(t.options??{},String(t.query??""));case"dstu_search_in_folder":return M({...t.options??{},folderId:String(t.folderId??"")},String(t.query??""));case"dstu_get":return A(p(t.path));case"dstu_get_resource_by_path":return A(p(t.path));case"dstu_get_path_by_id":return`/${String(t.id??t.resourceId??t.sourceId??"")}`;case"dstu_get_content":{const e=p(t.path),o=s.get(e);if(o)return o.content;const r=q(e);if(r!==null)return r;throw new Error(l("资源不存在","Resource not found"))}case"dstu_update":{const e=re(t.path),o=t.expectedUpdatedAtMs;return typeof o=="number"&&o<e.updatedAt,e.content=String(t.content??""),b(e),g(e,"edit"),m(e)}case"notes_update":{const e=t.note??{},o=s.get(String(e.id??""));if(!o)throw new Error(l("笔记不存在","Note not found"));return typeof e.content_md=="string"&&(o.content=e.content_md),b(o),g(o,"edit"),{id:o.id,updated_at:new Date(o.updatedAt).toISOString()}}case"dstu_create":{const e=t.options??{},o=e.folderId??t.folderId??null;if(e.type==="mindmap"){const c=N(e.name||l("未命名导图","Untitled mind map"),e.content);return o&&_.set(`mindmap:${c.id}`,o),A(c.id)}if(e.type&&e.type!=="note")throw C();const r=e.metadata??{},a=K(e.name||l("未命名笔记","Untitled note"),e.content??"",o,r.props??void 0,Array.isArray(r.tags)?r.tags:void 0);return m(a)}case"dstu_rename":{const e=p(t.path),o=String(t.newName??"").trim(),r=s.get(e);if(r)return r.title=o,b(r),m(r);if(R(e,o))return A(e);throw new Error(l("资源不存在","Resource not found"))}case"dstu_set_metadata":{const e=p(t.path),o=s.get(e),r=t.metadata??{};return o?(typeof r.title=="string"&&(o.title=r.title),Array.isArray(r.tags)&&(o.tags=r.tags.map(String)),r.props&&typeof r.props=="object"&&(o.props={...r.props}),typeof r.isFavorite=="boolean"&&(o.isFavorite=r.isFavorite),b(o),null):(typeof r.title=="string"&&R(e,r.title),null)}case"dstu_set_favorite":{const e=p(t.path),o=s.get(e);return o?o.isFavorite=!!t.favorite:P("vfs_set_mindmap_favorite",{mindmapId:e,isFavorite:t.favorite}),null}case"dstu_delete":case"dstu_soft_delete":{const e=p(t.path),o=s.get(e);return o?(f.set(e,o),s.delete(e)):j(e),null}case"dstu_delete_many":{const e=t.paths??[];for(const o of e)Z("dstu_delete",{path:o});return e.length}case"dstu_restore":case"dstu_trash_restore":{const e=p(t.path??t.id),o=f.get(e);if(!o)throw new Error(l("回收站里没有这项","Not in trash"));return f.delete(e),s.set(e,o),m(o)}case"dstu_list_deleted":case"dstu_list_trash":return[...f.values()].map(m);case"dstu_purge":case"dstu_permanently_delete":return f.delete(p(t.path??t.id)),null;case"dstu_purge_all":case"dstu_empty_trash":{const e=f.size;return f.clear(),e}case"dstu_move_to_folder":case"dstu_move":{const e=p(t.src??t.path),o=A(e),r=String(t.folderId??p(t.dst)??"");return o&&u.has(r)&&_.set(`${o.type}:${e}`,r),o}case"dstu_export_formats":return["markdown"];case"dstu_export":case"notes_import_markdown":case"notes_import_markdown_batch":throw C();case"dstu_folder_list":return[...u.values()];case"dstu_folder_get_tree":return Y(null);case"dstu_folder_get":return u.get(String(t.folderId??""))??null;case"dstu_folder_get_items":return U(t.folderId??null);case"dstu_folder_get_breadcrumbs":return de(t.folderId??null);case"dstu_folder_create":{const e=`fd_demo_${Date.now().toString(36)}${++S}`,o={id:e,parentId:t.parentId??null,title:String(t.title??l("新建文件夹","New folder")),isExpanded:!0,sortOrder:u.size,createdAt:Date.now(),updatedAt:Date.now()};return u.set(e,o),o}case"dstu_folder_rename":{const e=u.get(String(t.folderId??""));return e&&Object.assign(e,{title:String(t.title??e.title),updatedAt:Date.now()}),null}case"dstu_folder_delete":return Q(String(t.folderId??"")),null;case"dstu_folder_move":{const e=u.get(String(t.folderId??""));return e&&(e.parentId=t.newParentId??null),null}case"dstu_folder_set_expanded":{const e=u.get(String(t.folderId??""));return e&&(e.isExpanded=!!t.isExpanded),null}case"dstu_folder_add_item":case"dstu_folder_move_item":{const e=`${String(t.itemType)}:${String(t.itemId)}`,o=t.newFolderId??t.folderId??null;return o?_.set(e,o):_.delete(e),n==="dstu_folder_add_item"?{id:`fi_${e}`,folderId:o,itemType:t.itemType,itemId:t.itemId,sortOrder:0,createdAt:Date.now()}:null}case"dstu_folder_remove_item":return _.delete(`${String(t.itemType)}:${String(t.itemId)}`),null;case"dstu_folder_reorder":case"dstu_folder_reorder_items":return null;case"notes_list_tags":{const e=new Set;for(const o of s.values())o.tags.forEach(r=>e.add(r));return[...e]}case"notes_get_backlinks":return ae(String(t.noteId??""));case"notes_get_outgoing_links":return ie(String(t.noteId??""));case"notes_list_referencing_resource":return[];case"notes_relation_list":return[];case"notes_get_format":{const e=s.get(String(t.noteId??""));return{note_id:String(t.noteId??""),content_format:"markdown-legacy",format_version:1,serializer_version:"markdown-v1",required_capabilities:[],updated_at:new Date(e?.updatedAt??Date.now()).toISOString()}}case"notes_get_pref":return B.get(String(t.key??""))??null;case"notes_set_pref":return B.set(String(t.key??""),t.value),!0;case"notes_state_list":return[];case"notes_state_put":case"notes_state_delete":return null;case"notes_history_list":{const e=y.get(String(t.noteId??""))??[];return{items:(t.pinnedOnly?e.filter(r=>r.pinned):e).map(T),next_cursor:null}}case"notes_history_get":{const e=(y.get(String(t.noteId??""))??[]).find(o=>o.version_id===t.versionId);if(!e)throw new Error(l("版本不存在","Version not found"));return{...T(e),content_md:e.content_md,tags:e.tags,props:null,asset_refs:[],content_format:"markdown-legacy",format_version:1,serializer_version:"markdown-v1"}}case"notes_history_set_pinned":{const e=(y.get(String(t.noteId??""))??[]).find(o=>o.version_id===t.versionId);if(!e)throw new Error(l("版本不存在","Version not found"));return e.pinned=!!t.pinned,T(e)}case"notes_history_current":{const e=s.get(String(t.noteId??""));if(!e)throw new Error(l("笔记不存在","Note not found"));return{content_md:e.content,updated_at:new Date(e.updatedAt).toISOString(),title:e.title}}case"notes_history_restore_copy":case"notes_history_restore_selection_copy":{const e=s.get(String(t.noteId??"")),o=(y.get(String(t.noteId??""))??[]).find(i=>i.version_id===t.versionId);if(!e||!o)throw new Error(l("版本不存在","Version not found"));const r=t.selection,a=r?o.content_md.split(`
`).slice(r.start_line-1,r.end_line).join(`
`):o.content_md,c=K(l(`${e.title}（恢复的副本）`,`${e.title} (restored copy)`),a,null,{...e.props},[...e.tags]);return g(c,"restore_copy",Date.now(),a,{restored_from_version_id:o.version_id}),m(c)}case"notes_history_restore_current":{const e=s.get(String(t.noteId??"")),o=(y.get(String(t.noteId??""))??[]).find(a=>a.version_id===t.versionId);if(!e||!o)throw new Error(l("版本不存在","Version not found"));g(e,"before_restore",Date.now(),e.content,{pinned:!0});const r=t.selection;return e.content=r?o.content_md.split(`
`).slice(r.start_line-1,r.end_line).join(`
`):o.content_md,b(e),g(e,"edit",Date.now()+1,e.content,{restored_from_version_id:o.version_id,source:"edit"}),m(e)}case"notes_history_get_retention":case"notes_history_set_retention":return t.policy??{edit_bucket_seconds:300,max_edit_versions:null};case"start_enhanced_document_processing":throw new Error(l("生成卡片要调用你配置的模型，演示里没有连接模型，请在桌面版中使用。","Generating cards calls your configured model. Please use the desktop app."));case"quick_assistant_show":throw new Error(l("助手小窗是桌面版的独立窗口，请在桌面版中使用。","The assistant window is available in the desktop app."));case"notes_editor_register":case"notes_editor_heartbeat":return{participant_id:String(t.participantId??`pt_demo_${++S}`),expires_at:Math.floor(Date.now()/1e3)+60,active_lease:null};case"notes_editor_unregister":case"notes_editor_refresh_ack":return null;case"notes_editor_begin":{const e=`lease_demo_${++S}`,o=(t.noteIds??[]).map(String),r={token:e,operation_id:String(t.operationId??e),owner_id:String(t.participantId??""),phase:"ready",expires_at:Math.floor(Date.now()/1e3)+60,notes:o.map(a=>({note_id:a,updated_at:new Date(s.get(a)?.updatedAt??Date.now()).toISOString()})),waiting_for:[]};return x.set(e,r),r}case"notes_editor_lease_status":return x.get(String(t.token??""))??null;case"notes_editor_finish":{const e=String(t.lease?.token??""),o=x.get(e);return o&&(o.phase="finished"),o??null}case"notes_editor_freeze_ack":{const e=t.draft,o=String(t.lease?.token??"");return e&&typeof e.markdown=="string"&&O.set(o,e.markdown),null}case"notes_editor_flush":{const e=String(t.lease?.token??""),o=s.get(String(t.noteId??"")),r=O.get(e);return o&&r!==void 0&&(o.content=r,b(o)),o?{id:o.id,updated_at:new Date(o.updatedAt).toISOString()}:null}case"notes_editor_release":{const e=String(t.lease?.token??"");return x.delete(e),O.delete(e),null}case"insight_list":return[];case"memory_get_config":return{memoryRootFolderId:null,memoryRootFolderTitle:null};default:return}}const le={tabs:[{key:`note:${w}`,type:"note",id:w,title:"特征值与特征向量",pinned:!1},{key:"note:note_demo_diag",type:"note",id:"note_demo_diag",title:"矩阵的相似对角化",pinned:!1},{key:`mindmap:${F}`,type:"mindmap",id:F,title:"第 5 章 · 特征值与特征向量",pinned:!1}],activeTabKey:`note:${w}`,rightTabKey:null,focusedPane:"main",splitLayout:[50,50],backlinksOpen:typeof window<"u"&&window.innerWidth>=900,explorerOpen:!0,collapsedFolderPaths:[]},pe={title:"笔记",load:async()=>{const[{default:n},{createNotesDemoWindow:t}]=await Promise.all([L(()=>import("./NotesWorkspaceApp-DMfL6D1_.js").then(d=>d.N),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]),import.meta.url),L(()=>import("./NotesDemoWindow-Cjczl35-.js"),__vite__mapDeps([1]),import.meta.url)]);return t(n)},instanceKey:w,launchPayload:{resourceType:"note",resourceId:w},handle:Z,localStorage:{"workbench.notesWorkspace.state.v1":JSON.stringify(le)},namespaces:["common","notes","workbench","mindmap","vfs","dstu","backend_errors","graph_conflict","app_menu","translation"],prepare:te};export{pe as default};
