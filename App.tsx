
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import AISalesGenerator from './components/AISalesGenerator';
import SalesAnalytics from './components/SalesAnalytics';
import ImageGenerator from './components/ImageGenerator';
import Contact from './components/Contact';
import Footer from './components/Footer';

// Define AIStudio interface to match existing global expectations and avoid type conflicts
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Fix: Make aistudio optional to match existing environment declarations and avoid modifier conflicts
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'generator' | 'analytics' | 'images'>('home');

  const handleNavigate = useCallback(async (tab: 'home' | 'generator' | 'analytics' | 'images') => {
    // Ensure AI services are properly initialized with an API key if necessary
    if (tab === 'generator' || tab === 'images') {
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          if (!hasKey) {
            await window.aistudio.openSelectKey();
            // Guidelines: assume the key selection was successful after triggering openSelectKey() and proceed
          }
        } catch (e) {
          console.error("Error al verificar/abrir selector de clave:", e);
        }
      }
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 selection:bg-blue-500/30">
      <Header onNavigate={handleNavigate} activeTab={activeTab} />
      
      <main className="flex-grow pt-16">
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-700">
            <Hero onStart={() => handleNavigate('generator')} />
            <Services />
            <Contact />
          </div>
        )}
        
        {activeTab === 'generator' && (
          <div className="container mx-auto px-4 py-12 animate-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-8 text-center tracking-tight">
              Generador de <span className="text-blue-500">Copy de Ventas</span> AI
            </h1>
            <AISalesGenerator />
          </div>
        )}

        {activeTab === 'images' && (
          <div className="container mx-auto px-4 py-12 animate-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-2 text-center tracking-tight">
              Creativos de <span className="text-blue-500">Marketing</span> AI
            </h1>
            <p className="text-slate-400 text-center mb-12 text-lg">Genera 5 imágenes impactantes para tus campañas en segundos.</p>
            <ImageGenerator />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="container mx-auto px-4 py-12 animate-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-8 text-center tracking-tight">
              Panel de <span className="text-blue-500">Rendimiento</span>
            </h1>
            <SalesAnalytics />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
