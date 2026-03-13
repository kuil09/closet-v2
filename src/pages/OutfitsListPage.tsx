import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllClothes } from '../db/clothes'
import { addOutfit, deleteOutfit, getAllOutfits, updateOutfit } from '../db/outfits'
import type { ClothesItem, OutfitItem } from '../db'

function OutfitsListPage() {
  const [outfits, setOutfits] = useState<OutfitItem[]>([])
  const [clothes, setClothes] = useState<ClothesItem[]>([])
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({})
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [selectedClothesIds, setSelectedClothesIds] = useState<number[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [allOutfits, allClothes] = await Promise.all([getAllOutfits(), getAllClothes()])
      setOutfits(allOutfits)
      setClothes(allClothes)
    } catch {
      setLoadError('코디 데이터를 불러오지 못했습니다. 네트워크 또는 브라우저 저장소 상태를 확인해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

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

  const clothesById = useMemo(() => {
    const map = new Map<number, ClothesItem>()
    for (const item of clothes) {
      if (item.id) map.set(item.id, item)
    }
    return map
  }, [clothes])

  const resetComposer = () => {
    setEditingId(null)
    setName('')
    setTagsInput('')
    setSelectedClothesIds([])
    setIsComposerOpen(false)
  }

  const toggleClothes = (id: number) => {
    setSelectedClothesIds(prev =>
      prev.includes(id) ? prev.filter(clothesId => clothesId !== id) : [...prev, id]
    )
  }

  const handleEdit = (outfit: OutfitItem) => {
    setEditingId(outfit.id ?? null)
    setName(outfit.name)
    setTagsInput(outfit.tags.join(', '))
    setSelectedClothesIds(outfit.clothesIds)
    setIsComposerOpen(true)
  }

  const handleDelete = async (id?: number) => {
    if (!id || !confirm('이 코디를 삭제하시겠습니까?')) return
    await deleteOutfit(id)
    await load()
  }

  const handleSave = async () => {
    if (selectedClothesIds.length === 0 || saving) return

    setSaving(true)
    try {
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)

      if (editingId) {
        await updateOutfit(editingId, {
          name: name || '이름 없는 코디',
          tags,
          clothesIds: selectedClothesIds,
        })
      } else {
        await addOutfit({
          name: name || '새 코디',
          tags,
          clothesIds: selectedClothesIds,
        })
      }

      await load()
      resetComposer()
    } finally {
      setSaving(false)
    }
  }

  const hasClothes = clothes.length > 0
  const allTags = useMemo(
    () => [...new Set(outfits.flatMap(outfit => outfit.tags.map(tag => tag.trim()).filter(Boolean)))],
    [outfits]
  )

  const filteredOutfits = useMemo(() => {
    if (selectedTags.length === 0) return outfits
    return outfits.filter(outfit => selectedTags.every(tag => outfit.tags.includes(tag)))
  }, [outfits, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(current => current !== tag) : [...prev, tag]))
  }

  if (loading) {
    return <div className="py-10 text-center text-sm text-slate-400">코디를 불러오는 중...</div>
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 space-y-3">
        <p>{loadError}</p>
        <button onClick={load} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white">
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">코디</h2>
          <p className="text-slate-400 text-sm mt-1">등록된 옷을 조합해서 코디를 저장할 수 있습니다.</p>
        </div>
        <button
          onClick={() => {
            if (!isComposerOpen) {
              setEditingId(null)
              setName('')
              setTagsInput('')
              setSelectedClothesIds([])
            }
            setIsComposerOpen(prev => !prev)
          }}
          disabled={!hasClothes}
          className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {isComposerOpen ? '닫기' : '+ 코디 추가'}
        </button>
      </div>

      {outfits.length > 0 && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">코디 탐색</p>
            <button
              onClick={() => setSelectedTags([])}
              disabled={selectedTags.length === 0}
              className="text-xs text-slate-500 disabled:opacity-40"
            >
              태그 초기화
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
                viewMode === 'list' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              목록
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
                viewMode === 'gallery' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              갤러리
            </button>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">태그 필터</p>
            {allTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => {
                  const selected = selectedTags.includes(tag)

                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs ${
                        selected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      #{tag}
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400">등록된 태그가 없습니다.</p>
            )}
          </div>
        </div>
      )}

      {!hasClothes && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 mb-4">
          코디를 만들려면 먼저 옷을 등록해야 합니다.{' '}
          <Link to="/clothes/add" className="text-blue-500 font-medium">
            옷 등록하러 가기
          </Link>
        </div>
      )}

      {isComposerOpen && hasClothes && (
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <h3 className="font-semibold text-slate-800">{editingId ? '코디 수정' : '새 코디 만들기'}</h3>
          <input
            type="text"
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="코디 이름 (예: 출근룩)"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={tagsInput}
            onChange={event => setTagsInput(event.target.value)}
            placeholder="태그 (쉼표로 구분, 예: 캐주얼, 봄)"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">옷 선택 ({selectedClothesIds.length})</p>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
              {clothes.map(item => {
                const id = item.id
                if (!id) return null

                const selected = selectedClothesIds.includes(id)

                return (
                  <button
                    key={id}
                    onClick={() => toggleClothes(id)}
                    className={`relative rounded-lg overflow-hidden border-2 ${
                      selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'
                    }`}
                  >
                    <img
                      src={imageUrls[id]}
                      alt={item.name}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/65 text-white px-1.5 py-1 text-xs truncate">
                      {item.name}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={selectedClothesIds.length === 0 || saving}
              className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium disabled:opacity-50"
            >
              {saving ? '저장 중...' : editingId ? '수정 저장' : '코디 저장'}
            </button>
            <button
              onClick={resetComposer}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {outfits.length === 0 ? (
        <div className="mt-6 text-center text-slate-300">
          <svg className="w-16 h-16 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
          </svg>
          <p className="text-slate-400 text-sm">아직 등록된 코디가 없습니다.</p>
        </div>
      ) : filteredOutfits.length === 0 ? (
        <div className="mt-6 text-center text-slate-300">
          <svg className="w-16 h-16 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
          </svg>
          <p className="text-slate-400 text-sm">선택한 태그에 맞는 코디가 없습니다.</p>
          <button onClick={() => setSelectedTags([])} className="text-blue-500 text-sm mt-1">
            태그 초기화
          </button>
        </div>
      ) : viewMode === 'gallery' ? (
        <div className="grid grid-cols-2 gap-3">
          {filteredOutfits.map(outfit => {
            const pickedClothes = outfit.clothesIds
              .map(id => clothesById.get(id))
              .filter((item): item is ClothesItem => Boolean(item))

            const cover = pickedClothes.find(item => item.id)

            return (
              <article
                key={outfit.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                <Link to={`/outfits/${outfit.id}`} className="block">
                  {cover?.id ? (
                    <img
                      src={imageUrls[cover.id]}
                      alt={outfit.name}
                      className="aspect-square w-full object-cover bg-slate-100"
                    />
                  ) : (
                    <div className="aspect-square w-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                      이미지 없음
                    </div>
                  )}
                </Link>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-slate-800 truncate">{outfit.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1">아이템 {pickedClothes.length}개</p>
                  {outfit.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {outfit.tags.slice(0, 3).map(tag => (
                        <span
                          key={`${outfit.id}-${tag}`}
                          className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOutfits.map(outfit => {
            const pickedClothes = outfit.clothesIds
              .map(id => clothesById.get(id))
              .filter((item): item is ClothesItem => Boolean(item))

            return (
              <article key={outfit.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-800">{outfit.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {pickedClothes.length}개 아이템 · {outfit.createdAt.toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs shrink-0">
                    <Link to={`/outfits/${outfit.id}`} className="text-slate-500 font-medium">
                      상세
                    </Link>
                    <button onClick={() => handleEdit(outfit)} className="text-blue-500 font-medium">
                      수정
                    </button>
                    <button onClick={() => handleDelete(outfit.id)} className="text-red-500 font-medium">
                      삭제
                    </button>
                  </div>
                </div>
                {outfit.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {outfit.tags.map(tag => (
                      <span key={`${outfit.id}-${tag}`} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-4 gap-2">
                  {pickedClothes.slice(0, 4).map(item =>
                    item.id ? (
                      <img
                        key={item.id}
                        src={imageUrls[item.id]}
                        alt={item.name}
                        className="aspect-square rounded-md object-cover bg-slate-100"
                      />
                    ) : null
                  )}
                  {pickedClothes.length === 0 && (
                    <div className="col-span-4 text-xs text-slate-400 py-2">연결된 옷이 없습니다.</div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OutfitsListPage
