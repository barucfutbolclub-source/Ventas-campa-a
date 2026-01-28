
import React, { useState } from 'react';
import { generateMarketingVideo } from '../services/geminiService';

const VideoGenerator: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    "Inicializando motor cinematográfico Veo...",
    "Renderizando interfaz de IA en 3D...",
    "Simulando generación de copy de alta conversión...",
    "Optimizando texturas y reflejos...",
    "Finalizando composición de video..."
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName) return;

    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % steps.length);
    }, 15000);

    try {
      const url = await generateMarketingVideo(productName);
      setVideoUrl(url);
    } catch (err: any) {
      setError(err.message || "Error al generar el video publicitario.");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Generador de Video Publicitario</h2>
          <p className="text-slate-400">Crea una pieza visual que destaque cómo la IA potencia tu producto.</p>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text"
            className="flex-grow px-6 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg"
            placeholder="Nombre de tu producto o servicio..."
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading || !productName}
            className={`px-10 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
          >
            {loading ? "Generando..." : "Crear Video Publicitario"}
          </button>
        </form>
      </div>

      {loading && (
        <div className="bg-slate-900/50 p-20 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <i className="fa-solid fa-clapperboard absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 text-2xl animate-pulse"></i>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4 animate-pulse">{steps[loadingStep]}</h3>
          <p className="text-slate-500 max-w-md">Este proceso puede tomar un par de minutos. Por favor, mantén esta pestaña abierta.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-950/20 text-red-400 p-6 rounded-2xl border border-red-900/50 text-center animate-in zoom-in duration-300">
          <i className="fa-solid fa-triangle-exclamation text-2xl mb-2"></i>
          <p>{error}</p>
        </div>
      )}

      {videoUrl && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative group">
            <video 
              src={videoUrl} 
              controls 
              className="w-full aspect-video"
              autoPlay
              loop
            />
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <a 
                href={videoUrl} 
                download="marketing-ai-video.mp4"
                className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-white/20"
              >
                <i className="fa-solid fa-download"></i> Descargar MP4
              </a>
            </div>
          </div>
          <div className="mt-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Tu Video está Listo</h3>
            <p className="text-slate-400">Este video muestra la facilidad de uso y los resultados de alta conversión de tu marca.</p>
          </div>
        </div>
      )}

      {!loading && !videoUrl && !error && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <i className="fa-solid fa-wand-magic-sparkles text-indigo-500 text-2xl mb-4"></i>
            <h4 className="text-white font-bold mb-2">Magia Visual</h4>
            <p className="text-slate-500 text-sm">Convertimos tu idea en una pieza publicitaria de nivel profesional.</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <i className="fa-solid fa-bolt text-amber-500 text-2xl mb-4"></i>
            <h4 className="text-white font-bold mb-2">Alta Conversión</h4>
            <p className="text-slate-500 text-sm">Diseñado para captar la atención en los primeros 3 segundos.</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <i className="fa-solid fa-robot text-emerald-500 text-2xl mb-4"></i>
            <h4 className="text-white font-bold mb-2">Impulsado por Veo</h4>
            <p className="text-slate-500 text-sm">Utilizamos la tecnología de video generativo más avanzada de Google.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;
