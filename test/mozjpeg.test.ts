// oxlint-disable typescript/no-explicit-any
import fs from 'fs'
import path from 'path'

import { describe, it, expect, afterAll } from 'vitest'

import mozjpeg from '../src/mozjpeg.js'
import { measureTest, logSuiteSummary } from './helpers.js'

describe('mozjpeg', () => {
  const imageDir = './images'

  // Тестируем сжатие JPEG
  it('should compress JPEG', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'burg.jpg'))
    const plugin = mozjpeg({ quality: 80 })
    const result = await measureTest('mozjpeg › should compress JPEG', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
    // Сжатый JPEG должен быть меньше или равен исходному
    expect(result.length).toBeLessThanOrEqual(buffer.length)
  })

  // Тестируем сжатие с высоким качеством (мало сжатия)
  it('should compress JPEG with high quality', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'curved.jpg'))
    const plugin = mozjpeg({ quality: 95 })
    const result = await measureTest('mozjpeg › should compress JPEG with high quality', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
    // При высоком качестве размер может быть близок к исходному
    expect(result.length).toBeLessThanOrEqual(buffer.length)
  })

  // Тестируем прогрессивный JPEG
  it('should produce progressive JPEG', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'wmap.jpg'))
    const plugin = mozjpeg({ progressive: true })
    const result = await measureTest('mozjpeg › should produce progressive JPEG', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  // Тестируем базовый (не прогрессивный) JPEG
  it('should produce baseline JPEG', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'burg.jpg'))
    const plugin = mozjpeg({ progressive: false })
    const result = await measureTest('mozjpeg › should produce baseline JPEG', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  // Тестируем, что не-JPG буфер возвращается без изменений
  it('should return non-JPG buffer unchanged', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.png'))
    const plugin = mozjpeg()
    const result = await measureTest('mozjpeg › should return non-JPG buffer unchanged', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result).toEqual(buffer)
  })

  // Тестируем обработку GIF (не-JPG)
  it('should return GIF buffer unchanged', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.gif'))
    const plugin = mozjpeg()
    const result = await measureTest('mozjpeg › should return GIF buffer unchanged', buffer, () => plugin(buffer))
    expect(result).toEqual(buffer)
  })

  // Тестируем ошибку при использовании устаревшей опции fastcrush
  it('should throw error on deprecated fastcrush option', async () => {
    const plugin = mozjpeg({ fastcrush: true } as any)
    const buffer = fs.readFileSync(path.join(imageDir, 'burg.jpg'))
    await expect(plugin(buffer)).rejects.toThrow('Option `fastcrush` was renamed to `fastCrush`')
  })

  // Тестируем ошибку при использовании устаревшей опции maxmemory
  it('should throw error on deprecated maxmemory option', async () => {
    const plugin = mozjpeg({ maxmemory: 100 } as any)
    const buffer = fs.readFileSync(path.join(imageDir, 'burg.jpg'))
    await expect(plugin(buffer)).rejects.toThrow('Option `maxmemory` was renamed to `maxMemory`')
  })

  afterAll(() => {
    logSuiteSummary('mozjpeg')
  })
})
