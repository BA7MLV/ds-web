---
prev: false
next: false
editLink: false
---

# 下载<Badge type="tip" text="Beta 0.8.6" />

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
    transition: box-shadow 0.2s;
  }

  .download-box:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
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
    transition: color 0.2s, transform 0.2s;
  }

  .download-link svg {
    transition: transform 0.2s;
  }

  .download-link:hover {
    color: var(--vp-c-brand-1);
  }

  .download-link:hover svg {
    transform: translateX(4px) rotate(90deg);
    cursor: pointer;
  }

  .changelog-container {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--vp-c-divider);
  }

  .changelog-item {
    margin-bottom: 2rem;
  }

  .changelog-version {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--vp-c-brand);
  }

  .changelog-date {
    font-size: 0.875rem;
    color: var(--vp-c-text-2);
    margin-bottom: 1rem;
    display: block;
  }

  .changelog-type {
    margin-left: 1rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .changelog-list {
    list-style-type: disc;
    padding-left: 2rem;
    margin-bottom: 0.5rem;
  }

  .changelog-list li {
    margin-bottom: 0.25rem;
  }
</style>

<div class="download-container">
  <div class="download-box">
    <h3>macOS</h3>
    <a class="download-link" target="_blank" href="https://imrt.lanzoul.com/i4XfM33ea22f">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      下载 macOS (Apple Silicon) v0.8.6
    </a>
  </div>

  <div class="download-box">
    <h3>iPadOS</h3>
    <a class="download-link" 
      href="https://testflight.apple.com/join/Mkay6jkb" 
      target="_blank" 
      onclick="alert('感谢下载～ 请等待跳转');">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      在 TestFlight 上下载
    </a>
  </div>

  <div class="download-box">
    <h3>PC (Windows)</h3>
    <a class="download-link" target="_blank" href="https://imrt.lanzoul.com/igcRf33cthid">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      下载 Windows v0.8.6 (.exe)
    </a>
  </div>

  <div class="download-box">
    <h3>网盘下载</h3>
    <a class="download-link" href="https://pan.baidu.com/s/1TA5LHe4lSnwNOuzSQWyWzQ?pwd=Deep" onclick="alert('即将跳转到百度网盘'); return true;" target="_blank">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      百度网盘 (提取码: Deep)
    </a>
  </div>
</div>

---

# 更新日志

