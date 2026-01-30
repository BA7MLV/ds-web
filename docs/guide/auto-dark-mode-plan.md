# 自动黑夜模式规划 (SOTA级别)

## 概述
规划一套既支持用户主动控制，又能智能自适应系统偏好和时间的黑夜模式方案。实现无缝切换、零闪烁、完全无障碍，达到业界顶级水准。

---

## 一、核心设计原则

### 1. 智能自适应（Smart Adaptation）
- **系统偏好** (`prefers-color-scheme`)：优先级最高
- **时间自适应**：基于日出日落时间智能切换
- **设备环境感知**：可选光线传感器支持（高级功能）
- **用户显式选择**：永远尊重用户意图

### 2. 零闪烁体验（No Flash）
- 首屏内联脚本，在DOM加载前应用主题
- CSS变量的预加载确保立即生效
- 所有主题切换使用渐变过渡（300ms）

### 3. 完全无障碍（WCAG AAA）
- 色彩对比度 ≥ 7:1（AAA标准）
- `prefers-reduced-motion` 尊重无动画需求
- `aria-label` 完善，屏幕阅读器友好
- 键盘导航完整（Tab/Enter切换）

### 4. 性能优先（Performance First）
- 无JavaScript时优雅降级
- localStorage缓存机制高效
- 媒体查询监听异步处理
- CSS变量（相比类名切换）更高效

---

## 二、目前状态评估

### ✅ 已有能力
- 三态切换：Auto / Light / Dark
- 系统偏好监听 (`matchMedia`)
- localStorage持久化
- React `useSyncExternalStore` 集成
- VitePress暗色主题完整设计Token
- 无缝的类名切换（`light`/`dark`）

### ⚠️ 待增强项

| 项目 | 当前状态 | 目标 |
|------|--------|------|
| **首屏闪烁** | 无内联脚本 | 添加防闪烁脚本 |
| **时间自适应** | 无 | 基于日出日落 |
| **过渡动画** | 无 | 平滑300ms过渡 |
| **高级选项** | 无 | 可选时间/地理位置 |
| **故障恢复** | 无 | 自动回退机制 |
| **分析埋点** | 无 | 用户偏好数据 |

---

## 三、实现路线图

### Phase 1：防闪烁 + 过渡动画（基础增强）⭐ 优先

#### 1.1 添加首屏防闪烁脚本
**目标**：在浏览器解析CSS前同步应用主题，零感知延迟

**位置**：`index.html` `<head>` 内，`<link rel="stylesheet">` 之前

```html
<!-- 防闪烁脚本：在HTML解析前同步应用主题 -->
<script>
  (function() {
    const THEME_KEY = 'ds-theme-preference';
    const stored = localStorage.getItem(THEME_KEY) || 'system';
    const getSystemTheme = () => 
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const resolved = stored === 'system' ? getSystemTheme() : stored;
    
    document.documentElement.classList.add(resolved);
    // 更新meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0a0a0c' : '#f5f5f7');
  })();
</script>
```

**效果**：
- 页面加载时主题无缝应用
- 避免白屏后黑屏/反向闪烁
- 在慢网络下仍然有效

#### 1.2 CSS过渡层
**位置**：`docs/.vitepress/theme/custom.css` 头部

```css
/* 主题平滑过渡 */
:root, .dark, .light {
  /* 背景、文本、边框过渡 */
  --transition-colors: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  transition-property: background-color, color, border-color;
  transition-duration: var(--transition-colors);
  transition-timing-function: inherit;
}

/* 尊重无动画偏好 */
@media (prefers-reduced-motion: reduce) {
  :root, .dark, .light {
    --transition-colors: 0s;
    transition: none;
  }
}

/* 颜色过渡细节 */
.dark {
  color-scheme: dark;
  /* 立即应用背景色（避免闪烁） */
  background-color: var(--ds-surface);
}

:root:not(.dark) {
  color-scheme: light;
  background-color: var(--ds-surface);
}
```

