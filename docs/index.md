# 项目简介
![主图](/deepstudent-head.png)

---

<div style="text-align: center;">
    <p>关注我们的小红书账号：<a href="https://www.xiaohongshu.com/user/profile/648898bb0000000012037f8f?xsec_token=ABFtyTy-x0Maimelyl74sy1awqRq0TG5s7HwllwakTIkg%3D&xsec_source=pc_search">小红书</a></p>
    <p>加入我们的社群：<a href="https://qm.qq.com/q/1lTUkKSaB6">QQ群（310134919）</a></p>
</div>

---

::: warning 简介
DeepStudent 是一款免费开源的 AI 错题管理解决方案，专为追求高效学习的学生和教师设计。
DeepStudent 通过人工智能技术革新传统错题整理方式，使用户可以自由使用各家先进的LLM、VLM模型，进而使学习更高效，让知识更牢固。
:::



---
### 核心功能与特色
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" style="font-family:Arial,sans-serif">
  <!-- 配色方案 -->
  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#4e54c8" />
    <stop offset="100%" stop-color="#8f94fb" />
  </linearGradient>
  
  <!-- 箭头标记定义 -->
  <marker id="arrow" markerWidth="14" markerHeight="14" refX="12" refY="5" orient="auto">
    <path d="M0,0 L0,10 L12,5 z" fill="#8a2be2"/>
  </marker>
  <marker id="reverse-arrow" markerWidth="14" markerHeight="14" refX="0" refY="5" orient="auto">
    <path d="M12,0 L12,10 L0,5 z" fill="#ff6b6b"/>
  </marker>

  <!-- 中心核心 -->
  <rect x="440" y="340" width="320" height="220" rx="20" fill="url(#grad1)" stroke="#333" stroke-width="2"/>
  <text x="600" y="450" text-anchor="middle" fill="white" font-size="40" font-weight="bold">智能错题本系统</text>
  <text x="600" y="500" text-anchor="middle" fill="#f0f0ff" font-size="28">AI驱动的学习闭环</text>

  <!-- 功能模块 -->
  <g class="module" transform="translate(150,120)">
    <rect width="240" height="360" rx="15" fill="#ff7e5f" stroke="#333" stroke-width="1.5"/>
    <text x="120" y="50" text-anchor="middle" fill="white" font-size="30" font-weight="bold">错题采集</text>
    <g transform="translate(15,80)">
      <circle cx="25" cy="40" r="12" fill="white"/>
      <text x="50" y="45" fill="#333" font-size="22">全渠道采集</text>
      <circle cx="25" cy="100" r="12" fill="white"/>
      <text x="50" y="105" fill="#333" font-size="22">智能识别</text>
      <circle cx="25" cy="160" r="12" fill="white"/>
      <text x="50" y="165" fill="#333" font-size="22">多模态解析</text>
      <circle cx="25" cy="220" r="12" fill="white"/>
      <text x="50" y="225" fill="#333" font-size="22">标签自动化</text>
    </g>
  </g>

  <!-- ANKI制卡模块 -->
  <g class="module" transform="translate(810,120)">
    <rect width="240" height="320" rx="15" fill="#46c7c7" stroke="#333" stroke-width="1.5"/>
    <text x="120" y="50" text-anchor="middle" fill="white" font-size="30" font-weight="bold">ANKI制卡</text>
    <g transform="translate(15,80)">
      <circle cx="25" cy="40" r="12" fill="white"/>
      <text x="50" y="45" fill="#333" font-size="22">智能制卡</text>
      <circle cx="25" cy="110" r="12" fill="white"/>
      <text x="50" y="115" fill="#333" font-size="22">模板定制</text>
      <circle cx="25" cy="180" r="12" fill="white"/>
      <text x="50" y="185" fill="#333" font-size="22">间隔复习</text>
    </g>
  </g>

  <g class="module" transform="translate(150,540)">
    <rect width="240" height="360" rx="15" fill="#7bc8f6" stroke="#333" stroke-width="1.5"/>
    <text x="120" y="50" text-anchor="middle" fill="white" font-size="30" font-weight="bold">灵感图谱</text>
    <g transform="translate(15,80)">
      <circle cx="25" cy="40" r="12" fill="white"/>
      <text x="50" y="45" fill="#333" font-size="22">知识网络</text>
      <circle cx="25" cy="100" r="12" fill="white"/>
      <text x="50" y="105" fill="#333" font-size="22">相似召回</text>
      <circle cx="25" cy="160" r="12" fill="white"/>
      <text x="50" y="165" fill="#333" font-size="22">关联学习</text>
      <circle cx="25" cy="220" r="12" fill="white"/>
      <text x="50" y="225" fill="#333" font-size="22">回归训练</text>
    </g>
  </g>

  <g class="module" transform="translate(810,540)">
    <rect width="240" height="360" rx="15" fill="#feb47b" stroke="#333" stroke-width="1.5"/>
    <text x="120" y="50" text-anchor="middle" fill="white" font-size="30" font-weight="bold">错题管理</text>
    <g transform="translate(15,80)">
      <circle cx="25" cy="40" r="12" fill="white"/>
      <text x="50" y="45" fill="#333" font-size="22">扁平化管理</text>
      <circle cx="25" cy="110" r="12" fill="white"/>
      <text x="50" y="115" fill="#333" font-size="22">多维分类</text>
      <circle cx="25" cy="180" r="12" fill="white"/>
      <text x="50" y="185" fill="#333" font-size="22">知识库增强</text>
      <circle cx="25" cy="250" r="12" fill="white"/>
      <text x="50" y="255" fill="#333" font-size="22">聊天记录保存</text>
    </g>
  </g>

  <!-- 中心到各模块的连接线 -->
  <path d="M600 340 C600 240 400 200 390 270" stroke="#4e54c8" stroke-width="3" fill="none"/>
  <path d="M600 340 C600 240 800 200 810 270" stroke="#46c7c7" stroke-width="3" fill="none"/>
  <path d="M600 560 C600 660 400 700 390 630" stroke="#7bc8f6" stroke-width="3" fill="none"/>
  <path d="M600 560 C600 660 800 700 810 630" stroke="#feb47b" stroke-width="3" fill="none"/>

  <!-- ===== 新增：灵感节点与错题库题目互相转换 ===== -->
  <!-- 灵感图谱 -> 错题管理（蓝色箭头） -->
  <path d="M390 700 C500 650 700 650 810 700" 
        stroke="#7bc8f6" 
        stroke-width="4" 
        fill="none" 
        marker-end="url(#arrow)"/>
  
  <!-- 错题管理 -> 灵感图谱（橙色箭头） -->
  <path d="M810 750 C700 800 500 800 390 750" 
        stroke="#feb47b" 
        stroke-width="4" 
        fill="none" 
        marker-end="url(#arrow)"/>
  
  <!-- 转换说明文字 -->
  <text x="600" y="710" text-anchor="middle" fill="#7bc8f6" font-size="22" font-weight="bold">
    灵感节点 → 错题库题目
  </text>
  <text x="600" y="820" text-anchor="middle" fill="#feb47b" font-size="22" font-weight="bold">
    错题库题目 → 灵感节点
  </text>
</svg>


### 项目优势

1. **AI 智能归类与标签化**  
   - 自动识别错题类型、知识点和难度等级  
   - 智能打标签并分类归档  
   - 告别手动整理的低效耗时，让复习更有针对性  
 
2. **ANKI牌组一键制卡**  
   - 免去手动制卡步骤  
   - 自定义模板
 
3. **深度知识整合与可视化**  
   - **知识网络构建**  
     - 灵感图谱和多维分类功能  
     - 建立知识点间的关联，形成可视化知识体系  
   - **相似召回与关联学习**  
     - 通过智能算法自动关联相似内容  
4. **开源可定制，隐私安全有保障**  
   - 开源透明，错题数据本地化  
   - 基于 AGPL-3.0 License 可二次开发，灵活适配不同教学场景

### 获取帮助
- 📖 [查看已知问题](./A&Q.md)
- 💬 [加入用户群](https://qm.qq.com/q/1lTUkKSaB6)
