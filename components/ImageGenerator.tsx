
import React, { useState, useRef } from 'react';
import { generateFivePacks } from '../services/geminiService';
import { MarketingPack } from '../types';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [packs, setPacks] = useState<MarketingPack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [uploadedImage, setUploadedImage] = useState<{ data: string, mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = [
    "Corrigiendo ortografía y optimizando tu propuesta de valor...",
    "Analizando tu imagen de referencia para mantener la estética...",
    "Redactando 5 variaciones de copy persuasivo...",
    "Renderizando creativos publicitarios de alta gama...",
    "Asegurando que cada pack esté listo para convertir..."
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setUploadedImage({
          data: base64String,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt && !uploadedImage) return;

    setLoading(true);
    setError(null);
    setPacks([]);
    
    let msgIndex = 0;
    const interval = setInterval(() => {
      setLoadingMessage(messages[msgIndex % messages.length]);
      msgIndex++;
    }, 4500);

    try {
      const results = await generateFivePacks(prompt || "Innovación en Ventas Digitales", uploadedImage || undefined);
      if (results.length === 0) {
        throw new Error("No se pudieron generar packs. Verifica tu conexión o cuota de API.");
      }
      setPacks(results);
    } catch (err: any) {
      let errorMessage = "Error inesperado al generar los creativos.";
      if (err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("429")) {
        errorMessage = "Cuota de API agotada (429). Por favor, intenta de nuevo en unos minutos o usa una clave con más crédito.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("¡Copy de ventas copiado!");
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Input Module */}
      <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 mb-12 relative overflow-hidden">
        {/* Subtle correction indicator */}
        <div className="absolute top-0 right-0 p-4">
           <span className="flex items-center gap-2 text-[10px] font-black text-blue-400 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 tracking-tighter shadow-xl">
             <i className="fa-solid fa-sparkles animate-pulse"></i>
             OPTIMIZACIÓN ORTOGRÁFICA AI
           </span>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Image Reference Section */}
            <div className="lg:w-1/3">
              <label className="block text-sm font-bold text-slate-500 mb-4 uppercase tracking-[0.2em]">Referencia Visual</label>
              {uploadedImage ? (
                <div className="relative group aspect-square rounded-3xl overflow-hidden border-2 border-blue-600/30 shadow-2xl">
                  <img 
                    src={`data:${uploadedImage.mimeType};base64,${uploadedImage.data}`} 
                    className="w-full h-full object-cover" 
                    alt="Referencia de usuario" 
                  />
                  <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-xs text-slate-300 mb-4 font-medium italic">Esta imagen guiará la composición de tus nuevos creativos.</p>
                    <button 
                      type="button"
                      onClick={removeUploadedImage}
                      className="bg-rose-600 text-white px-6 py-2 rounded-full font-bold hover:bg-rose-700 transition-colors shadow-lg"
                    >
                      <i className="fa-solid fa-trash-can mr-2"></i> Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-3xl border-2 border-dashed border-slate-700 bg-slate-800/20 hover:border-blue-500/50 hover:bg-slate-800/40 transition-all cursor-pointer flex flex-col items-center justify-center text-slate-500 group relative overflow-hidden"
                >
                  <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600/10 transition-all duration-500">
                    <i className="fa-solid fa-image-portrait text-3xl group-hover:text-blue-400"></i>
                  </div>
                  <span className="text-sm font-bold text-slate-400 tracking-tight">Sube una Imagen</span>
                  <span className="text-[10px] font-medium opacity-40 mt-1 uppercase tracking-widest">Guía para el estilo IA</span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </div>
              )}
            </div>

            {/* Prompt Section */}
            <div className="lg:w-2/3 flex flex-col justify-center">
              <label className="block text-sm font-bold text-slate-500 mb-4 uppercase tracking-[0.2em]">¿Qué producto vamos a vender?</label>
              <textarea 
                className="w-full flex-grow px-7 py-6 rounded-3xl bg-slate-800/50 border border-slate-700 text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-lg placeholder:text-slate-600 resize-none min-h-[220px] transition-all"
                placeholder="Ej: Zapatillas de running ultra ligeras para maratonistas. No importa si tienes errores ortográficos, la IA los corregirá antes de generar tus posts."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button 
                type="submit"
                disabled={loading || (!prompt && !uploadedImage)}
                className={`mt-8 w-full py-6 rounded-3xl font-black text-white shadow-2xl transition-all text-xl tracking-tight ${loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 active:scale-[0.97] hover:shadow-blue-900/40'}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-4">
                    <i className="fa-solid fa-spinner animate-spin"></i> {loadingMessage}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <i className="fa-solid fa-bolt-lightning"></i> Generar Campaña de Ventas
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Loading Skeleton Grid */}
      {loading && (
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-5 space-y-6">
                <div className="aspect-square bg-slate-800 rounded-3xl animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-slate-800 rounded-full animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-slate-800 rounded-full animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-slate-800 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/20 text-rose-400 p-8 rounded-3xl border border-rose-900/40 text-center mb-10 shadow-2xl animate-in zoom-in duration-300">
          <i className="fa-solid fa-circle-exclamation text-3xl mb-4"></i>
          <p className="font-bold text-lg">{error}</p>
          <p className="text-xs text-rose-500 mt-2 font-medium italic">Sugerencia: Intenta usar una clave de API con facturación habilitada en Google AI Studio.</p>
        </div>
      )}

      {/* Results Display */}
      {packs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {packs.map((pack, idx) => (
            <div key={idx} className="flex flex-col bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-800 hover:border-blue-500/30 transition-all duration-500 group hover:-translate-y-2">
              {/* Creative Thumbnail */}
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={pack.imageUrl} 
                  alt={`Opción estratégica ${idx + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] ease-out"
                />
                <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-2xl border border-white/10">
                  ESTRATEGIA #{idx + 1}
                </div>
              </div>
              
              {/* Copy Area */}
              <div className="p-8 flex flex-col flex-grow bg-slate-900 relative">
                <div className="mb-4 flex items-center justify-between">
                   <h5 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Copy de Alta Conversión</h5>
                   <i className="fa-solid fa-quote-right text-slate-800 text-2xl"></i>
                </div>
                
                <div className="bg-slate-950/60 rounded-2xl p-6 text-[13px] text-slate-300 mb-8 flex-grow max-h-56 overflow-y-auto leading-relaxed border border-slate-800 font-medium scrollbar-hide">
                  {pack.postText}
                </div>
                
                <div className="space-y-4 mt-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => copyToClipboard(pack.postText)}
                      className="flex items-center justify-center gap-3 bg-slate-800 text-white py-4 rounded-2xl font-black text-xs hover:bg-slate-700 transition-all active:scale-95 border border-slate-700 hover:border-slate-600"
                    >
                      <i className="fa-solid fa-copy"></i> COPIAR TEXTO
                    </button>
                    <a 
                      href={pack.imageUrl} 
                      download={`salesmaster-pack-${idx+1}.png`}
                      className="flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                    >
                      <i className="fa-solid fa-download"></i> IMAGEN
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Reset Action Card */}
          <div className="bg-slate-800/10 rounded-[2.5rem] p-10 border-4 border-dashed border-slate-800/50 flex flex-col justify-center items-center text-center text-slate-600 hover:border-blue-500/30 hover:bg-blue-600/[0.02] transition-all cursor-pointer group" onClick={() => { setPacks([]); removeUploadedImage(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="w-20 h-20 rounded-full border-2 border-slate-800 flex items-center justify-center mb-6 group-hover:rotate-[-180deg] group-hover:border-blue-500/30 transition-all duration-700">
               <i className="fa-solid fa-rotate text-3xl group-hover:text-blue-500"></i>
            </div>
            <h4 className="text-2xl font-black mb-3 text-slate-300 tracking-tight">¿Otra Estrategia?</h4>
            <p className="text-sm font-medium text-slate-500 max-w-[200px]">Haz clic para limpiar y crear una nueva campaña publicitaria.</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && packs.length === 0 && !error && (
        <div className="text-center py-28 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800/40">
          <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-700 text-4xl shadow-inner border border-slate-800 rotate-3 hover:rotate-0 transition-transform duration-500">
            <i className="fa-solid fa-wand-magic-sparkles text-blue-600/50"></i>
          </div>
          <h3 className="text-2xl font-black text-slate-200 mb-3 tracking-tight">Tu Especialista en Ventas AI</h3>
          <p className="text-slate-500 max-w-md mx-auto text-lg font-medium leading-relaxed">
            Sube una imagen de referencia (opcional) y cuéntanos qué vendes. Generaremos 5 propuestas visuales y de texto listas para pautar.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
