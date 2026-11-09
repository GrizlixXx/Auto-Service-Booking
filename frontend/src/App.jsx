import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import SignIn from './pages/SignIn';
import Register from './pages/Register';
import Services from './pages/Services';
import UserAccount from './pages/UserAccount';
import AdminPanel from './pages/AdminPanel';
import OperatorPanel from './pages/OperatorPanel';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="page-wrapper">
          <Navbar />
          <div className="page-content">
            <Routes>
              <Route path="/"         element={<Home />} />
              <Route path="/signin"   element={<SignIn />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<Services />} />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <UserAccount />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operator"
                element={
                  <ProtectedRoute roles={['operator', 'admin']}>
                    <OperatorPanel />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'1rem', textAlign:'center', padding:'2rem' }}>
                  <Wrench size={56} color="#3b82f6" />
                  <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'2rem', fontWeight:800 }}>Page Not Found</h2>
                  <p style={{ color:'var(--text-secondary)' }}>The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn btn-primary">Go Home</a>
                </div>
              } />
            </Routes>
          </div>
          <Footer />
          <ChatBot />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
