
import React, { useState } from 'react';
import { generateFiveImages } from '../services/geminiService';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  const messages = [
    "Diseñando composiciones visuales...",
    "Ajustando la iluminación publicitaria...",
    "Generando 5 variaciones estratégicas...",
    "Renderizando detalles de alta resolución...",
    "Finalizando tus creativos de marketing..."
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setLoading(true);
    setError(null);
    setImages([]);
    
    let msgIndex = 0;
    const interval = setInterval(() => {
      setLoadingMessage(messages[msgIndex % messages.length]);
      msgIndex++;
    }, 2500);

    try {
      const urls = await generateFiveImages(prompt);
      setImages(urls);
      if (urls.length === 0) throw new Error("No se pudieron generar las imágenes.");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al generar las imágenes.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-800 mb-12">
        <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text"
            className="flex-grow px-6 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder:text-slate-500"
            placeholder="Describe tu campaña (ej. 'Estrategias de marketing para agencias inmobiliarias')..."
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
                <i className="fa-solid fa-circle-notch animate-spin"></i> Creando...
              </span>
            ) : "Generar 5 Imágenes"}
          </button>
        </form>
      </div>

      {loading && (
        <div className="mb-12">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white animate-pulse tracking-tight">{loadingMessage}</h3>
            <p className="text-slate-500 mt-2">La IA está procesando 5 variaciones únicas para ti.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-square bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent animate-pulse"></div>
                <div className="flex flex-col items-center gap-4 text-slate-700">
                  <i className="fa-solid fa-image text-4xl animate-bounce"></i>
                  <span className="text-xs font-bold tracking-widest uppercase opacity-50">Variant {i}</span>
                </div>
              </div>
            ))}
            <div className="aspect-square bg-slate-800/20 rounded-3xl border border-dashed border-slate-800 flex items-center justify-center">
              <i className="fa-solid fa-wand-sparkles text-slate-700 text-3xl"></i>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-950/20 text-red-400 p-6 rounded-2xl border border-red-900/50 text-center mb-8 animate-in zoom-in duration-300">
          <i className="fa-solid fa-triangle-exclamation text-2xl mb-2"></i>
          <p>{error}</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-1000">
          {images.map((url, idx) => (
            <div key={idx} className="group relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 border border-slate-800 hover:border-blue-500/50">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={url} 
                  alt={`Marketing ad ${idx + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <p className="text-white font-bold mb-4">Variante Publicitaria #{idx + 1}</p>
                <div className="flex gap-2">
                  <a 
                    href={url} 
                    download={`marketing-ad-${idx+1}.png`}
                    className="flex-grow bg-white text-slate-900 py-2 rounded-lg text-center font-bold text-sm hover:bg-blue-50 transition-colors"
                  >
                    Descargar
                  </a>
                  <button 
                    onClick={() => window.open(url, '_blank')}
                    className="w-10 h-10 bg-white/10 backdrop-blur-md text-white rounded-lg flex items-center justify-center hover:bg-white/20"
                  >
                    <i className="fa-solid fa-expand"></i>
                  </button>
                </div>
              </div>
              <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-lg">
                AI Generated
              </div>
            </div>
          ))}
          <div className="bg-blue-600 rounded-3xl p-8 flex flex-col justify-center items-center text-center text-white shadow-2xl group hover:-translate-y-2 transition-transform">
            <i className="fa-solid fa-wand-magic-sparkles text-4xl mb-4 group-hover:rotate-12 transition-transform"></i>
            <h4 className="text-xl font-bold mb-2">¿Necesitas más?</h4>
            <p className="text-blue-100 text-sm mb-6">Prueba una descripción diferente para obtener variaciones totalmente nuevas.</p>
            <button 
              onClick={() => {
                setImages([]);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Nuevo Intento
            </button>
          </div>
        </div>
      )}

      {!loading && images.length === 0 && !error && (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600 text-3xl shadow-2xl">
            <i className="fa-solid fa-images"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-300 mb-2">Tu galería está vacía</h3>
          <p className="text-slate-500">Ingresa una descripción arriba para generar tus primeros 5 anuncios.</p>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
