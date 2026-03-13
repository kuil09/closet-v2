import { db, type CategoryItem } from './index'

export async function getAllCategories(): Promise<CategoryItem[]> {
  return db.categories.toArray()
}

export async function getCategoriesByType(type: string): Promise<CategoryItem[]> {
  return db.categories.where('type').equals(type).toArray()
}
