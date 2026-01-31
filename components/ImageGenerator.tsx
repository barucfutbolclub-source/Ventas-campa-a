
import React, { useState, useRef, useEffect } from 'react';
import { generateFivePacks } from '../services/geminiService';
import { MarketingPack, MarketingGeneration } from '../types';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [packs, setPacks] = useState<MarketingPack[]>([]);
  const [history, setHistory] = useState<MarketingGeneration[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<{ data: string, mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setUploadedImage({ data: base64String, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt && !uploadedImage) return;

    setLoading(true);
    setProgress(0);
    setError(null);
    setPacks([]);
    
    try {
      const results = await generateFivePacks(
        prompt || "Producto Premium", 
        (idx) => setProgress(idx), 
        uploadedImage || undefined
      );
      
      setPacks(results);
      
      const newGen: MarketingGeneration = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        prompt: prompt || "Generación Visual",
        packs: results
      };
      
      setHistory(prev => [newGen, ...prev].slice(0, 10));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (gen: MarketingGeneration) => {
    setPacks(gen.packs);
    setPrompt(gen.prompt);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("¡Texto copiado!");
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      
      {/* Sidebar Historial */}
      <div className="lg:w-1/4 space-y-4 order-2 lg:order-1">
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left"></i> Historial
          </h3>
          
          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="text-xs text-slate-600 italic py-4 text-center">Sin registros aún</p>
            ) : (
              history.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="w-full p-4 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 text-left transition-all group"
                >
                  <p className="text-[10px] text-slate-500 mb-1">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                  <p className="text-sm font-bold text-slate-300 truncate group-hover:text-white">
                    {item.prompt}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="lg:w-3/4 space-y-8 order-1 lg:order-2">
        <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-square rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden ${uploadedImage ? 'border-blue-500/50' : 'border-slate-700 hover:border-slate-500 bg-slate-800/20'}`}
                >
                  {uploadedImage ? (
                    <img src={`data:${uploadedImage.mimeType};base64,${uploadedImage.data}`} className="w-full h-full object-cover" alt="Ref" />
                  ) : (
                    <div className="text-center p-4">
                      <i className="fa-solid fa-image text-2xl text-slate-600 mb-2"></i>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Referencia de Estilo</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>

              <div className="md:w-2/3 flex flex-col">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Producto / Concepto</label>
                <textarea 
                  className="flex-grow p-6 rounded-2xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-600 outline-none resize-none min-h-[140px]"
                  placeholder="Describe qué quieres promocionar..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || (!prompt && !uploadedImage)}
              className={`w-full py-5 rounded-2xl font-black text-white transition-all shadow-xl ${loading ? 'bg-slate-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
            >
              {loading ? `GENERANDO VARIANTE ${progress} / 5...` : 'GENERAR ESTRATEGIA VISUAL'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-rose-950/20 border border-rose-900/40 p-6 rounded-2xl text-center">
            <p className="text-rose-400 font-bold">{error}</p>
          </div>
        )}

        {/* Galería de Resultados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {packs.map((pack, idx) => (
            <div key={idx} className="bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl animate-in zoom-in duration-500">
              <div className="aspect-square">
                <img src={pack.imageUrl} className="w-full h-full object-cover" alt="Ad" />
              </div>
              <div className="p-8 space-y-6">
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 text-sm text-slate-400 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {pack.postText}
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => copyToClipboard(pack.postText)}
                    className="flex-1 py-3 bg-slate-800 rounded-xl text-[10px] font-black hover:bg-slate-700 transition-colors uppercase"
                  >
                    Copiar Texto
                  </button>
                  <a 
                    href={pack.imageUrl} 
                    download={`ad-premium-${idx}.png`}
                    className="flex-1 py-3 bg-blue-600 rounded-xl text-[10px] font-black text-center hover:bg-blue-500 transition-colors uppercase text-white"
                  >
                    Guardar Imagen
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