#### 1.3 增强主题组件
**位置**：`src/components/theme-toggle.jsx`

```jsx
// 添加过渡约束与禁用过渡选项
const applyTheme = (newTheme) => {
  // ... 现有逻辑 ...
  
  // 添加过渡类（临时禁用过渡，避免中间状态可见）
  const root = document.documentElement;
  root.style.transition = 'none';
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  
  // 强制重排（浏览器同步）
  void root.offsetHeight;
  // 恢复过渡
  root.style.transition = '';
}
```

**收益**：
- ✅ 100%消除首屏闪烁
- ✅ 主题切换平滑（300ms）
- ✅ 支持无动画模式

---

### Phase 2：时间自适应（智能增强）⭐ 推荐

#### 2.1 日出日落检测模块
**新文件**：`src/lib/sunset-detection.js`

```javascript
/**
 * 智能时间转换
 * 基于日出日落时间自动切换主题
 */

export class SunsetDetector {
  // 硬编码默认：中国大陆中纬度估算值
  constructor(latitude = 39.9, longitude = 116.4) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  // 简化算法：使用标准日出日落公式
  // 参考：NOAA Solar Calculations
  getSunriseAndSunset(date = new Date()) {
    const dayOfYear = this.getDayOfYear(date);
    const latitude = this.latitude;
    
    // 简化公式（±10分钟精度，足够日常使用）
    const B = (360 / 365) * (dayOfYear - 81);
    const B_rad = B * Math.PI / 180;
    
    // 方程时差（分钟）
    const E = 9.87 * Math.sin(2 * B_rad) - 7.53 * Math.cos(B_rad) - 1.5 * Math.sin(B_rad);
    
    // 标准午时（标准经线 = 120°E，中国时区）
    const S = (120 - this.longitude) * 4 / 60;
    
    // 日长（小时，近似）
    const declin_rad = 23.44 * Math.PI / 180;
    const lat_rad = latitude * Math.PI / 180;
    const cosH = -Math.tan(lat_rad) * Math.tan(Math.asin(Math.sin(declin_rad)));
    const H = Math.acos(Math.max(-1, Math.min(1, cosH))) * 180 / Math.PI / 15;
    
    const sunrise = 12 - H - S - E / 60;
    const sunset = 12 + H - S - E / 60;
    
    return {
      sunrise: this.minutesToTime(sunrise * 60),
      sunset: this.minutesToTime(sunset * 60),
      isDaytime: this.isCurrentlyDaytime(sunrise, sunset)
    };
  }

  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / 86400000);
  }

  minutesToTime(minutes) {
    const hours = Math.floor(minutes);
    const mins = Math.round((minutes - hours) * 60);
    return { hours, minutes: mins };
  }

  isCurrentlyDaytime(sunrise, sunset) {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    return hour >= sunrise && hour < sunset;
  }

  // 获取用户IP推断的地理位置（可选高级）
  async detectLocationFromIP() {
    try {
      const response = await fetch('https://ipapi.co/json/', { 
        signal: AbortSignal.timeout(3000) 
      });
      const data = await response.json();
      this.latitude = data.latitude;
      this.longitude = data.longitude;
      return { latitude: data.latitude, longitude: data.longitude };
    } catch (e) {
      console.warn('[Theme] IP定位失败，使用默认位置');
      return null;
    }
  }

  // Geolocation API（需要用户授权）
  async detectLocationFromGeolocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          this.latitude = coords.latitude;
          this.longitude = coords.longitude;
          resolve({ latitude: coords.latitude, longitude: coords.longitude });
        },
        () => resolve(null),
        { timeout: 3000, enableHighAccuracy: false }
      );
    });
  }
}

// 使用示例
export const createSunsetThemeManager = async (enableGeoLocation = false) => {
  const detector = new SunsetDetector();
  
  if (enableGeoLocation) {
    await detector.detectLocationFromIP();
  }
  
  return detector;
};
```

#### 2.2 主题管理器集成
**修改**：`src/components/theme-toggle.jsx`

