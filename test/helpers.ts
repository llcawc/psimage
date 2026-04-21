/**
 * Test helper utilities for logging test results
 */

import prettyBytes from 'pretty-bytes'

export interface TestResult {
  testName: string
  originalSize: number
  processedSize: number
  durationMs: number
  success: boolean
}

const results: TestResult[] = []

/**
 * Record a test result for later summary
 */
export function recordTestResult(result: TestResult): void {
  results.push(result)
}

/**
 * Log a single test result to console
 */
export function logTestResult(result: TestResult): void {
  const { testName, originalSize, processedSize, durationMs, success } = result
  const compressionRatio = ((originalSize - processedSize) / originalSize) * 100
  const sizeChange = originalSize - processedSize

  console.log(`\n📊 Test: ${testName}`)
  console.log(`   Status: ${success ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   Original size: ${prettyBytes(originalSize)}`)
  console.log(`   Processed size: ${prettyBytes(processedSize)}`)
  if (originalSize > 0) {
    console.log(`   Size change: ${sizeChange >= 0 ? '-' : '+'}${prettyBytes(Math.abs(sizeChange))}`)
    console.log(`   Compression ratio: ${compressionRatio.toFixed(2)}%`)
  }
  console.log(`   Duration: ${durationMs}ms`)
}

/**
 * Log summary for a test suite (describe block)
 */
export function logSuiteSummary(suiteName: string): void {
  const suiteResults = results.filter((r) => r.testName.startsWith(suiteName))
  if (suiteResults.length === 0) {
    return
  }

  console.log(`\n📈 Suite Summary: ${suiteName}`)
  console.log('='.repeat(50))

  let totalOriginal = 0
  let totalProcessed = 0
  let totalDuration = 0
  let passed = 0

  suiteResults.forEach((r) => {
    totalOriginal += r.originalSize
    totalProcessed += r.processedSize
    totalDuration += r.durationMs
    if (r.success) {
      passed++
    }
  })

  const totalCompression = totalOriginal - totalProcessed
  const avgCompressionRatio = totalOriginal > 0 ? (totalCompression / totalOriginal) * 100 : 0

  console.log(`   Tests passed: ${passed}/${suiteResults.length}`)
  console.log(`   Total original size: ${prettyBytes(totalOriginal)}`)
  console.log(`   Total processed size: ${prettyBytes(totalProcessed)}`)
  console.log(`   Total size reduction: ${prettyBytes(totalCompression)}`)
  console.log(`   Average compression: ${avgCompressionRatio.toFixed(2)}%`)
  console.log(`   Total duration: ${totalDuration}ms`)
  console.log('='.repeat(50))

  // Clear results for this suite to avoid mixing with other suites
  const indices = results.map((_, idx) => idx).filter((idx) => results[idx].testName.startsWith(suiteName))
  indices.reverse().forEach((idx) => results.splice(idx, 1))
}

/**
 * Measure execution time of an async function and record result
 */
export async function measureTest(
  testName: string,
  originalBuffer: Uint8Array,
  testFn: () => Promise<Uint8Array>,
): Promise<Uint8Array> {
  const start = performance.now()
  try {
    const resultBuffer = await testFn()
    const end = performance.now()
    const durationMs = end - start

    recordTestResult({
      testName,
      originalSize: originalBuffer.length,
      processedSize: resultBuffer.length,
      durationMs,
      success: true,
    })

    logTestResult({
      testName,
      originalSize: originalBuffer.length,
      processedSize: resultBuffer.length,
      durationMs,
      success: true,
    })

    return resultBuffer
  } catch (error) {
    const end = performance.now()
    const durationMs = end - start

    recordTestResult({
      testName,
      originalSize: originalBuffer.length,
      processedSize: originalBuffer.length,
      durationMs,
      success: false,
    })

    console.log(`\n❌ Test failed: ${testName}`)
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}
