
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
    alert('¡Copiado con éxito al portapapeles!');
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      
      {/* Sidebar Historial */}
      <div className="lg:w-1/4 space-y-4 order-2 lg:order-1">
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm sticky top-24">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fa-solid fa-history text-blue-500"></i> Generaciones Recientes
          </h3>
          
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {history.length === 0 ? (
              <div className="text-center py-8 opacity-20">
                <i className="fa-solid fa-folder-open text-4xl mb-2"></i>
                <p className="text-[10px] font-bold uppercase tracking-widest">Sin historial</p>
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
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Generator Section */}
      <div className="lg:w-3/4 space-y-8 order-1 lg:order-2">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-800 relative">
             <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">¿Qué deseas vender hoy?</label>
                      <input 
                        type="text"
                        required
                        className="w-full px-6 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-600"
                        placeholder="Ej: Curso de Marketing Digital"
                        value={formData.productName}
                        onChange={e => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">¿Quién es tu cliente ideal?</label>
                      <input 
                        type="text"
                        required
                        className="w-full px-6 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-600"
                        placeholder="Ej: Dueños de pequeños negocios"
                        value={formData.targetAudience}
                        onChange={e => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      />
                   </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Beneficios Diferenciales (Puntos de valor)</label>
                  <div className="grid gap-3">
                    {formData.keyBenefits.map((benefit, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          type="text"
                          required
                          className="flex-grow px-6 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:ring-1 focus:ring-blue-600 outline-none text-sm transition-all"
                          placeholder={`Punto de valor #${idx + 1}`}
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
                  <button type="button" onClick={handleAddBenefit} className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-2 transition-all">
                    <i className="fa-solid fa-plus-circle"></i> Añadir beneficio adicional
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-end">
                  <div className="flex-grow space-y-2 w-full">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tono de la Comunicación</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['professional', 'aggressive', 'empathetic', 'humorous'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, tone: t as any }))}
                          className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${formData.tone === t ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-800/30 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                        >
                          {t === 'professional' ? 'Profesional' : t === 'aggressive' ? 'Directo' : t === 'empathetic' ? 'Empático' : 'Relajado'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading || !formData.productName}
                    className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black text-white transition-all shadow-xl ${loading ? 'bg-slate-800 cursor-not-allowed text-slate-500' : 'bg-blue-600 hover:bg-blue-500 active:scale-95'}`}
                  >
                    {loading ? "ESTRUCTURANDO COPY..." : "GENERAR COPY MAESTRO"}
                  </button>
                </div>
             </form>
          </div>

          {/* Results Display */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="bg-slate-900/30 border border-slate-800 p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center animate-pulse">
                <i className="fa-solid fa-brain text-blue-500 text-4xl mb-6 animate-bounce"></i>
                <h3 className="text-xl font-bold text-white mb-2">Diseñando tu estrategia persuasiva...</h3>
                <p className="text-slate-500 text-sm">Garantizando gramática perfecta y ortografía impecable de nivel experto.</p>
              </div>
            ) : result ? (
              <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-8">
                   <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Titular de Alto Impacto</span>
                   <h2 className="text-2xl font-black text-white mt-1 leading-tight tracking-tight">{result.headline}</h2>
                </div>
                <div className="p-10 space-y-8">
                  <div className="relative">
                    <p className="text-lg text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                      {result.body}
                    </p>
                  </div>
                  
                  <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Llamada a la Acción (CTA) Irresistible</span>
                       <p className="text-xl font-black text-blue-500">{result.cta}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(result)}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-white shadow-lg shadow-blue-900/40"
                    >
                      Copiar Estrategia Completa
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 opacity-40">
                <i className="fa-solid fa-feather-pointed text-6xl mb-6"></i>
                <p className="text-xl font-bold">Tu guión maestro aparecerá aquí</p>
                <p className="text-sm mt-2">Completa el formulario para iniciar la magia del copywriting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default AISalesGenerator;
