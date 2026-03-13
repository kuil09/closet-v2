import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getOutfit, deleteOutfit } from '../db/outfits'
import { getAllClothes } from '../db/clothes'
import type { ClothesItem, OutfitItem } from '../db'

function OutfitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [outfit, setOutfit] = useState<OutfitItem | null>(null)
  const [clothes, setClothes] = useState<ClothesItem[]>([])
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({})
  const [deleting, setDeleting] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      navigate('/outfits', { replace: true })
      return
    }

    const outfitId = Number(id)

    Promise.all([getOutfit(outfitId), getAllClothes()])
      .then(([foundOutfit, allClothes]) => {
        if (!foundOutfit) {
          navigate('/outfits', { replace: true })
          return
        }

        setOutfit(foundOutfit)
        setClothes(allClothes)
      })
      .catch(() => {
        setLoadError('코디 상세를 불러오지 못했습니다.')
      })
  }, [id, navigate])

  useEffect(() => {
    const nextUrls: Record<number, string> = {}

    for (const item of clothes) {
      if (item.id) {
        nextUrls[item.id] = URL.createObjectURL(item.thumbnailBlob)
      }
    }

    setImageUrls(nextUrls)

    return () => {
      for (const url of Object.values(nextUrls)) {
        URL.revokeObjectURL(url)
      }
    }
  }, [clothes])

  const pickedClothes = useMemo(() => {
    if (!outfit) return []

    const clothesById = new Map<number, ClothesItem>()
    for (const item of clothes) {
      if (item.id) clothesById.set(item.id, item)
    }

    return outfit.clothesIds
      .map(clothesId => clothesById.get(clothesId))
      .filter((item): item is ClothesItem => Boolean(item))
  }, [outfit, clothes])

  const handleDelete = async () => {
    if (!outfit?.id || deleting || !confirm('이 코디를 삭제하시겠습니까?')) return

    setDeleting(true)
    try {
      await deleteOutfit(outfit.id)
      navigate('/outfits', { replace: true })
    } finally {
      setDeleting(false)
    }
  }

  if (!outfit) {
    if (loadError) {
      return <div className="py-12 text-center text-sm text-red-500">{loadError}</div>
    }

    return <div className="py-12 text-center text-sm text-slate-400">로딩 중...</div>
  }

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-blue-500 text-sm">
          &larr; 뒤로
        </button>
        <h2 className="text-lg font-bold">코디 상세</h2>
        <button onClick={handleDelete} disabled={deleting} className="text-red-500 text-sm disabled:opacity-50">
          삭제
        </button>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-semibold text-slate-800">{outfit.name}</h3>
        <p className="text-xs text-slate-400 mt-1">
          {pickedClothes.length}개 아이템 · {outfit.createdAt.toLocaleDateString('ko-KR')}
        </p>

        {outfit.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {outfit.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2">
          {pickedClothes.map(item =>
            item.id ? (
              <Link
                key={item.id}
                to={`/clothes/${item.id}`}
                className="rounded-lg overflow-hidden bg-slate-100 border border-slate-200"
              >
                <img src={imageUrls[item.id]} alt={item.name} className="aspect-square w-full object-cover" />
                <p className="px-2 py-1 text-xs text-slate-600 truncate">{item.name}</p>
              </Link>
            ) : null
          )}
        </div>

        {pickedClothes.length === 0 && (
          <p className="text-sm text-slate-400 mt-4">연결된 옷이 없습니다.</p>
        )}
      </article>
    </div>
  )
}

export default OutfitDetailPage
