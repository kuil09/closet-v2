import { db, type OutfitItem } from './index'

export async function addOutfit(
  item: Omit<OutfitItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<number | undefined> {
  const now = new Date()
  return db.outfits.add({
    ...item,
    createdAt: now,
    updatedAt: now,
  })
}

export async function getOutfit(id: number): Promise<OutfitItem | undefined> {
  return db.outfits.get(id)
}

export async function getAllOutfits(): Promise<OutfitItem[]> {
  return db.outfits.orderBy('createdAt').reverse().toArray()
}

export async function updateOutfit(
  id: number,
  changes: Partial<Omit<OutfitItem, 'id' | 'createdAt'>>
): Promise<number> {
  return db.outfits.update(id, {
    ...changes,
    updatedAt: new Date(),
  })
}

export async function deleteOutfit(id: number): Promise<void> {
  await db.outfits.delete(id)
}
