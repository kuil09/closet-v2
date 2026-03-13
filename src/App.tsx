import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ClothesListPage from './pages/ClothesListPage'
import ClothesAddPage from './pages/ClothesAddPage'
import ClothesDetailPage from './pages/ClothesDetailPage'
import ClothesEditPage from './pages/ClothesEditPage'
import OutfitsListPage from './pages/OutfitsListPage'
import OutfitDetailPage from './pages/OutfitDetailPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/clothes" replace />} />
        <Route path="/clothes" element={<ClothesListPage />} />
        <Route path="/clothes/add" element={<ClothesAddPage />} />
        <Route path="/clothes/:id" element={<ClothesDetailPage />} />
        <Route path="/clothes/:id/edit" element={<ClothesEditPage />} />
        <Route path="/outfits" element={<OutfitsListPage />} />
        <Route path="/outfits/:id" element={<OutfitDetailPage />} />
      </Route>
    </Routes>
  )
}

export default App
