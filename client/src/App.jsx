import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import LoginPage from './pages/LoginPage';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#C8FF00] text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#C8FF00] text-xl font-display">Loading CDP...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {isAuthenticated && <Navbar />}
      
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed top-[-200px] left-1/2 -translate-x-1/2
                  w-[600px] h-[400px] rounded-full opacity-[0.04] blur-[120px]"
        style={{ backgroundColor: '#C8FF00' }}
      />

      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <LoginPage />
        } />
        
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        
        <Route path="/groups" element={
          <ProtectedRoute>
            <GroupsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/groups/:id" element={
          <ProtectedRoute>
            <GroupDetailPage />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
