# 下载页改版：搬 openchamber 的版面语言

日期：2026-09-17
状态：已实现（桌面 1440 / 平板 1100 / 手机 390 × 亮暗两套均已核对，`npm test` 14/14，生产构建 exit=0）

## 背景

用户要求「下载页面，这个我想学习 openchamber 的样式」。参考站是 `openchamber.dev/download`，
落地页那轮已经拆解过它的设计系统（见 `2026-09-15` 工作日志）。

## 已确认决策

| 决策点 | 结论 |
|---|---|
| 学习范围 | **只搬结构与版式**，配色仍走现有 Apple 黑白灰（`--lp-*`），不引入赤陶橙 |
| 页面版式 | **保留文档页布局**（左侧栏 + 右侧目录 + `.vp-doc`），不改成独立落地页 |
| 国内镜像 | 顺手补上：`downloads.json` 里一直有 `mirrorUrl`，旧页面完全没用 |

## 一、参考站的结构，以及我们的对应做法

参考站的下载页是「版面驱动」的：一行一个平台（平台名 + 版本徽标 + Download），
发丝线分隔，代码片段带 Copy，最后接 FAQ 折叠。旧页面走的是另一路——
品牌色描边的圆角卡片 + `::: tip` 提示块，属于文档写法。

| 参考站 | 我们 |
|---|---|
| `Get OpenChamber.` 标题 + 一句说明 | `# 下载` + 一句说明 + 当前版本/发布日期 |
| Desktop 一组平台行 | `## 桌面端` + 3 行（macOS ARM / macOS Intel / Windows x64） |
| Mobile Beta | `## 移动端` + 1 行（Android ARM64） |
| Browser + PWA（代码片段 + Copy） | `## 安装说明` + macOS 的 `xattr` 命令带 Copy |
| Editor Extensions | —（我们没有编辑器扩展，不硬凑） |
| Download FAQ 折叠 | `## 常见问题` + 复用首页那套 `.lp-faq` 折叠，5 条 |

参考站的 Browser + PWA 那栏放的是「用命令装」，我们是桌面应用，对应位置改成
**通道说明**（`## 全部版本`：GitHub Releases / 国内镜像两条通道 + 历史版本在哪看）。

## 二、「一行一个安装包」怎么写

一行三列，`grid-template-columns: minmax(0,1fr) auto auto`：

```
macOS  Apple Silicon        v0.9.61  78.1 MB      [下载] [国内镜像]
M 系列芯片的 Mac
```

- 左：平台名（600）+ 架构（次级色）。照参考站的 `Linux (arm64)`，只是换成色差而不是括号。
- 中：版本徽标（pill）+ 体积（等宽字体、三级色）。
- 右：主按钮（实心 pill）+ 次按钮（描边 pill，指向镜像）。
- **不给行标「推荐」**：`navigator.userAgent` 认不出芯片架构（Safari 的 UA 里没有），
  标错了等于把人引去下错的包。推荐只在顶部那块给，且 macOS 一律两个按钮都摆出来。
- 数据里缺失的产物整行过滤掉（`buildRows()`），不留点下去必然 404 的按钮。

## 三、顺手补的两个洞

1. **国内镜像**：`mirrorUrl` 一直躺在 `downloads.json` 里没人用，而页面的 `description`
   早就写着「提供国内镜像下载」。现在每个安装包都有第二个入口。
2. **直链下载不再 `target="_blank"`**：GitHub 的 release 下载地址会 302 到对象存储并带
   `Content-Disposition: attachment`，浏览器本来就在原地下载；加 `target` 只会多闪一个空标签页。
   要保留 `target` 的是「GitHub Releases 发布页」那种真跳页面的链接。

## 四、关键坑：`.vp-doc` 的元素级规则压过单类选择器

**这是这次最费时间的一处。**

下载页是文档页，正文裹在 `.vp-doc` 里，而 VitePress（以及本项目的 `custom.css`）
对正文元素写的是元素级规则：

