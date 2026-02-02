/**
 * 日出日落智能检测模块
 * 基于 NOAA 太阳位置算法的轻量级日出日落计算
 * 精度：±10分钟，适用于日常使用
 * 
 * 参考：
 * - NOAA Solar Calculation: https://www.esrl.noaa.gov/gmd/grad/solcalc/
 * - Wikipedia: https://en.wikipedia.org/wiki/Sunrise_equation
 */

/**
 * 日出日落检测类
 * 支持自定义位置，自动地理定位（可选）
 */
export class SunsetDetector {
  /**
   * @param {number} latitude - 纬度（-90 ~ 90），默认北京
   * @param {number} longitude - 经度（-180 ~ 180），默认北京
   */
  constructor(latitude = 39.9042, longitude = 116.4074) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.cachedResult = null;
    this.cacheDate = null;
  }

  /**
   * 获取指定日期的日出日落时间和当前时间段
   * @param {Date} date - 目标日期，默认今天
   * @returns {Object} { sunrise: {hours, minutes}, sunset: {hours, minutes}, isDaytime: boolean }
   */
  getSunriseAndSunset(date = new Date()) {
    // 缓存机制：同一天内只计算一次
    const dateStr = date.toDateString();
    if (this.cacheDate === dateStr && this.cachedResult) {
      return {
        ...this.cachedResult,
        isDaytime: this.isCurrentlyDaytime(this.cachedResult.sunrise, this.cachedResult.sunset)
      };
    }

    const dayOfYear = this.getDayOfYear(date);
    const latitude = this.latitude;
    const longitude = this.longitude;

    // ===== 简化的NOAA算法 =====
    // 基于Batts的简化太阳位置方程，精度±10分钟

    // 第一步：计算分数年（fractional year）
    // 用于计算方程时差和日赤纬
    const B = ((360 / 365) * (dayOfYear - 1)) * (Math.PI / 180);

    // 第二步：计算方程时差（Equation of Time）
    // 单位：分钟，范围约-14到+16分钟
    const eot = 229.18 * (
      0.000075 + 
      0.001868 * Math.cos(B) - 
      0.032077 * Math.sin(B) - 
      0.014615 * Math.cos(2 * B) - 
      0.040849 * Math.sin(2 * B)
    );

    // 第三步：计算日赤纬（solar declination）
    // 单位：弧度，范围约-23.44°到+23.44°
    const declinationAngle = (
      0.006918 - 
      0.399912 * Math.cos(B) + 
      0.070257 * Math.sin(B) - 
      0.006758 * Math.cos(2 * B) + 
      0.000907 * Math.sin(2 * B) - 
      0.002697 * Math.cos(3 * B) + 
      0.00111 * Math.sin(3 * B)
    );

    // 第四步：计算日长（day length）
    // 基于纬度和赤纬
    const latitudeRad = latitude * (Math.PI / 180);
    const cosH = -Math.tan(latitudeRad) * Math.tan(declinationAngle);

    // 钳制到[-1, 1]范围内（极地夏冬不出不落情况）
    const clampedCosH = Math.max(-1, Math.min(1, cosH));
    const hourAngle = Math.acos(clampedCosH);

    // 转换为小时（弧度制）
    const dayLength = (2 / (Math.PI / 12)) * hourAngle;

    // 第五步：时区修正
    // 标准经线（中国：120°E），用户经度
    const timeZoneOffset = (120 - longitude) / 15; // 小时
    
    // 第六步：计算日出日落时间（世界时）
    const solarNoonUtc = 12 - eot / 60 - timeZoneOffset;
    const sunriseUtc = solarNoonUtc - dayLength / 2;
    const sunsetUtc = solarNoonUtc + dayLength / 2;

    // 转换为本地时间（假设已在该时区）
    const sunrise = this.minutesToTime(sunriseUtc * 60);
    const sunset = this.minutesToTime(sunsetUtc * 60);

    // 缓存结果
    this.cachedResult = { sunrise, sunset };
    this.cacheDate = dateStr;

    return {
      sunrise,
      sunset,
      isDaytime: this.isCurrentlyDaytime(sunrise, sunset)
    };
  }

  /**
   * 判断当前时间是否在日出日落之间
   * @param {Object} sunrise - {hours, minutes}
   * @param {Object} sunset - {hours, minutes}
   * @returns {boolean}
   */
  isCurrentlyDaytime(sunrise, sunset) {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    const sunriseMinutes = sunrise.hours * 60 + sunrise.minutes;
    const sunsetMinutes = sunset.hours * 60 + sunset.minutes;

    return currentTotalMinutes >= sunriseMinutes && currentTotalMinutes < sunsetMinutes;
  }

  /**
   * 计算某个日期在该年的第几天
   * @param {Date} date
   * @returns {number} 1-365/366
   */
  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  /**
   * 将分钟转换为 {hours, minutes} 格式
   * 处理跨日情况（如：-0.5h = 23:30）
   * @param {number} minutes
   * @returns {Object} {hours: 0-23, minutes: 0-59}
   */
  minutesToTime(minutes) {
    let totalMinutes = Math.round(minutes);
    
    // 处理负值（前一天）
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }
    
    // 处理超过24小时（下一天）
    totalMinutes = totalMinutes % (24 * 60);

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return { hours, minutes: mins };
  }

  /**
   * 格式化输出时间（便于调试和显示）
   * @param {Object} time - {hours, minutes}
   * @returns {string} "HH:MM"
   */
  formatTime(time) {
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`;
  }

  /**
   * 获取当前时间到下一个日出/日落的剩余时间
   * @returns {Object} { minutesUntilNextTransition: number, nextEventType: 'sunrise' | 'sunset' }
   */
  getTimeUntilNextTransition() {
    const { sunrise, sunset } = this.getSunriseAndSunset();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const sunriseMinutes = sunrise.hours * 60 + sunrise.minutes;
    const sunsetMinutes = sunset.hours * 60 + sunset.minutes;

    if (currentMinutes < sunriseMinutes) {
      return {
        minutesUntilNextTransition: sunriseMinutes - currentMinutes,
        nextEventType: 'sunrise'
      };
    } else if (currentMinutes < sunsetMinutes) {
      return {
        minutesUntilNextTransition: sunsetMinutes - currentMinutes,
        nextEventType: 'sunset'
      };
    } else {
      // 明天日出
      return {
        minutesUntilNextTransition: (24 * 60 - currentMinutes) + sunriseMinutes,
        nextEventType: 'sunrise'
      };
    }
  }

  /**
   * 从IP地址自动定位（通过 ipapi.co，无需认证）
   * 需要网络连接，超时3秒自动回退
   * @param {boolean} useHighAccuracy - 是否使用高精度服务
   * @returns {Promise<Object|null>} {latitude, longitude} 或 null（失败时）
   */
  async detectLocationFromIP(useHighAccuracy = false) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const apiUrl = useHighAccuracy 
        ? 'https://ipapi.co/json/' 
        : 'https://ip.seeip.org/geoip';

      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const lat = data.latitude || data.lat;
      const lon = data.longitude || data.lon;

      if (lat && lon) {
        this.latitude = lat;
        this.longitude = lon;
        this.cacheDate = null; // 清除缓存，重新计算
        return { latitude: lat, longitude: lon };
      }

      return null;
    } catch (error) {
      console.warn('[SunsetDetector] IP定位失败，使用默认位置', error.message);
      return null;
    }
  }

  /**
   * 使用浏览器 Geolocation API（需要用户授权）
   * 精度更高但需要明确授权，需提前处理隐私问题
   * @returns {Promise<Object|null>} {latitude, longitude} 或 null
   */
  async detectLocationFromGeolocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('[SunsetDetector] Geolocation API 不可用');
        resolve(null);
        return;
      }

      const timeout = setTimeout(() => {
        resolve(null);
      }, 5000);

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          clearTimeout(timeout);
          this.latitude = coords.latitude;
          this.longitude = coords.longitude;
          this.cacheDate = null;
          resolve({ latitude: coords.latitude, longitude: coords.longitude });
        },
        (error) => {
          clearTimeout(timeout);
          console.warn('[SunsetDetector] Geolocation 获取失败', error.message);
          resolve(null);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    });
  }

  /**
   * 调试工具：打印今天的日出日落时间
   */
  debugPrintToday() {
    const { sunrise, sunset, isDaytime } = this.getSunriseAndSunset();
    console.log(
      `[SunsetDetector] 今日日出: ${this.formatTime(sunrise)}, ` +
      `日落: ${this.formatTime(sunset)}, ` +
      `当前: ${isDaytime ? '白天' : '黑夜'}`
    );
  }
}

/**
 * 工厂函数：创建带地理定位的日出日落管理器
 * @param {Object} options
 *   - enableAutoLocation: boolean - 是否自动定位（default: false）
 *   - useGeolocation: boolean - 优先使用Geolocation API（default: false，需授权）
 *   - latitude: number - 初始纬度（default: 39.9042，北京）
 *   - longitude: number - 初始经度（default: 116.4074，北京）
 * @returns {Promise<SunsetDetector>}
 */
export async function createSunsetDetector(options = {}) {
  const {
    enableAutoLocation = false,
    useGeolocation = false,
    latitude = 39.9042,
    longitude = 116.4074
  } = options;

  const detector = new SunsetDetector(latitude, longitude);

  if (enableAutoLocation) {
    if (useGeolocation) {
      // 需要用户授权，谨慎使用
      await detector.detectLocationFromGeolocation();
    } else {
      // 使用IP定位，无需授权
      await detector.detectLocationFromIP();
    }
  }

  return detector;
}

/**
 * 简单初始化函数：只需一行代码即可开启日出日落主题切换
 * @param {Object} themeStore - 主题存储对象（必须有 setTheme 方法）
 * @param {Object} options - 参见 createSunsetDetector 选项
 */
export async function initSunsetThemeManager(themeStore, options = {}) {
  const detector = await createSunsetDetector(options);
  
  // 立即应用一次
  const { isDaytime } = detector.getSunriseAndSunset();
  themeStore.setTheme(isDaytime ? 'light' : 'dark');

  // 每小时检查一次（跨越日出/日落边界时更新）
  setInterval(() => {
    // 仅在用户设置为"自动"时更新
    const currentPreference = localStorage.getItem('ds-theme-preference') || 'system';
    if (currentPreference === 'system') {
      themeStore.setTheme('system');
    }
  }, 3600000); // 1 hour

  return detector;
}
