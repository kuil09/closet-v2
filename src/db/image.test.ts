import { describe, expect, it } from 'vitest'
import { getContainDimensions } from './image'

describe('getContainDimensions', () => {
  it('keeps landscape ratio inside max size', () => {
    expect(getContainDimensions(4000, 2000, 200)).toEqual({ width: 200, height: 100 })
  })

  it('keeps portrait ratio inside max size', () => {
    expect(getContainDimensions(2000, 4000, 200)).toEqual({ width: 100, height: 200 })
  })

  it('returns square for square input', () => {
    expect(getContainDimensions(1000, 1000, 200)).toEqual({ width: 200, height: 200 })
  })
})
