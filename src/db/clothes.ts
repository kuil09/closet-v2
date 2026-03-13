import { db, type ClothesItem } from './index'

export async function addClothes(
  item: Omit<ClothesItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<number | undefined> {
  const now = new Date()
  return db.clothes.add({
    ...item,
    createdAt: now,
    updatedAt: now,
  })
}

export async function getClothes(id: number): Promise<ClothesItem | undefined> {
  return db.clothes.get(id)
}

export async function getAllClothes(): Promise<ClothesItem[]> {
  return db.clothes.orderBy('createdAt').reverse().toArray()
}

export async function getClothesByCategory(category: string): Promise<ClothesItem[]> {
  return db.clothes.where('category').equals(category).reverse().sortBy('createdAt')
}

export async function updateClothes(
  id: number,
  changes: Partial<Omit<ClothesItem, 'id' | 'createdAt'>>
): Promise<number> {
  return db.clothes.update(id, {
    ...changes,
    updatedAt: new Date(),
  })
}

export async function deleteClothes(id: number): Promise<void> {
  await db.clothes.delete(id)
}
