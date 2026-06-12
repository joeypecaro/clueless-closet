import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './contexts/ToastContext'
import TabBar from './components/layout/TabBar'
import HomePage from './pages/HomePage'
import ClosetPage from './pages/ClosetPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="relative h-full bg-background">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home/*" element={<HomePage />} />
            <Route path="/closet/*" element={<ClosetPage />} />
            <Route path="/profile/*" element={<ProfilePage />} />
          </Routes>
          <TabBar />
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}
