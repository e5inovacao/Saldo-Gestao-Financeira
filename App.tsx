import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Limits from './pages/Limits';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Categories from './pages/Categories';
import Transactions from './pages/Transactions';
import HowItWorks from './pages/HowItWorks';
import Signup from './pages/Signup';
import Plans from './pages/Plans';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import { useAuth } from './src/contexts/AuthContext';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  if (!user) return <Login />
  return <>{children}</>
}

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/plans" element={<Plans />} />
      <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/goals" element={<RequireAuth><Goals /></RequireAuth>} />
      <Route path="/limits" element={<RequireAuth><Limits /></RequireAuth>} />
      <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
      <Route path="/categories" element={<RequireAuth><Categories /></RequireAuth>} />
      <Route path="/transactions" element={<RequireAuth><Transactions /></RequireAuth>} />
    </Routes>
  );
};

export default App;
