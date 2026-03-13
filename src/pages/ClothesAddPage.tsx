import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addClothes } from '../db/clothes'
import { getAllCategories } from '../db/categories'
import { createThumbnail, resizeImage } from '../db/image'
import type { CategoryItem } from '../db'

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

function ClothesAddPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [color, setColor] = useState('')
  const [season, setSeason] = useState<string[]>([])
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    getAllCategories().then(setCategories)
  }, [])

  const handleImageSelected = async (file: File) => {
    setFormError(null)
    try {
      const resized = await resizeImage(file)
      setImageBlob(resized)
      const url = URL.createObjectURL(resized)
      setImagePreview(url)
    } catch {
      setFormError('이미지 처리에 실패했습니다. 다른 사진으로 다시 시도해 주세요.')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageSelected(file)
  }

  const toggleSeason = (s: string) => {
    setSeason(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const handleSubmit = async () => {
    if (!imageBlob || !category) return
    setSaving(true)
    setFormError(null)
    try {
      const thumbnailBlob = await createThumbnail(imageBlob)
      await addClothes({
        name: name || '이름 없음',
        category,
        color,
        season,
        memo,
        imageBlob,
        thumbnailBlob,
      })
      navigate('/clothes')
    } catch {
      setFormError('저장에 실패했습니다. 브라우저 저장 공간 상태를 확인해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-4">
      <h2 className="text-xl font-bold mb-4">옷 등록</h2>

      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
        <p>앱 설치: 모바일 브라우저 메뉴에서 "홈 화면에 추가"를 선택하면 설치형 앱처럼 사용할 수 있습니다.</p>
        <p>권한 안내: 촬영 버튼이 동작하지 않으면 브라우저의 카메라 권한을 허용해 주세요.</p>
      </div>

      {formError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </div>
      )}

      {imagePreview ? (
        <div className="relative mb-4">
          <img src={imagePreview} alt="선택된 사진" className="w-full rounded-lg object-cover max-h-64" />
          <button
            onClick={() => { setImagePreview(null); setImageBlob(null) }}
            className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
          >
            x
          </button>
        </div>
      ) : (
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 py-10 rounded-lg bg-blue-500 text-white font-medium flex flex-col items-center gap-2"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
            </svg>
            촬영
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-10 rounded-lg bg-slate-200 text-slate-700 font-medium flex flex-col items-center gap-2"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
            사진첩
          </button>
        </div>
      )}

      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">이름</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="예: 흰색 티셔츠"
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
                  category === cat.name
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-600'
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
                  season.includes(s)
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-600'
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
            placeholder="옷에 대한 메모를 입력하세요"
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!imageBlob || !category || saving}
          className="w-full py-3 rounded-lg bg-blue-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '저장 중...' : '등록하기'}
        </button>
      </div>
    </div>
  )
}

export default ClothesAddPage
