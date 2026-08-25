// Intrinsic dimensions of the public screenshot assets, measured from the
// 1600 renditions under public/img/example/. Declaring these on <img> lets the
// browser reserve the aspect-ratio box before the file arrives, so lazy-loaded
// screenshots don't shift layout (CLS).
//
// Almost every screenshot is 16:10 (1600×1000); only the deviating assets are
// listed below.
const DEFAULT_SCREENSHOT_DIMENSIONS = { width: 1600, height: 1000 }

const SCREENSHOT_DIMENSION_OVERRIDES = {
  '/img/example/anki-制卡3.png': { width: 1600, height: 824 },
  '/img/example/并行-2.png': { width: 1600, height: 1001 },
  '/img/example/作文-1.png': { width: 1600, height: 1001 },
  '/img/example/作文-2.png': { width: 1600, height: 1001 },
  '/img/example/向量化状态.png': { width: 1600, height: 1001 },
  // 软件主页图 的 png 切片是 1600×998，webp 切片是 1600×923（与原图 2643×1525 同比例）。
  // 现代浏览器都会命中 webp source，这里按 webp 的真实尺寸声明。
  '/img/example/软件主页图.png': { width: 1600, height: 923 },
}

export const getScreenshotDimensions = (src) =>
  SCREENSHOT_DIMENSION_OVERRIDES[src] ?? DEFAULT_SCREENSHOT_DIMENSIONS
