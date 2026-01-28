
import React, { useState } from 'react';
import { handleObjection, generateVideoScript } from '../services/geminiService';
import { ObjectionResponse, VideoScript } from '../types';

const StrategySuite: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'objection' | 'video'>('objection');
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ObjectionResponse | VideoScript | null>(null);

  const handleProcess = async () => {
    if (!input) return;
    setLoading(true);
    setResult(null);
    try {
      if (activeMode === 'objection') {
        const res = await handleObjection(input, context || "Producto General");
        setResult(res);
      } else {
        const res = await generateVideoScript(input, context || "Ventas Directas");
        setResult(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Selector */}
      <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button 
          onClick={() => { setActiveMode('objection'); setResult(null); }}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeMode === 'objection' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <i className="fa-solid fa-shield-halved mr-2"></i> Manejo de Objeciones
        </button>
        <button 
          onClick={() => { setActiveMode('video'); setResult(null); }}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeMode === 'video' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <i className="fa-solid fa-video mr-2"></i> Guion de Video Viral
        </button>
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-widest">
              {activeMode === 'objection' ? '¿Qué te dijo el cliente?' : '¿Cuál es el producto o idea?'}
            </label>
            <input 
              type="text"
              className="w-full px-5 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={activeMode === 'objection' ? "Ej: Está muy caro, no tengo presupuesto..." : "Ej: Curso de trading, Nueva línea de zapatos..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-widest">
              {activeMode === 'objection' ? 'Producto / Contexto' : 'Objetivo del Video'}
            </label>
            <input 
              type="text"
              className="w-full px-5 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={activeMode === 'objection' ? "Ej: Software de Gestión" : "Ej: Captar leads, Venta flash, Brand awareness"}
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          <button 
            onClick={handleProcess}
            disabled={loading || !input}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-xl active:scale-95"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : `GENERAR ESTRATEGIA DE ${activeMode === 'objection' ? 'CIERRE' : 'CONTENIDO'}`}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {'rebuttal' in result ? (
            <div className="space-y-6">
              <div className="bg-blue-600/10 border border-blue-500/30 p-8 rounded-3xl">
                <h4 className="text-blue-400 font-bold mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-comment-dots"></i> RESPUESTA SUGERIDA:
                </h4>
                <p className="text-xl text-white italic leading-relaxed">"{result.rebuttal}"</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h5 className="text-sm font-bold text-slate-500 mb-2">PSICOLOGÍA APLICADA</h5>
                  <p className="text-slate-300 text-sm leading-relaxed">{result.psychology}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h5 className="text-sm font-bold text-slate-500 mb-2">TIP DE CIERRE</h5>
                  <p className="text-slate-300 text-sm leading-relaxed">{result.closingTip}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-blue-600 p-6">
                <h4 className="text-white font-black text-xl flex items-center gap-3">
                  <i className="fa-solid fa-magnet"></i> EL GANCHO (HOOK):
                  <span className="bg-black/20 px-3 py-1 rounded-full text-xs ml-auto">0:00 - 0:03</span>
                </h4>
                <p className="text-white text-lg font-bold mt-2">{result.hook}</p>
              </div>
              <div className="p-8 space-y-6">
                {result.scenes.map((scene, i) => (
                  <div key={i} className="flex gap-6 border-l-2 border-slate-800 pl-6 relative">
                    <div className="absolute -left-2.5 top-0 w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400 border-2 border-slate-900">
                      {i + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Visual</span>
                        <span className="text-[10px] text-slate-500">{scene.duration}</span>
                      </div>
                      <p className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-800">{scene.visual}</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Audio / Voz</span>
                      <p className="text-sm text-slate-300 bg-emerald-900/10 p-3 rounded-lg border border-emerald-900/20">{scene.audio}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-6 border-t border-slate-800">
                  <div className="bg-blue-600/20 p-4 rounded-xl border border-blue-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Llamada a la Acción (CTA)</span>
                      <p className="text-white font-bold">{result.cta}</p>
                    </div>
                    <i className="fa-solid fa-bullhorn text-blue-400 text-2xl"></i>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <i className="fa-solid fa-brain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse"></i>
          </div>
          <p className="text-slate-500 mt-4 font-medium">La IA está procesando la mejor respuesta estratégica...</p>
        </div>
      )}
    </div>
  );
};

export default StrategySuite;
