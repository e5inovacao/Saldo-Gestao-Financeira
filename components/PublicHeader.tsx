import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const PublicHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMenuOpen(false); // Close menu on click
    if (location.pathname !== '/') {
      navigate('/');
      // Allow time for navigation before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-700 px-4 md:px-10 py-3 bg-background-light dark:bg-background-dark z-50">
      <div className="flex items-center gap-4 text-gray-900 dark:text-gray-100">
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex items-center justify-center p-1 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl text-primary-landing">
            {isMenuOpen ? 'close' : 'menu'}
          </span>
        </button>

        <Link to="/" className="flex items-center gap-3">
            <div className="size-8 text-primary-landing">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="48" height="48" rx="12" fill="currentColor" fillOpacity="0.1"/>
                    <path d="M24 24V10C16.268 10 10 16.268 10 24C10 31.732 16.268 38 24 38C31.732 38 38 31.732 38 24H24Z" fill="currentColor"/>
                    <path d="M28 20V10C33.5228 10 38 14.4772 38 20H28Z" fill="currentColor" fillOpacity="0.5"/>
                </svg>
            </div>
            <h2 className="text-gray-900 dark:text-gray-100 text-xl font-black leading-tight tracking-[-0.015em]">
            Saldo
            </h2>
        </Link>
      </div>
      <div className="hidden md:flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-9">
          <Link 
            to="/how-it-works" 
            className={`text-sm font-medium leading-normal hover:text-primary-landing transition-colors ${location.pathname === '/how-it-works' ? 'text-primary-landing' : 'text-gray-900 dark:text-gray-100'}`}
          >
            Como Funciona
          </Link>
          <a 
            className="text-gray-900 dark:text-gray-100 text-sm font-medium leading-normal hover:text-primary-landing transition-colors cursor-pointer" 
            onClick={(e) => handleSectionClick(e, 'planos')}
          >
            Planos
          </a>
          <a 
            className="text-gray-900 dark:text-gray-100 text-sm font-medium leading-normal hover:text-primary-landing transition-colors cursor-pointer" 
            onClick={(e) => handleSectionClick(e, 'faq')}
          >
            FAQ
          </a>
        </div>
        <Link
          to="/signup"
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary-landing text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-green-600 transition-colors"
        >
          <span className="truncate">Comece o Teste Grátis</span>
        </Link>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-gray-700 shadow-lg md:hidden flex flex-col p-4 gap-4 animate-fade-in">
          <Link 
            to="/how-it-works" 
            onClick={() => setIsMenuOpen(false)}
            className={`text-base font-medium py-2 border-b border-gray-100 dark:border-neutral-800 ${location.pathname === '/how-it-works' ? 'text-primary-landing' : 'text-gray-900 dark:text-gray-100'}`}
          >
            Como Funciona
          </Link>
          <a 
            className="text-gray-900 dark:text-gray-100 text-base font-medium py-2 border-b border-gray-100 dark:border-neutral-800 cursor-pointer" 
            onClick={(e) => handleSectionClick(e, 'planos')}
          >
            Planos
          </a>
          <a 
            className="text-gray-900 dark:text-gray-100 text-base font-medium py-2 border-b border-gray-100 dark:border-neutral-800 cursor-pointer" 
            onClick={(e) => handleSectionClick(e, 'faq')}
          >
            FAQ
          </a>
          <Link
            to="/signup"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-center w-full rounded-lg h-12 bg-primary-landing text-white text-base font-bold hover:bg-green-600 transition-colors mt-2"
          >
            Comece o Teste Grátis
          </Link>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;