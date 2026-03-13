import { describe, expect, it } from 'vitest'
import { getAllCategories } from './categories'
import { seedCategories } from './index'

describe('category seed', () => {
  it('adds defaults only once', async () => {
    await seedCategories()
    await seedCategories()

    const categories = await getAllCategories()
    expect(categories).toHaveLength(5)
    expect(categories.map(cat => cat.name)).toEqual(['상의', '하의', '아우터', '신발', '액세서리'])
  })
})