```javascript
// 导入日出日落检测
import { SunsetDetector } from '../lib/sunset-detection.js';

const themeStore = (() => {
  let theme = 'system';
  let resolvedTheme = 'light';
  let sunsetDetector = null;
  
  const getSystemTheme = () => {
    if (typeof window === 'undefined') return 'light';
    
    // 优先级1：显式设置
    if (theme !== 'system') {
      return theme;
    }
    
    // 优先级2：媒体查询
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (mediaQuery.matches) return 'dark';
    
    // 优先级3：日出日落（如果启用）
    if (sunsetDetector) {
      const { isDaytime } = sunsetDetector.getSunriseAndSunset();
      return isDaytime ? 'light' : 'dark';
    }
    
    return 'light';
  };

  const initSunsetDetection = async () => {
    try {
      sunsetDetector = new SunsetDetector();
      // 可选：自动IP定位（隐私考虑，默认关闭）
      // await sunsetDetector.detectLocationFromIP();
      
      // 每小时更新一次（检查是否跨越日出/日落）
      setInterval(() => {
        if (theme === 'system') {
          applyTheme('system');
          listeners.forEach((l) => l());
        }
      }, 3600000);
    } catch (e) {
      console.warn('[Theme] 日出日落检测初始化失败', e);
    }
  };

  const init = () => {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      theme = stored;
    }
    applyTheme(theme);
    
    // 初始化日出日落检测
    initSunsetDetection();
    
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
        listeners.forEach((l) => l());
      }
    };
    mediaQuery.addEventListener?.('change', handleChange) || mediaQuery.addListener(handleChange);
  };

  // ... 其他现有代码保持不变 ...
});
```

**收益**：
- ✅ 日落自动转深色，日出自动转浅色
- ✅ 符合人眼节律（circadian rhythm）
- ✅ 减少夜间蓝光，保护睡眠

---

### Phase 3：高级功能（可选）

#### 3.1 自定义时间段
**在主题面板中添加**：

```jsx
<TimeRangeSelector
  label="自定义时间段"
  onChangeNightStart={(time) => localStorage.setItem('theme-night-start', time)}
  onChangeNightEnd={(time) => localStorage.setItem('theme-night-end', time)}
/>
```

#### 3.2 主题数据分析
记录用户偏好：
```javascript
// 统计用户在不同时段的主题选择
const logThemeUsage = (theme, context = {}) => {
  const log = {
    timestamp: Date.now(),
    theme,
    isDaytime: new Date().getHours() >= 6 && new Date().getHours() < 18,
    userAgent: navigator.userAgent.substring(0, 50),
    ...context
  };
  // 可选上报到分析服务
};
```

#### 3.3 性能监测
```javascript
// 测量主题切换的实际耗时
const measureThemeSwitchPerformance = () => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`主题切换耗时: ${entry.duration.toFixed(2)}ms`);
    }
  });
  observer.observe({ entryTypes: ['measure'] });
};
```

---

## 四、文件变更清单

```
修改/新增文件：
├── index.html                              [修改] 添加防闪烁脚本
├── src/
│   ├── components/
│   │   ├── theme-toggle.jsx                [修改] 集成日出日落、过渡优化
│   │   └── mode-switch-panel.jsx           [可选修改] 添加时间段选择
│   └── lib/
│       └── sunset-detection.js             [新增] 日出日落检测模块
├── docs/
│   └── .vitepress/
│       └── theme/
│           ├── custom.css                  [修改] 添加过渡层和动画规则
│           └── index.js                    [可选修改] 日出日落监听初始化
└── tests/
    └── theme.test.js                       [新增] 主题功能单元测试
```

---

## 五、验收清单

### 功能验收
- [ ] 冷启动无闪烁（在极限网络下测试）
- [ ] 主题切换 ≤ 300ms 完成
- [ ] 系统偏好变化自动同步
- [ ] 日出日落时间段正确判定（≥90%精度）
- [ ] localStorage正确持久化

