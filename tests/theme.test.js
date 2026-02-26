import test from 'node:test'
import assert from 'node:assert/strict'

import { SunsetDetector } from '../src/lib/sunset-detection.js'

test('SunsetDetector 初始化经纬度（默认/自定义）', () => {
  const defaultDetector = new SunsetDetector()
  assert.equal(defaultDetector.latitude, 39.9042)
  assert.equal(defaultDetector.longitude, 116.4074)

  const customDetector = new SunsetDetector(1.23, 4.56)
  assert.equal(customDetector.latitude, 1.23)
  assert.equal(customDetector.longitude, 4.56)
})

test('SunsetDetector minutesToTime 处理负值与超过 24 小时', () => {
  const detector = new SunsetDetector()

  assert.deepEqual(detector.minutesToTime(720), { hours: 12, minutes: 0 })
  assert.deepEqual(detector.minutesToTime(375), { hours: 6, minutes: 15 })
  assert.deepEqual(detector.minutesToTime(1439), { hours: 23, minutes: 59 })

  const negative = detector.minutesToTime(-60)
  assert.equal(negative.hours, 23)

  const overflow = detector.minutesToTime(1500)
  assert.equal(overflow.hours, 1)
})

test('SunsetDetector formatTime 格式化为 HH:MM', () => {
  const detector = new SunsetDetector()

  assert.equal(detector.formatTime({ hours: 6, minutes: 30 }), '06:30')
  assert.equal(detector.formatTime({ hours: 18, minutes: 5 }), '18:05')
  assert.equal(detector.formatTime({ hours: 23, minutes: 59 }), '23:59')
})

test('SunsetDetector getDayOfYear 在闰年返回正确序数', () => {
  const detector = new SunsetDetector()

  const date1 = new Date(2024, 0, 1)
  assert.equal(detector.getDayOfYear(date1), 1)

  const date2 = new Date(2024, 11, 31)
  assert.equal(detector.getDayOfYear(date2), 366)
})

test('SunsetDetector 计算日出日落时间（北京，粗略范围）', () => {
  const detector = new SunsetDetector(39.9042, 116.4074)

  const stableDate = new Date(2026, 1, 21)
  const { sunrise, sunset } = detector.getSunriseAndSunset(stableDate)

  assert.ok(Number.isInteger(sunrise.hours))
  assert.ok(Number.isInteger(sunrise.minutes))
  assert.ok(Number.isInteger(sunset.hours))
  assert.ok(Number.isInteger(sunset.minutes))

  assert.ok(sunrise.hours >= 5 && sunrise.hours < 9)
  assert.ok(sunset.hours >= 15 && sunset.hours < 20)

  const sunriseMinutes = sunrise.hours * 60 + sunrise.minutes
  const sunsetMinutes = sunset.hours * 60 + sunset.minutes
  assert.ok(sunsetMinutes > sunriseMinutes)
})

test('SunsetDetector 同日调用命中缓存（sunrise/sunset 值一致）', () => {
  const detector = new SunsetDetector(39.9042, 116.4074)
  const date = new Date(2026, 1, 21)

  const result1 = detector.getSunriseAndSunset(date)
  const result2 = detector.getSunriseAndSunset(date)

  assert.deepEqual(result1.sunrise, result2.sunrise)
  assert.deepEqual(result1.sunset, result2.sunset)
})

test('SunsetDetector getTimeUntilNextTransition 返回正数与合法事件类型', () => {
  const detector = new SunsetDetector(39.9042, 116.4074)
  const { minutesUntilNextTransition, nextEventType } = detector.getTimeUntilNextTransition()

  assert.ok(minutesUntilNextTransition > 0)
  assert.ok(nextEventType === 'sunrise' || nextEventType === 'sunset')
})
