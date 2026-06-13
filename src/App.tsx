import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import TabBar from './components/layout/TabBar'
import HomePage from './pages/HomePage'
import ClosetPage from './pages/ClosetPage'
import ProfilePage from './pages/ProfilePage'
import CalendarPage from './pages/CalendarPage'
import AuthPage from './pages/AuthPage'

function AppShell() {
  const { session, isLoading } = useAuth()
  const location = useLocation()
  const hideTabBar = location.pathname.startsWith('/calendar')

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-accent-yellow flex items-center justify-center text-2xl shadow-card animate-pulse">
            👗
          </div>
          <p className="text-sm text-text-tertiary">Loading your closet…</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <AuthPage />
  }

  return (
    <div className="relative h-full bg-background">
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home/*" element={<HomePage />} />
        <Route path="/closet/*" element={<ClosetPage />} />
        <Route path="/profile/*" element={<ProfilePage />} />
        <Route path="/calendar/*" element={<CalendarPage />} />
      </Routes>
      {!hideTabBar && <TabBar />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
