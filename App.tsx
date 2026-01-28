
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import AISalesGenerator from './components/AISalesGenerator';
import SalesAnalytics from './components/SalesAnalytics';
import ImageGenerator from './components/ImageGenerator';
import StrategySuite from './components/StrategySuite';
import VideoGenerator from './components/VideoGenerator';
import Contact from './components/Contact';
import Footer from './components/Footer';

// Define AIStudio interface
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  type Tabs = 'home' | 'generator' | 'analytics' | 'images' | 'strategy' | 'video';
  const [activeTab, setActiveTab] = useState<Tabs>('home');

  const handleNavigate = useCallback(async (tab: Tabs) => {
    if (['generator', 'images', 'strategy', 'video'].includes(tab)) {
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          if (!hasKey) await window.aistudio.openSelectKey();
        } catch (e) {
          console.error("Error al verificar clave:", e);
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
            <p className="text-slate-400 text-center mb-12 text-lg">Genera 5 imágenes y sus copies estratégicos en segundos.</p>
            <ImageGenerator />
          </div>
        )}

        {activeTab === 'video' && (
          <div className="container mx-auto px-4 py-12 animate-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-2 text-center tracking-tight">
              Anuncios de <span className="text-indigo-500">Video</span> AI
            </h1>
            <p className="text-slate-400 text-center mb-12 text-lg">Crea videos publicitarios cinematográficos con Veo 3.1.</p>
            <VideoGenerator />
          </div>
        )}

        {activeTab === 'strategy' && (
          <div className="container mx-auto px-4 py-12 animate-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-2 text-center tracking-tight">
              Suite de <span className="text-blue-500">Estrategia</span> AI
            </h1>
            <p className="text-slate-400 text-center mb-12 text-lg">Maneja objeciones y crea contenido viral basado en psicología de ventas.</p>
            <StrategySuite />
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
