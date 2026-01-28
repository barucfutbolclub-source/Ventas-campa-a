
import React, { useState } from 'react';
import { generateFivePacks } from '../services/geminiService';
import { MarketingPack } from '../types';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [packs, setPacks] = useState<MarketingPack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [selectedPackText, setSelectedPackText] = useState<string | null>(null);

  const messages = [
    "Diseñando composiciones visuales...",
    "Redactando copies persuasivos...",
    "Generando 5 variantes estratégicas...",
    "Optimizando para redes sociales...",
    "Finalizando tus packs de marketing..."
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setLoading(true);
    setError(null);
    setPacks([]);
    setSelectedPackText(null);
    
    let msgIndex = 0;
    const interval = setInterval(() => {
      setLoadingMessage(messages[msgIndex % messages.length]);
      msgIndex++;
    }, 2500);

    try {
      const results = await generateFivePacks(prompt);
      setPacks(results);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al generar los packs.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copy del post copiado al portapapeles!");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-800 mb-12">
        <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text"
            className="flex-grow px-6 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder:text-slate-500"
            placeholder="Ej. 'Suscripción de café artesanal para oficinas'..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading || !prompt}
            className={`px-10 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${loading ? 'bg-slate-700 opacity-80 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-circle-notch animate-spin"></i> Creando Estrategias...
              </span>
            ) : "Generar 5 Packs de Venta"}
          </button>
        </form>
      </div>

      {loading && (
        <div className="mb-12">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white animate-pulse tracking-tight">{loadingMessage}</h3>
            <p className="text-slate-500 mt-2">Estamos creando 5 combinaciones perfectas de imagen y texto.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-slate-900 rounded-3xl border border-slate-800 p-4 space-y-4 shadow-xl">
                <div className="aspect-square bg-slate-800 rounded-2xl animate-pulse flex items-center justify-center">
                  <i className="fa-solid fa-image text-4xl text-slate-700"></i>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-800 rounded animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-slate-800 rounded animate-pulse"></div>
                  <div className="h-4 w-4/6 bg-slate-800 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-950/20 text-red-400 p-6 rounded-2xl border border-red-900/50 text-center mb-8 animate-in zoom-in duration-300">
          <i className="fa-solid fa-triangle-exclamation text-2xl mb-2"></i>
          <p>{error}</p>
        </div>
      )}

      {packs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-1000">
          {packs.map((pack, idx) => (
            <div key={idx} className="flex flex-col bg-slate-900 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 border border-slate-800 hover:border-blue-500/50">
              <div className="relative aspect-square overflow-hidden group">
                <img 
                  src={pack.imageUrl} 
                  alt={`Marketing pack ${idx + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-lg">
                  Pack #{idx + 1}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Copy del Post</span>
                </div>
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 mb-6 flex-grow max-h-48 overflow-y-auto font-light leading-relaxed scrollbar-hide">
                  {pack.postText}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => copyToClipboard(pack.postText)}
                    className="flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors active:scale-95"
                  >
                    <i className="fa-solid fa-copy"></i> Copy Post
                  </button>
                  <a 
                    href={pack.imageUrl} 
                    download={`pack-marketing-${idx+1}.png`}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-500 transition-colors active:scale-95"
                  >
                    <i className="fa-solid fa-download"></i> Imagen
                  </a>
                </div>
              </div>
            </div>
          ))}
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 flex flex-col justify-center items-center text-center text-white shadow-2xl group cursor-pointer" onClick={() => { setPacks([]); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <i className="fa-solid fa-wand-magic-sparkles text-4xl mb-4 group-hover:rotate-12 transition-transform"></i>
            <h4 className="text-xl font-bold mb-2">¿Nueva Estrategia?</h4>
            <p className="text-blue-100 text-sm mb-6">Refina tu descripción para obtener 5 nuevos packs de contenido.</p>
            <div className="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold group-hover:scale-105 transition-transform">
              Reiniciar Generador
            </div>
          </div>
        </div>
      )}

      {selectedPackText && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
           {/* Simple Modal logic could go here if needed, but the current grid layout is very effective */}
        </div>
      )}

      {!loading && packs.length === 0 && !error && (
        <div className="text-center py-24 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600 text-3xl shadow-2xl">
            <i className="fa-solid fa-rocket"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-300 mb-2">Prepárate para el Despegue</h3>
          <p className="text-slate-500">Genera 5 variantes de contenido listas para publicar en tus redes.</p>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
