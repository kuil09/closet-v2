import { useState, useEffect, useMemo, type Dispatch, type SetStateAction } from 'react'
import { Link } from 'react-router-dom'
import { getAllClothes } from '../db/clothes'
import { getAllCategories } from '../db/categories'
import type { ClothesItem, CategoryItem } from '../db'

const SEASONS = ['봄', '여름', '가을', '겨울']

function ClothesListPage() {
  const [clothes, setClothes] = useState<ClothesItem[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({})
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [allClothes, allCategories] = await Promise.all([getAllClothes(), getAllCategories()])
      setClothes(allClothes)
      setCategories(allCategories)
    } catch {
      setLoadError('옷장 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
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

  const colorOptions = useMemo(() => {
    return [...new Set(clothes.map(item => item.color).filter(Boolean))]
  }, [clothes])

  const hasActiveFilter =
    selectedCategories.length > 0 ||
    selectedSeasons.length > 0 ||
    selectedColors.length > 0 ||
    query.trim().length > 0

  const toggleSelect = (value: string, setter: Dispatch<SetStateAction<string[]>>) => {
    setter(prev => (prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]))
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedSeasons([])
    setSelectedColors([])
    setQuery('')
  }

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return clothes.filter(item => {
      const categoryMatched =
        selectedCategories.length === 0 || selectedCategories.includes(item.category)
      const seasonMatched =
        selectedSeasons.length === 0 || item.season.some(season => selectedSeasons.includes(season))
      const colorMatched = selectedColors.length === 0 || selectedColors.includes(item.color)
      const memoMatched =
        normalizedQuery.length === 0 ||
        item.memo.toLowerCase().includes(normalizedQuery) ||
        item.name.toLowerCase().includes(normalizedQuery)

      return categoryMatched && seasonMatched && colorMatched && memoMatched
    })
  }, [clothes, selectedCategories, selectedSeasons, selectedColors, query])

  if (loading) {
    return <div className="py-10 text-center text-sm text-slate-400">옷장을 불러오는 중...</div>
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">내 옷장</h2>
        <Link
          to="/clothes/add"
          className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
        >
          + 등록
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 mb-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-700">탐색 필터</h3>
          <button
            onClick={clearFilters}
            disabled={!hasActiveFilter}
            className="text-xs text-slate-500 disabled:opacity-40"
          >
            초기화
          </button>
        </div>

        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="메모 또는 이름 검색"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">카테고리</p>
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
            {categories.map(cat => {
              const selected = selectedCategories.includes(cat.name)

              return (
                <button
                  key={cat.id}
                  onClick={() => toggleSelect(cat.name, setSelectedCategories)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    selected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">계절</p>
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
            {SEASONS.map(season => {
              const selected = selectedSeasons.includes(season)

              return (
                <button
                  key={season}
                  onClick={() => toggleSelect(season, setSelectedSeasons)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    selected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {season}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">색상</p>
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
            {colorOptions.map(color => {
              const selected = selectedColors.includes(color)

              return (
                <button
                  key={color}
                  onClick={() => toggleSelect(color, setSelectedColors)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    selected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {color}
                </button>
              )
            })}
            {colorOptions.length === 0 && (
              <p className="text-xs text-slate-400 py-1">등록된 색상이 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
          {clothes.length === 0 ? (
            <>
              <p className="text-slate-400 text-sm">아직 등록된 옷이 없습니다.</p>
              <Link to="/clothes/add" className="text-blue-500 text-sm mt-1 inline-block">
                옷을 등록해보세요!
              </Link>
            </>
          ) : (
            <>
              <p className="text-slate-400 text-sm">선택한 필터에 맞는 옷이 없습니다.</p>
              <button onClick={clearFilters} className="text-blue-500 text-sm mt-1 inline-block">
                필터 초기화
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {filtered.map(item => (
            <Link
              key={item.id}
              to={`/clothes/${item.id}`}
              className="aspect-square rounded-lg overflow-hidden bg-slate-100 relative"
            >
              <img
                src={item.id ? imageUrls[item.id] : ''}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                <p className="text-white text-xs truncate">{item.name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default ClothesListPage
