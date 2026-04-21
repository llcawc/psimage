import fs from 'fs'
import path from 'path'

import { describe, it, expect, afterAll } from 'vitest'

import svgo from '../src/svgo.js'
import { measureTest, logSuiteSummary } from './helpers.js'

describe('svgo', () => {
  const imageDir = './images'

  // Тестируем оптимизацию SVG файла
  it('should optimize SVG', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'favicon.svg'))
    const plugin = svgo({ multipass: true })
    const result = await measureTest('svgo › should optimize SVG', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
    // Оптимизированный SVG должен быть меньше или равен исходному
    expect(result.length).toBeLessThanOrEqual(buffer.length)
  })

  // Тестируем оптимизацию SVG из папки icons
  it('should optimize icon SVG', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'icons', 'close.svg'))
    const plugin = svgo({})
    const result = await measureTest('svgo › should optimize icon SVG', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
    expect(result.length).toBeLessThanOrEqual(buffer.length)
  })

  // Тестируем оптимизацию с отключенным multipass
  it('should optimize SVG with multipass false', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'icons', 'arrow-up.svg'))
    const plugin = svgo({ multipass: false })
    const result = await measureTest('svgo › should optimize SVG with multipass false', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  // Тестируем, что не-SVG буфер возвращается без изменений
  it('should return non-SVG buffer unchanged', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'burg.jpg'))
    const plugin = svgo({})
    const result = await measureTest('svgo › should return non-SVG buffer unchanged', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result).toEqual(buffer)
  })

  // Тестируем обработку PNG (не-SVG)
  it('should return PNG buffer unchanged', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.png'))
    const plugin = svgo({})
    const result = await measureTest('svgo › should return PNG buffer unchanged', buffer, () => plugin(buffer))
    expect(result).toEqual(buffer)
  })

  // Тестируем обработку GIF (не-SVG)
  it('should return GIF buffer unchanged', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.gif'))
    const plugin = svgo({})
    const result = await measureTest('svgo › should return GIF buffer unchanged', buffer, () => plugin(buffer))
    expect(result).toEqual(buffer)
  })

  // Тестируем обработку WebP (не-SVG)
  it('should return WebP buffer unchanged', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'waves.webp'))
    const plugin = svgo({})
    const result = await measureTest('svgo › should return WebP buffer unchanged', buffer, () => plugin(buffer))
    expect(result).toEqual(buffer)
  })

  // Тестируем обработку с кастомными опциями (например, удаление атрибутов viewBox)
  it('should optimize SVG with custom options', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'icons', 'circle-fill.svg'))
    const plugin = svgo({
      plugins: [
        {
          name: 'removeViewBox',
        },
      ],
    })
    const result = await measureTest('svgo › should optimize SVG with custom options', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  // Тестируем оптимизацию SVG с дефолтными опциями (вызов без аргументов)
  it('should optimize SVG with default options', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'icons', 'front.svg'))
    const plugin = svgo()
    const result = await measureTest('svgo › should optimize SVG with default options', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
    expect(result.length).toBeLessThanOrEqual(buffer.length)
  })

  afterAll(() => {
    logSuiteSummary('svgo')
  })
})
