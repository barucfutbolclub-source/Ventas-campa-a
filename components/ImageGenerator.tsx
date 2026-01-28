
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
    "Corrigiendo ortografía y estilo...",
    "Analizando tu imagen de referencia...",
    "Redactando textos persuasivos...",
    "Generando 5 variantes creativas...",
    "Optimizando para redes sociales...",
    "Finalizando tus packs de marketing..."
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
    }, 2500);

    try {
      const results = await generateFivePacks(prompt || "Evolución creativa profesional", uploadedImage || undefined);
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
    alert("¡Texto de la publicación copiado al portapapeles!");
  };

  const handleShare = (pack: MarketingPack) => {
    const fullContent = `${pack.postText}\n\nEnlace de la imagen:\n${pack.imageUrl}`;
    navigator.clipboard.writeText(fullContent);
    alert("¡Publicación y enlace de imagen copiados con éxito para compartir!");
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 mb-12 relative overflow-hidden">
        {/* Corrección Automática Badge */}
        <div className="absolute top-4 right-8 flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <i className="fa-solid fa-wand-magic-sparkles"></i>
          AUTO-CORRECCIÓN INTELIGENTE ACTIVADA
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Área de Carga */}
            <div className="lg:w-1/3">
              <label className="block text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Imagen de Referencia (Opcional)</label>
              {uploadedImage ? (
                <div className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-blue-500/50">
                  <img 
                    src={`data:${uploadedImage.mimeType};base64,${uploadedImage.data}`} 
                    className="w-full h-full object-cover" 
                    alt="Referencia" 
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={removeUploadedImage}
                      className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/50 hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-pointer flex flex-col items-center justify-center text-slate-500 group"
                >
                  <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
                  </div>
                  <span className="text-sm font-medium">Subir Imagen</span>
                  <span className="text-[10px] uppercase mt-1 opacity-50">JPG, PNG (Máx 4MB)</span>
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

            {/* Área de Prompt */}
            <div className="lg:w-2/3 flex flex-col justify-center">
              <label className="block text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">¿Qué quieres crear hoy?</label>
              <textarea 
                className="w-full flex-grow px-6 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder:text-slate-600 resize-none min-h-[150px]"
                placeholder="Describe tu visión... No te preocupes por la ortografía, nosotros la corregimos."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button 
                type="submit"
                disabled={loading || (!prompt && !uploadedImage)}
                className={`mt-4 w-full py-5 rounded-2xl font-bold text-white shadow-xl transition-all text-xl ${loading ? 'bg-slate-700 opacity-80 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <i className="fa-solid fa-brain animate-pulse"></i> {loadingMessage}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-bolt"></i> Generar Packs Creativos
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading && (
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-slate-900 rounded-3xl border border-slate-800 p-4 space-y-4 shadow-xl">
                <div className="aspect-square bg-slate-800 rounded-2xl animate-pulse flex items-center justify-center">
                  <i className="fa-solid fa-palette text-4xl text-slate-700"></i>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-800 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-slate-800 rounded animate-pulse"></div>
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
            <div key={idx} className="flex flex-col bg-slate-900 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 border border-slate-800 hover:border-blue-500/50 group">
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={pack.imageUrl} 
                  alt={`Pack creativo ${idx + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-lg">
                  Variante #{idx + 1}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 mb-6 flex-grow max-h-40 overflow-y-auto font-light leading-relaxed scrollbar-hide">
                  {pack.postText}
                </div>
                
                <div className="space-y-3 mt-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => copyToClipboard(pack.postText)}
                      className="flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors"
                    >
                      <i className="fa-solid fa-copy"></i> Texto
                    </button>
                    <a 
                      href={pack.imageUrl} 
                      download={`anuncio-ia-${idx+1}.png`}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-500 transition-colors"
                    >
                      <i className="fa-solid fa-download"></i> Descargar
                    </a>
                  </div>
                  <button 
                    onClick={() => handleShare(pack)}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/30"
                  >
                    <i className="fa-solid fa-share-nodes"></i> Compartir Pack
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="bg-slate-800/30 rounded-3xl p-8 border-2 border-dashed border-slate-800 flex flex-col justify-center items-center text-center text-slate-500 group cursor-pointer hover:border-blue-500/30 hover:text-slate-300 transition-all" onClick={() => { setPacks([]); removeUploadedImage(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <i className="fa-solid fa-rotate-left text-4xl mb-4 group-hover:rotate-[-45deg] transition-transform"></i>
            <h4 className="text-xl font-bold mb-2 text-white">¿Probar otro concepto?</h4>
            <p className="text-sm mb-6">Limpia todo y sube una nueva imagen o descripción.</p>
            <div className="px-6 py-2 bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-widest group-hover:bg-slate-700">
              Reiniciar Formulario
            </div>
          </div>
        </div>
      )}

      {!loading && packs.length === 0 && !error && (
        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-800">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700 text-3xl shadow-xl">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-400 mb-2">Potencia tu Marca con IA</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Sube una imagen de referencia o describe tu producto para generar creativos de alto impacto listos para pautar. <span className="text-emerald-500 font-bold">¡Corrección inteligente incluida!</span></p>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
