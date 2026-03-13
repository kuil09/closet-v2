import { describe, expect, it } from 'vitest'
import { addClothes, getAllClothes, getClothes, updateClothes } from './clothes'

const sampleBlob = new Blob(['x'], { type: 'image/jpeg' })

describe('clothes db helpers', () => {
  it('adds and retrieves a clothes item', async () => {
    const id = await addClothes({
      name: '테스트 티셔츠',
      category: '상의',
      color: '화이트',
      season: ['봄'],
      memo: 'unit test',
      imageBlob: sampleBlob,
      thumbnailBlob: sampleBlob,
    })

    expect(id).toBeTypeOf('number')

    const item = await getClothes(id!)
    expect(item?.name).toBe('테스트 티셔츠')
    expect(item?.createdAt).toBeInstanceOf(Date)
    expect(item?.updatedAt).toBeInstanceOf(Date)
  })

  it('returns newest items first', async () => {
    await addClothes({
      name: 'old',
      category: '상의',
      color: '블랙',
      season: [],
      memo: '',
      imageBlob: sampleBlob,
      thumbnailBlob: sampleBlob,
    })

    await addClothes({
      name: 'new',
      category: '하의',
      color: '화이트',
      season: [],
      memo: '',
      imageBlob: sampleBlob,
      thumbnailBlob: sampleBlob,
    })

    const items = await getAllClothes()
    expect(items[0]?.name).toBe('new')
    expect(items[1]?.name).toBe('old')
  })

  it('updates fields and refreshes updatedAt', async () => {
    const id = await addClothes({
      name: 'before',
      category: '상의',
      color: '',
      season: [],
      memo: '',
      imageBlob: sampleBlob,
      thumbnailBlob: sampleBlob,
    })

    const before = await getClothes(id!)
    await new Promise(resolve => setTimeout(resolve, 5))
    await updateClothes(id!, { name: 'after' })
    const after = await getClothes(id!)

    expect(after?.name).toBe('after')
    expect(after?.updatedAt.getTime()).toBeGreaterThan(before!.updatedAt.getTime())
  })
})
