/**
 * Determines if a given buffer contains a PNG image by checking its magic number.
 *
 * @param buffer - A Uint8Array (or null/undefined) representing the file data. Only the first 8 bytes are needed.
 * @returns `true` if the buffer starts with the PNG signature (0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A), `false` otherwise.
 *
 * @example
 * ```ts
 * // Node.js:
 * import {readChunk} from 'read-chunk';
 * import isPng from './is-png';
 *
 * const buffer = await readChunk('unicorn.png', {length: 8});
 * console.log(isPng(buffer)); // true
 * ```
 *
 * @example
 * ```ts
 * // Browser:
 * import isPng from './is-png';
 *
 * const response = await fetch('unicorn.png');
 * const buffer = await response.arrayBuffer();
 * console.log(isPng(new Uint8Array(buffer))); // true
 * ```
 */
export default function isPng(buffer: Uint8Array | null | undefined): boolean {
  if (!buffer || buffer.length < 8) {
    return false
  }

  return (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  )
}
