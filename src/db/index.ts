import Dexie, { type EntityTable } from 'dexie'

export interface ClothesItem {
  id?: number
  name: string
  category: string
  color: string
  season: string[]
  memo: string
  imageBlob: Blob
  thumbnailBlob: Blob
  createdAt: Date
  updatedAt: Date
}

export interface OutfitItem {
  id?: number
  name: string
  tags: string[]
  clothesIds: number[]
  createdAt: Date
  updatedAt: Date
}

export interface CategoryItem {
  id?: number
  name: string
  type: string
}

class ClosetDB extends Dexie {
  clothes!: EntityTable<ClothesItem, 'id'>
  outfits!: EntityTable<OutfitItem, 'id'>
  categories!: EntityTable<CategoryItem, 'id'>

  constructor() {
    super('closet-db')

    this.version(1).stores({
      clothes: '++id, category, color, *season, createdAt',
      outfits: '++id, *tags, createdAt',
      categories: '++id, type',
    })
  }
}

export const db = new ClosetDB()

const DEFAULT_CATEGORIES: Omit<CategoryItem, 'id'>[] = [
  { name: '상의', type: 'top' },
  { name: '하의', type: 'bottom' },
  { name: '아우터', type: 'outer' },
  { name: '신발', type: 'shoes' },
  { name: '액세서리', type: 'accessory' },
]

export async function seedCategories() {
  const count = await db.categories.count()
  if (count === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES)
  }
}
