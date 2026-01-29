
import React from 'react';

interface HeaderProps {
  onNavigate: (tab: 'home' | 'generator' | 'analytics' | 'images' | 'strategy' | 'video') => void;
  activeTab: string;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, activeTab }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-morphism shadow-2xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="text-xl font-bold text-white tracking-tight">SalesMaster<span className="text-blue-500">AI</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-4 lg:gap-8">
          <button 
            onClick={() => onNavigate('home')}
            className={`text-sm lg:text-base font-medium transition-colors ${activeTab === 'home' ? 'text-blue-500' : 'text-slate-300 hover:text-blue-400'}`}
          >
            Inicio
          </button>
          <button 
            onClick={() => onNavigate('generator')}
            className={`text-sm lg:text-base font-medium transition-colors ${activeTab === 'generator' ? 'text-blue-500' : 'text-slate-300 hover:text-blue-400'}`}
          >
            Copy AI
          </button>
          <button 
            onClick={() => onNavigate('images')}
            className={`text-sm lg:text-base font-medium transition-colors ${activeTab === 'images' ? 'text-blue-500' : 'text-slate-300 hover:text-blue-400'}`}
          >
            Imágenes
          </button>
          <button 
            onClick={() => onNavigate('video')}
            className={`text-sm lg:text-base font-medium transition-colors ${activeTab === 'video' ? 'text-blue-500' : 'text-slate-300 hover:text-blue-400'}`}
          >
            Videos
          </button>
          <button 
            onClick={() => onNavigate('strategy')}
            className={`text-sm lg:text-base font-medium transition-colors ${activeTab === 'strategy' ? 'text-blue-500' : 'text-slate-300 hover:text-blue-400'}`}
          >
            Estrategia
          </button>
          <button 
            onClick={() => onNavigate('analytics')}
            className={`text-sm lg:text-base font-medium transition-colors ${activeTab === 'analytics' ? 'text-blue-500' : 'text-slate-300 hover:text-blue-400'}`}
          >
            Métricas
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('generator')}
            className="bg-blue-600 text-white px-4 lg:px-5 py-2 rounded-full text-sm lg:text-base font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40 active:scale-95 whitespace-nowrap"
          >
            Comenzar
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
