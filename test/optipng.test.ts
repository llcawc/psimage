// oxlint-disable typescript/no-explicit-any
import fs from 'fs'
import path from 'path'

import { describe, it, expect, afterAll } from 'vitest'

import optipng from '../src/optipng.js'
import { measureTest, logSuiteSummary } from './helpers.js'

describe('optipng', () => {
  const imageDir = './images'

  // Тестируем сжатие PNG с уровнем оптимизации по умолчанию
  it('should compress PNG', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.png'))
    const plugin = optipng({ optimizationLevel: 3 })
    const result = await measureTest('optipng › should compress PNG', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
    // Сжатый PNG должен быть меньше или равен исходному
    expect(result.length).toBeLessThanOrEqual(buffer.length)
  })

  // Тестируем сжатие с высоким уровнем оптимизации
  it('should compress PNG with optimizationLevel 7', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.png'))
    const plugin = optipng({ optimizationLevel: 7 })
    const result = await measureTest('optipng › should compress PNG with optimizationLevel 7', buffer, () =>
      plugin(buffer),
    )
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
    expect(result.length).toBeLessThanOrEqual(buffer.length)
  })

  // Тестируем сжатие с низким уровнем оптимизации
  it('should compress PNG with optimizationLevel 0', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.png'))
    const plugin = optipng({ optimizationLevel: 0 })
    const result = await measureTest('optipng › should compress PNG with optimizationLevel 0', buffer, () =>
      plugin(buffer),
    )
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
    // При уровне 0 размер может не уменьшиться, но должен быть не больше исходного
    expect(result.length).toBeLessThanOrEqual(buffer.length)
  })

  // Тестируем чересстрочный (interlaced) PNG
  it('should produce interlaced PNG', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.png'))
    const plugin = optipng({ interlaced: true })
    const result = await measureTest('optipng › should produce interlaced PNG', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  // Тестируем отключение уменьшения глубины цвета
  it('should compress PNG without bit depth reduction', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.png'))
    const plugin = optipng({ bitDepthReduction: false })
    const result = await measureTest('optipng › should compress PNG without bit depth reduction', buffer, () =>
      plugin(buffer),
    )
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  // Тестируем отключение уменьшения типа цвета
  it('should compress PNG without color type reduction', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.png'))
    const plugin = optipng({ colorTypeReduction: false })
    const result = await measureTest('optipng › should compress PNG without color type reduction', buffer, () =>
      plugin(buffer),
    )
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  // Тестируем отключение уменьшения палитры
  it('should compress PNG without palette reduction', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.png'))
    const plugin = optipng({ paletteReduction: false })
    const result = await measureTest('optipng › should compress PNG without palette reduction', buffer, () =>
      plugin(buffer),
    )
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  // Тестируем отключение восстановления ошибок
  it('should compress PNG without error recovery', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.png'))
    const plugin = optipng({ errorRecovery: false })
    const result = await measureTest('optipng › should compress PNG without error recovery', buffer, () =>
      plugin(buffer),
    )
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  // Тестируем, что не-PNG буфер возвращается без изменений
  it('should return non-PNG buffer unchanged', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'burg.jpg'))
    const plugin = optipng()
    const result = await measureTest('optipng › should return non-PNG buffer unchanged', buffer, () => plugin(buffer))
    expect(result).toBeInstanceOf(Buffer)
    expect(result).toEqual(buffer)
  })

  // Тестируем обработку GIF (не-PNG)
  it('should return GIF buffer unchanged', async () => {
    const buffer = fs.readFileSync(path.join(imageDir, 'world.gif'))
    const plugin = optipng()
    const result = await measureTest('optipng › should return GIF buffer unchanged', buffer, () => plugin(buffer))
    expect(result).toEqual(buffer)
  })

  afterAll(() => {
    logSuiteSummary('optipng')
  })
})