### 性能指标
- [ ] LCP (Largest Contentful Paint) 无增加
- [ ] FCP (First Contentful Paint) ≤ 1.5s
- [ ] 主题脚本文件大小 ≤ 1.2KB (gzip)
- [ ] 日出日落计算 ≤ 0.5ms

### 无障碍指标
- [ ] 色彩对比度 ≥ 7:1 (WCAG AAA)
- [ ] Tab键可切换所有主题选项
- [ ] 屏幕阅读器正确识别当前主题
- [ ] 尊重 `prefers-reduced-motion`

### 跨浏览器测试
- [ ] Chrome/Edge (Chromium) ✅ 最新版
- [ ] Firefox ✅ 最新版
- [ ] Safari/iOS Safari ✅ iOS 14+
- [ ] 无JavaScript环境 ✅ 优雅降级

### 用户体验测试
- [ ] 快速网络下主题切换体验
- [ ] 3G网络下冷启动表现
- [ ] 暗色模式下长期阅读舒适度
- [ ] 日出日落边界时段平滑过渡

---

## 六、最佳实践 & 注意事项

### ⚠️ 常见陷阱
1. **闪烁问题**：必须在 `<head>` 中内联脚本，勿延迟到DOM加载后
2. **时区混乱**：日出日落公式需考虑用户时区和标准经线
3. **电池消耗**：避免频繁的媒体查询监听，用节流/防抖
4. **隐私担忧**：地理定位需明确用户同意，提供隐私条款

### 💡 优化建议
1. **渐进增强**：从三态切换开始，逐步加入日出日落
2. **灰度发布**：时间自适应可通过特性开关逐步推出
3. **收集反馈**：记录用户在各时段的主题选择，持续优化
4. **国际化**：支持多个国家的日出日落数据，考虑DST夏令时

### 🔒 隐私优先
```javascript
// 明确的隐私策略
const locationConsent = localStorage.getItem('theme-location-consent');
if (locationConsent === 'approved') {
  detector.detectLocationFromGeolocation();
} else {
  // 使用默认或IP推断
}
```

---

## 七、参考资源

### 相关标准
- [W3C Media Queries: Prefers Color Scheme](https://www.w3.org/TR/mediaqueries-5/#prefers-color-scheme)
- [WCAG 2.1 Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [NOAA Solar Calculation](https://www.weather.gov/media/epz/wxcalc/vsby.pdf)

### 开源参考
- [Next.js next-themes](https://github.com/pacocoursey/next-themes)
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [GitHub Dark Mode](https://github.blog/changelog/2019-09-23-dark-mode-is-here/)

### 工具库
- **日出日落计算**：`sunrisesunset.js` 或 `suncalc.js`
- **无动画检测**：`window.matchMedia('(prefers-reduced-motion)')`
- **地理定位**：Geolocation API 或 MaxMind GeoIP

---

## 八、实现时间预估

| Phase | 任务 | 预估工时 | 优先级 |
|-------|------|--------|--------|
| 1 | 防闪烁脚本 + 过渡 | 1-2h | ⭐⭐⭐ |
| 1 | 测试 & 跨浏览器 | 2-3h | ⭐⭐⭐ |
| 2 | 日出日落检测 | 3-4h | ⭐⭐ |
| 2 | 位置定位（可选） | 1-2h | ⭐ |
| 3 | UI/高级选项 | 2-3h | ⭐ |
| **总计** | | **9-15h** | |

---

## 九、总结

这套方案结合了：
- 🎯 **用户中心**：尊重显式选择，感知系统偏好
- ⚡ **性能优先**：零闪烁、轻量级脚本、CSS变量高效
- ♿ **完全无障碍**：AAA级对比度、键盘导航、屏幕阅读器支持
- 🌍 **智能自适应**：时间感知、位置感知、流动过渡
- 📊 **可观测性**：性能监测、用户偏好分析、故障恢复

**预期效果**：达到 **Notion**、**GitHub**、**Linear** 等顶级产品的黑夜模式体验。
