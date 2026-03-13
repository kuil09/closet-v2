import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getClothes, deleteClothes } from '../db/clothes'
import type { ClothesItem } from '../db'

function ClothesDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<ClothesItem | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      getClothes(Number(id))
        .then(result => {
          if (result) setItem(result)
          else navigate('/clothes', { replace: true })
        })
        .catch(() => {
          setLoadError('옷 상세를 불러오지 못했습니다.')
        })
    }
  }, [id, navigate])

  const imageUrl = useMemo(() => {
    if (!item) return null
    return URL.createObjectURL(item.imageBlob)
  }, [item])

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl])

  const handleDelete = async () => {
    if (!item?.id || !confirm('이 옷을 삭제하시겠습니까?')) return
    await deleteClothes(item.id)
    navigate('/clothes', { replace: true })
  }

  if (!item) {
    if (loadError) {
      return <div className="text-center py-12 text-red-500">{loadError}</div>
    }

    return <div className="text-center py-12 text-slate-400">로딩 중...</div>
  }

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-blue-500 text-sm">
          &larr; 뒤로
        </button>
        <div className="flex gap-2">
          <Link
            to={`/clothes/${item.id}/edit`}
            className="text-blue-500 text-sm font-medium"
          >
            수정
          </Link>
          <button onClick={handleDelete} className="text-red-500 text-sm font-medium">
            삭제
          </button>
        </div>
      </div>

      <img
        src={imageUrl ?? ''}
        alt={item.name}
        className="w-full rounded-lg object-cover max-h-80 mb-4"
      />

      <h2 className="text-xl font-bold mb-2">{item.name}</h2>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400 w-16">카테고리</span>
          <span className="px-2 py-0.5 bg-slate-100 rounded-full text-sm">{item.category}</span>
        </div>
        {item.color && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 w-16">색상</span>
            <span className="text-sm">{item.color}</span>
          </div>
        )}
        {item.season.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 w-16">계절</span>
            <div className="flex gap-1">
              {item.season.map(s => (
                <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs">{s}</span>
              ))}
            </div>
          </div>
        )}
        {item.memo && (
          <div>
            <span className="text-sm text-slate-400">메모</span>
            <p className="text-sm mt-1 text-slate-600">{item.memo}</p>
          </div>
        )}
        <div className="text-xs text-slate-300 pt-2">
          등록일: {item.createdAt.toLocaleDateString('ko-KR')}
        </div>
      </div>
    </div>
  )
}

export default ClothesDetailPage