| 规则 | 具体度 | 效果 |
|---|---|---|
| `.vp-doc ul` | (0,1,1) | 补 20px 左缩进 + 圆点标记 |
| `.vp-doc p` | (0,1,1) | 补 16px 上下边距 |
| `.vp-doc li + li` | (0,1,2) | 每条补 8px 上边距 |
| `.vp-doc a` | (0,1,1) | 颜色 + 下划线 |
| `.dark .vp-doc a` | **(0,2,1)** | 深色下链接强制白色 |
| `.vp-doc :not(pre) > code` | (0,1,2) | 行内代码补灰底 + 内边距 |

我们新写的 `.dl-*` 都是单类（0,1,0），**一律压不过它们**。症状很阴：

- **行列表看起来是好的** —— 因为 `.dl-row` 是 grid 容器，本来就不生成列表标记，
  20px 缩进也被 grid 列宽吃掉了。所以第一轮截图完全没看出问题。
- 换成普通列表（「系统要求」那一组）立刻露馅：圆点、缩进全回来了。
- 更狠的是深色模式下的主按钮：`.dark .vp-doc a`（0,2,1）把白色药丸上的文字也刷成白色，
  **按钮直接变成一块空板**。这个在浅色下完全看不出来。

### 解法

整块选择器**全部带 `.vp-doc` 前缀**（0,2,0 起），并且：

- 按钮颜色单独写成 `.vp-doc a.dl-btn`（0,2,1），与 `.dark .vp-doc a` 同具体度，
  靠**源码顺序**取胜（本文件在主题样式之后加载）。只写 `.vp-doc .dl-btn` 是不够的。
- `.vp-doc .dl-btn--ghost:hover` 必须排在 `.vp-doc .dl-btn:hover` **后面**：
  两者同具体度，顺序决定谁写 hover 底色，否则描边按钮 hover 会拿到实心底色。

### 连带修正：落地页基元进文档页

`.lp-eyebrow`、`.lp-faq__answer` 这些 `lp-*` 基元是给落地页（`.vp-doc` 外面）设计的，
搬进文档页后会被 `.vp-doc p` 拿回 16px 边距，需要显式归零。同理 `.lp-faq` 的题干包在
`<h3>` 里（语义正确），但 `.vp-doc h3` 自带字号与 32px 上边距，也要归零。

**结论：`lp-*` 可以跨用，但跨到 `.vp-doc` 里面时必须补一条重置。**

## 五、新增文件

| 文件 | 职责 |
|---|---|
| `theme/utils/downloads.js` | 数据整形：平台行、体积/日期格式化、设备识别、推荐位 |
| `theme/components/DownloadPick.vue` | 顶部推荐位（眉标 + 主/次按钮 + 等宽元信息） |
| `theme/components/DownloadRows.vue` | 一组平台行，`group="desktop｜mobile"` |
| `theme/components/CopyLine.vue` | 命令行 + 复制按钮 |
| `theme/components/DownloadFaq.vue` | 下载向 FAQ，复用 `.lp-faq` |
| `theme/custom.css` | 新增 `.dl-*` 语义类（整块 `.vp-doc` 前缀） |

`docs/download.md` 重写为「脚本引入组件 + Markdown 标题」的形式：
**标题留在 Markdown 里**，右侧目录与侧边栏才认得（组件里的 `<h3>` 不进目录）。

## 六、几个刻意的取舍

1. **发布日期固定 `Asia/Shanghai`**：默认行为跟运行环境时区走，服务端构建（Node）与浏览器
   可能不在同一时区，同一个时间戳会渲染出两种字符串，客户端水合报不一致。
   固定时区后 `v0.9.61` 的 `2026-09-12T18:11Z` 稳定显示为「2026年9月13日」。
2. **设备识别放在 `onMounted`**：SSR 里没有 `navigator`，在 setup 顶层算会让服务端渲染成
   「认不出设备」、客户端变成「macOS」，水合两边对不上。代价是推荐位在挂载后补上
   （与首页演示区 `AppShell` 同款处理）。首屏对应位置上不会出现错误文案 —— 眉标只写「推荐」。
