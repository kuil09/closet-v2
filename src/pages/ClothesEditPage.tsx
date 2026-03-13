import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getClothes, updateClothes } from '../db/clothes'
import { getAllCategories } from '../db/categories'
import { createThumbnail, resizeImage } from '../db/image'
import type { ClothesItem, CategoryItem } from '../db'

const COLORS = [
  { name: '블랙', value: '#000000' },
  { name: '화이트', value: '#ffffff' },
  { name: '그레이', value: '#9ca3af' },
  { name: '네이비', value: '#1e3a5f' },
  { name: '블루', value: '#3b82f6' },
  { name: '레드', value: '#ef4444' },
  { name: '핑크', value: '#ec4899' },
  { name: '베이지', value: '#d4a574' },
  { name: '브라운', value: '#8b4513' },
  { name: '그린', value: '#22c55e' },
  { name: '옐로우', value: '#eab308' },
  { name: '퍼플', value: '#a855f7' },
]

const SEASONS = ['봄', '여름', '가을', '겨울']

function ClothesEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [item, setItem] = useState<ClothesItem | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [newImageBlob, setNewImageBlob] = useState<Blob | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [color, setColor] = useState('')
  const [season, setSeason] = useState<string[]>([])
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    getAllCategories().then(setCategories)
    if (id) {
      getClothes(Number(id))
        .then(result => {
          if (!result) {
            navigate('/clothes', { replace: true })
            return
          }
          setItem(result)
          setName(result.name)
          setCategory(result.category)
          setColor(result.color)
          setSeason(result.season)
          setMemo(result.memo)
          setImagePreview(URL.createObjectURL(result.imageBlob))
        })
        .catch(() => {
          setFormError('기존 옷 정보를 불러오지 못했습니다.')
        })
    }
  }, [id, navigate])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFormError(null)
    try {
      const resized = await resizeImage(file)
      setNewImageBlob(resized)
      setImagePreview(URL.createObjectURL(resized))
    } catch {
      setFormError('이미지 변경에 실패했습니다. 다른 파일로 다시 시도해 주세요.')
    }
  }

  const toggleSeason = (s: string) => {
    setSeason(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const handleSubmit = async () => {
    if (!item?.id || !category) return
    setSaving(true)
    setFormError(null)
    try {
      const changes: Parameters<typeof updateClothes>[1] = {
        name: name || '이름 없음',
        category,
        color,
        season,
        memo,
      }
      if (newImageBlob) {
        changes.imageBlob = newImageBlob
        changes.thumbnailBlob = await createThumbnail(newImageBlob)
      }
      await updateClothes(item.id, changes)
      navigate(`/clothes/${item.id}`, { replace: true })
    } catch {
      setFormError('수정 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  if (!item) return <div className="text-center py-12 text-slate-400">로딩 중...</div>

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-blue-500 text-sm">
          &larr; 뒤로
        </button>
        <h2 className="text-lg font-bold">옷 수정</h2>
        <div className="w-10" />
      </div>

      {imagePreview && (
        <div className="relative mb-4">
          <img src={imagePreview} alt="사진" className="w-full rounded-lg object-cover max-h-64" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded"
          >
            사진 변경
          </button>
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {formError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">이름</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">카테고리 *</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.name)}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  category === cat.name ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">색상</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => setColor(c.name)}
                className={`w-8 h-8 rounded-full border-2 ${
                  color === c.name ? 'border-blue-500 scale-110' : 'border-slate-200'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">계절</label>
          <div className="flex gap-2">
            {SEASONS.map(s => (
              <button
                key={s}
                onClick={() => toggleSeason(s)}
                className={`flex-1 py-1.5 rounded-full text-sm ${
                  season.includes(s) ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">메모</label>
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!category || saving}
          className="w-full py-3 rounded-lg bg-blue-500 text-white font-medium disabled:opacity-50"
        >
          {saving ? '저장 중...' : '수정 완료'}
        </button>
      </div>
    </div>
  )
}

export default ClothesEditPage
