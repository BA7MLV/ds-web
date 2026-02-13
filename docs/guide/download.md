---
prev: false
next: false
editLink: false
---

# 下载<Badge type="tip" text="v1.0.2" />

::: tip 系统要求
- **macOS**：macOS 13+（Apple Silicon / Intel 通用二进制）
- **Windows**：Windows 11 / Windows 10 22H2+
:::

<style>
  .download-container {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    margin-top: 1.5rem;
  }

  .download-box {
    background-color: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-bg-soft);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .download-box h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
  }

  .download-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: var(--vp-c-text-1);
    text-decoration: none;
  }

  .download-link:hover {
    color: var(--vp-c-brand-1);
  }

  .download-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-left: 0.5rem;
  }

  .badge-release {
    background-color: #d1fae5;
    color: #065f46;
  }

  .badge-preview {
    background-color: #fef3c7;
    color: #92400e;
  }
</style>

<div class="download-container">
  <div class="download-box">
    <h3>macOS <span class="download-badge badge-release">正式版</span></h3>
    <p style="font-size: 0.875rem; color: var(--vp-c-text-2); margin: 0;">
      v1.0.2 · Build 88 · 312 MB<br/>
      全功能版本，Apple Silicon / Intel 双架构优化
    </p>
    <a class="download-link" target="_blank" href="https://downloads.deepstudent.ai/macos/deepstudent-v1.0.2.dmg">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      下载 DMG 安装包
    </a>
  </div>

  <div class="download-box">
    <h3>Windows <span class="download-badge badge-preview">预览版</span></h3>
    <p style="font-size: 0.875rem; color: var(--vp-c-text-2); margin: 0;">
      v0.9.8 Preview · 298 MB<br/>
      功能与 macOS 版一致，部分功能仍在优化中
    </p>
    <a class="download-link" target="_blank" href="https://downloads.deepstudent.ai/windows/deepstudent-setup.exe">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      下载 EXE 安装程序
    </a>
  </div>

  <div class="download-box">
    <h3>网盘下载</h3>
    <p style="font-size: 0.875rem; color: var(--vp-c-text-2); margin: 0;">
      如果上方链接下载较慢，可通过百度网盘下载
    </p>
    <a class="download-link" href="https://pan.baidu.com/s/1TA5LHe4lSnwNOuzSQWyWzQ?pwd=Deep" target="_blank">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      百度网盘 (提取码: Deep)
    </a>
  </div>
</div>

---

## 安装说明

### macOS

1. 下载 `.dmg` 文件
2. 双击打开，将 DeepStudent 拖入「应用程序」文件夹
3. 首次打开如遇「已损坏」提示，请在终端执行：
   ```bash
   sudo xattr -r -d com.apple.quarantine /Applications/DeepStudent.app
   ```

### Windows

1. 下载 `.exe` 安装程序
2. 双击运行安装
3. 安装完成后从开始菜单或桌面快捷方式启动

---

## 安装后

安装完成后，请参考 [快速入门](./start.md) 完成 API 密钥配置。推荐使用 SiliconFlow 的「一键分配」功能快速完成配置。

---

# 更新日志

### v1.0.2（2026-02）
- ChatAnki 制卡技能 v2.0
- Skills 渐进披露架构
- 数据治理 v2 升级
- 云同步（WebDAV / S3）
- 多平台构建支持

### v0.9.0（2026-01）
- Chat V2 架构
- MCP 客户端集成
- VFS 虚拟文件系统
- AES-256-GCM 安全存储

### v0.8.9
- 首次公开发布