3. **组件里的文案直接写中文**：`download.md` 本身只有中文版，`i18n/messages` 是给落地页与
   全站组件用的，加进去会让 `tests/i18n-messages.test.mjs` 要求英文表也补一份 key。
   将来做英文文档页时，这几处要一起抽成消息表。

## 七、验证

- `npm test` 14/14；四个 SFC 用 `@vue/compiler-sfc` 校验通过；生产构建 `exit=0`。
- 无头 Chrome + CDP 断言（不只看图）：
  - 行数 4、镜像链接 4、FAQ 条目 5、`.dl-row` 列数 3 → 手机上塌成 1 列；
  - 浅色 `.dl-btn` = 白字黑底、深色 = 黑字白底（修 `.dark .vp-doc a` 那步的依据）；
  - `.dl-notes` 的 `list-style: none` / `padding-left: 0` / `li` 的 `margin-top: 0` 真的生效；
  - 点按钮 → 文案变「开始下载…」，点复制 → 「已复制」且 `aria-label` 同步；
  - 手机 390 下溢出元素 0 个。
- SSR 与客户端渲染的 `.dl-version` / `.dl-tag` 文本逐字一致（无水合风险）。

## 可调参数

- `theme/utils/downloads.js`：平台行的平台名/架构/说明文案，`DESKTOP_ROWS` / `MOBILE_ROWS`。
- `theme/custom.css`：`.dl-btn` / `.dl-tag` 的 `--dl-solid-bg|fg`（亮暗两套）、
  `.dl-row` 的三列栅格与断点（700px 塌单列）。
- `DownloadFaq.vue`：FAQ 条目数组。

## 后续调整（2026-09-17，同日）

用户复查后判定「解释性文案多余」，删掉四处、只留版面本身：

| 位置 | 处理 | 理由 |
|---|---|---|
| `# 下载` 下的首段（「装进你已有的那台机器…哪个快用哪个」） | 删 | 标题下就是推荐位按钮，这句只是复述 |
| `## 桌面端` 的导语（「完整的桌面应用…见文末常见问题」） | 删 | 芯片怎么选写在每行的 note 与 FAQ 第 2 条里 |
| `## 移动端` 的导语（「Android…不需要应用商店」） | 删 | 同一句话在行 note 与「系统要求」里各有一份 |
| `## 全部版本` 整节（导语 + 两条通道） | 删 | 每个安装包行本来就带「下载 / 国内镜像」两个按钮 |

删「全部版本」会带走唯一的历史版本入口，所以 FAQ 第 5 条的答案改成
「……需要历史版本的话：」+ 一条内联链接指向 GitHub Releases 发布记录
（`DownloadFaq.vue` 的条目新增可选 `link: { href, text }`，模板里内联渲染，
不额外起一段）。国内镜像的说明仍在 FAQ 第 3 条，没有丢。

保留：`推荐` 那块按钮（主入口）、`当前版本 / 发布于` 一行、每行的 note。

### 这一轮的验证边界

`npm test` 14/14；三个 SFC 用 `@vue/compiler-sfc` 校验通过。
**生产构建与截图没跑成** —— 本机沙箱拦下了 Vite 加载配置时对 `.env` 的读取
（`loadEnv` → `readFileSync` 需人工放行，超时被 block），与本次改动无关。
所以「删完之后版面是否还站得住」需要本地补一次 `npm run dev` + `npm run build` 复核，
重点看两处：`## 桌面端` 紧跟行列表会不会显得顶、页首去掉导语后是否过空。

## 后续可做

- 英文文档落地后，把四个组件里的中文抽进 `i18n/messages/`。
- 「全部版本」目前只是两条通道说明，没有版本历史列表；如果以后需要按版本回滚，
  可以拿 `downloads.json` 的 `releaseUrl` 拼一个版本选择器。
