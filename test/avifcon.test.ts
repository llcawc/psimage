import fs from 'fs'
import path from 'path'

import { describe, it, expect, afterAll } from 'vitest'

import avifcon from '../src/avifcon.js'
import { measureTest, logSuiteSummary } from './helpers.js'

describe('avifcon', () => {
  const imageDir = './images'

  // Тестируем конвертацию JPEG в AVIF
  it('should convert JPEG to AVIF', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'burg.jpg'))
    const plugin = avifcon({ quality: 75 })
    const result = await measureTest('avifcon › should convert JPEG to AVIF', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
    // Проверяем, что размер изменился (обычно AVIF меньше)
    expect(result.length).toBeLessThan(buffer.length)
  })

  // Тестируем конвертацию PNG в AVIF
  it('should convert PNG to AVIF', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.png'))
    const plugin = avifcon({ quality: 75 })
    const result = await measureTest('avifcon › should convert PNG to AVIF', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  // Тестируем конвертацию GIF в AVIF
  it('should convert GIF to AVIF', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.gif'))
    const plugin = avifcon({ quality: 75 })
    const result = await measureTest('avifcon › should convert GIF to AVIF', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  // Тестируем конвертацию WebP в AVIF
  it('should convert WebP to AVIF', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'waves.webp'))
    const plugin = avifcon({ quality: 75 })
    const result = await measureTest('avifcon › should convert WebP to AVIF', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  // Тестируем обработку AVIF (может быть перекодирован, но должен остаться валидным)
  it('should process AVIF and return valid buffer', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'shato.avif'))
    const plugin = avifcon({ quality: 75 })
    const result = await measureTest('avifcon › should process AVIF and return valid buffer', buffer, () =>
      plugin(buffer),
    )
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  afterAll(() => {
    logSuiteSummary('avifcon')
  })
})
