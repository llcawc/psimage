import fs from 'fs'
import path from 'path'

import { describe, it, expect, afterAll } from 'vitest'

import gifsicle from '../src/gifsicle.js'
import { measureTest, logSuiteSummary } from './helpers.js'

describe('gifsicle', () => {
  const imageDir = './images'

  // Тестируем оптимизацию GIF
  it('should optimize GIF', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.gif'))
    const plugin = gifsicle({ optimizationLevel: 3 })
    const result = await measureTest('gifsicle › should optimize GIF', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
    // Оптимизированный GIF должен быть меньше или равен исходному
    expect(result.length).toBeLessThanOrEqual(buffer.length)
  })

  // Тестируем оптимизацию с низким уровнем
  it('should optimize GIF with optimizationLevel 1', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.gif'))
    const plugin = gifsicle({ optimizationLevel: 1 })
    const result = await measureTest('gifsicle › should optimize GIF with optimizationLevel 1', buffer, () =>
      plugin(buffer),
    )
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  // Тестируем чересстрочный (interlaced) GIF
  it('should produce interlaced GIF', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.gif'))
    const plugin = gifsicle({ interlaced: true })
    const result = await measureTest('gifsicle › should produce interlaced GIF', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  // Тестируем уменьшение количества цветов
  it('should reduce colors', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.gif'))
    const plugin = gifsicle({ colors: 64 })
    const result = await measureTest('gifsicle › should reduce colors', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
    // С меньшим количеством цветов размер может уменьшиться
    expect(result.length).toBeLessThanOrEqual(buffer.length)
  })

  // Тестируем, что не-GIF буфер возвращается без изменений
  it('should return non-GIF buffer unchanged', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'burg.jpg'))
    const plugin = gifsicle()
    const result = await measureTest('gifsicle › should return non-GIF buffer unchanged', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result).toEqual(buffer)
  })

  // Тестируем обработку PNG (не-GIF)
  it('should return PNG buffer unchanged', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.png'))
    const plugin = gifsicle()
    const result = await measureTest('gifsicle › should return PNG buffer unchanged', buffer, () => plugin(buffer))
    expect(result).toEqual(buffer)
  })

  // Тестируем обработку WebP (не-GIF)
  it('should return WebP buffer unchanged', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'waves.webp'))
    const plugin = gifsicle()
    const result = await measureTest('gifsicle › should return WebP buffer unchanged', buffer, () => plugin(buffer))
    expect(result).toEqual(buffer)
  })

  // Тестируем обработку с дефолтными опциями
  it('should optimize GIF with default options', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.gif'))
    const plugin = gifsicle()
    const result = await measureTest('gifsicle › should optimize GIF with default options', buffer, () =>
      plugin(buffer),
    )
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  afterAll(() => {
    logSuiteSummary('gifsicle')
  })
})
