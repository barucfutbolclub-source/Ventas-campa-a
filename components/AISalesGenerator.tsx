
import React, { useState, useEffect } from 'react';
import { generateSalesScript } from '../services/geminiService';
import { SalesScriptRequest, GeneratedScript, SalesHistoryItem } from '../types';

const AISalesGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedScript | null>(null);
  const [history, setHistory] = useState<SalesHistoryItem[]>([]);
  
  const [formData, setFormData] = useState<SalesScriptRequest>({
    productName: '',
    targetAudience: '',
    keyBenefits: [''],
    tone: 'professional'
  });

  const handleAddBenefit = () => {
    setFormData(prev => ({ ...prev, keyBenefits: [...prev.keyBenefits, ''] }));
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...formData.keyBenefits];
    newBenefits[index] = value;
    setFormData(prev => ({ ...prev, keyBenefits: newBenefits }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setResult(null); 
    
    try {
      const data = await generateSalesScript(formData);
      setResult(data);
      
      // Persistir en el historial
      const newItem: SalesHistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        request: { ...formData },
        result: data
      };
      setHistory(prev => [newItem, ...prev].slice(0, 10));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item: SalesHistoryItem) => {
    setFormData(item.request);
    setResult(item.result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyToClipboard = (script: GeneratedScript) => {
    const text = `TITULAR: ${script.headline}\n\nCUERPO:\n${script.body}\n\nCTA: ${script.cta}`;
    navigator.clipboard.writeText(text);
    alert('¡Estrategia de ventas copiada!');
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      
      {/* Sidebar Historial */}
      <div className="lg:w-1/4 space-y-4 order-2 lg:order-1">
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm sticky top-24">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fa-solid fa-history text-blue-500"></i> Últimos Guiones
          </h3>
          
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {history.length === 0 ? (
              <div className="text-center py-8 opacity-20">
                <i className="fa-solid fa-folder-open text-4xl mb-2"></i>
                <p className="text-[10px] font-bold uppercase">Vacío</p>
              </div>
            ) : (
              history.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="w-full p-4 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 text-left transition-all group relative overflow-hidden"
                >
                  <p className="text-[10px] text-blue-500 font-bold mb-1">
                    {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <p className="text-sm font-bold text-slate-300 truncate group-hover:text-white">
                    {item.request.productName}
                  </p>
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fa-solid fa-chevron-right text-[10px] text-blue-500"></i>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Generator Section */}
      <div className="lg:w-3/4 space-y-8 order-1 lg:order-2">
        <div className="grid md:grid-cols-1 gap-8">
          
          {/* Input Panel */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-800 relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl"></div>
             
             <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Producto o Servicio</label>
                      <input 
                        type="text"
                        required
                        className="w-full px-6 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-600"
                        placeholder="Ej: Curso de Trading Pro"
                        value={formData.productName}
                        onChange={e => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Público Objetivo</label>
                      <input 
                        type="text"
                        required
                        className="w-full px-6 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-600"
                        placeholder="Ej: Emprendedores digitales"
                        value={formData.targetAudience}
                        onChange={e => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      />
                   </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Beneficios Clave</label>
                  <div className="grid gap-3">
                    {formData.keyBenefits.map((benefit, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          type="text"
                          required
                          className="flex-grow px-6 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:ring-1 focus:ring-blue-600 outline-none text-sm"
                          placeholder={`Beneficio #${idx + 1}`}
                          value={benefit}
                          onChange={e => handleBenefitChange(idx, e.target.value)}
                        />
                        {idx > 0 && (
                          <button 
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, keyBenefits: p.keyBenefits.filter((_, i) => i !== idx)}))}
                            className="p-3 text-slate-600 hover:text-rose-500 transition-colors"
                          >
                            <i className="fa-solid fa-times"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddBenefit}
                    className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-2"
                  >
                    <i className="fa-solid fa-plus-circle"></i> Añadir Beneficio
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-end">
                  <div className="flex-grow space-y-2 w-full">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tono de Comunicación</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['professional', 'aggressive', 'empathetic', 'humorous'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, tone: t as any }))}
                          className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${formData.tone === t ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-800/30 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                        >
                          {t === 'aggressive' ? 'Directo' : t === 'humorous' ? 'Relajado' : t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading || !formData.productName}
                    className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black text-white transition-all shadow-xl flex items-center justify-center gap-3 ${loading ? 'bg-slate-800 cursor-not-allowed text-slate-500' : 'bg-blue-600 hover:bg-blue-500 active:scale-95'}`}
                  >
                    {loading ? (
                      <><i className="fa-solid fa-dna animate-spin"></i> PROCESANDO...</>
                    ) : (
                      <><i className="fa-solid fa-magic"></i> GENERAR ESTRATEGIA</>
                    )}
                  </button>
                </div>
             </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center gap-4 text-rose-500 animate-in zoom-in duration-300">
              <i className="fa-solid fa-triangle-exclamation text-xl"></i>
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Results Display */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="bg-slate-900/30 border border-slate-800 p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center animate-pulse">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-6">
                  <i className="fa-solid fa-brain text-blue-500 text-2xl animate-bounce"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Construyendo tu propuesta...</h3>
                <p className="text-slate-500 max-w-xs text-sm">Estamos aplicando gatillos mentales y técnicas de persuasión avanzadas.</p>
              </div>
            ) : result ? (
              <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-8 flex justify-between items-center">
                   <div>
                      <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Estrategia de Conversión</span>
                      <h2 className="text-2xl font-black text-white mt-1 leading-tight">{result.headline}</h2>
                   </div>
                   <button 
                    onClick={() => copyToClipboard(result)}
                    className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all group"
                   >
                     <i className="fa-solid fa-copy text-white group-active:scale-90"></i>
                   </button>
                </div>
                <div className="p-10 space-y-8">
                  <div className="relative">
                    <i className="fa-solid fa-quote-left absolute -top-4 -left-4 text-4xl text-blue-500/10"></i>
                    <p className="text-lg text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                      {result.body}
                    </p>
                  </div>
                  
                  <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Llamada a la Acción (CTA) Sugerida</span>
                       <p className="text-xl font-black text-blue-500">{result.cta}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(result)}
                      className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                      Copiar Todo el Script
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 opacity-40">
                <i className="fa-solid fa-pen-fancy text-6xl mb-6"></i>
                <p className="text-xl font-bold">Tu próximo guión ganador empieza aquí</p>
                <p className="text-sm mt-2 max-w-xs">Define tu oferta y deja que el motor AIDA/PAS de Gemini haga la magia.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISalesGenerator;
