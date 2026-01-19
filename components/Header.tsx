import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';

const Header: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState('/img_perfil_default/perfil_01.png');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    };
    fetchProfile();
  }, [user]); // Atualiza quando o usuário muda (login/refresh)

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/transactions', label: 'Transações' },
    { to: '/goals', label: 'Metas' },
    { to: '/limits', label: 'Limites' },
    { to: '/categories', label: 'Categorias' },
  ];

  return (
    <header className="relative flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 dark:border-background-light/10 px-4 sm:px-10 py-3 bg-background-light dark:bg-background-dark z-50">
      <div className="flex items-center gap-4 text-primary dark:text-background-light">
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex items-center justify-center p-1 rounded-md hover:bg-primary/10 dark:hover:bg-background-light/10 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">
            {isMenuOpen ? 'close' : 'menu'}
          </span>
        </button>

        <div className="size-8">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="currentColor" fillOpacity="0.1"/>
            <path d="M24 24V10C16.268 10 10 16.268 10 24C10 31.732 16.268 38 24 38C31.732 38 38 31.732 38 24H24Z" fill="currentColor"/>
            <path d="M28 20V10C33.5228 10 38 14.4772 38 20H28Z" fill="currentColor" fillOpacity="0.5"/>
          </svg>
        </div>
        <Link to="/dashboard" className="text-primary dark:text-background-light text-xl font-black leading-tight tracking-[-0.015em]">
          Saldo
        </Link>
      </div>
      <div className="flex flex-1 justify-end items-center gap-4 md:gap-8">
        <nav className="hidden md:flex items-center gap-9">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium leading-normal transition-colors ${
                isActive(link.to)
                  ? 'text-primary dark:text-background-light'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-primary dark:hover:text-background-light'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/notifications"
            className={`relative text-sm font-medium leading-normal transition-colors ${
              isActive('/notifications')
                ? 'text-primary dark:text-background-light'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-primary dark:hover:text-background-light'
            }`}
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
          </Link>
        </nav>
        <Link
          to="/settings"
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20 hover:opacity-80 transition-opacity cursor-pointer bg-white"
          style={{
            backgroundImage: `url("${avatarUrl}")`,
          }}
        ></Link>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-neutral-900 border-b border-primary/10 dark:border-background-light/10 shadow-lg md:hidden flex flex-col p-4 gap-4 animate-fade-in">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMenuOpen(false)}
              className={`text-base font-medium py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0 ${
                isActive(link.to)
                  ? 'text-primary dark:text-background-light'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/notifications"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2 text-base font-medium py-2 text-neutral-600 dark:text-neutral-400"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            Notificações
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;