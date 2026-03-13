import { useEffect, useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'

function Layout() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <header className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between shrink-0">
        <h1 className="text-lg font-bold tracking-tight">Closet</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {!isOnline && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            오프라인 상태입니다. 저장된 데이터는 계속 볼 수 있지만 새 사진 업로드는 제한될 수 있습니다.
          </div>
        )}
        <Outlet />
      </main>

      <nav className="bg-white border-t border-slate-200 flex shrink-0 safe-area-bottom">
        <NavLink
          to="/clothes"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs ${
              isActive ? 'text-blue-500 font-semibold' : 'text-slate-400'
            }`
          }
        >
          <svg className="w-6 h-6 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          옷장
        </NavLink>
        <NavLink
          to="/clothes/add"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs ${
              isActive ? 'text-blue-500 font-semibold' : 'text-slate-400'
            }`
          }
        >
          <svg className="w-6 h-6 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          등록
        </NavLink>
        <NavLink
          to="/outfits"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs ${
              isActive ? 'text-blue-500 font-semibold' : 'text-slate-400'
            }`
          }
        >
          <svg className="w-6 h-6 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
          </svg>
          코디
        </NavLink>
      </nav>
    </div>
  )
}

export default Layout
