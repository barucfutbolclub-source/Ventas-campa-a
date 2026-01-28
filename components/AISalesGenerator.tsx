
import React, { useState } from 'react';
import { generateSalesScript } from '../services/geminiService';
import { SalesScriptRequest, GeneratedScript } from '../types';

const AISalesGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedScript | null>(null);
  
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
    setLoading(true);
    setError(null);
    setResult(null); // Clear previous result to show skeleton
    try {
      const data = await generateSalesScript(formData);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
      {/* Input Section */}
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Nombre del Producto / Servicio</label>
            <input 
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500"
              placeholder="Ej. Curso de Ventas High Ticket"
              value={formData.productName}
              onChange={e => setFormData(prev => ({ ...prev, productName: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Audiencia Objetivo</label>
            <input 
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500"
              placeholder="Ej. Dueños de agencias de marketing"
              value={formData.targetAudience}
              onChange={e => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Beneficios Clave</label>
            <div className="space-y-3">
              {formData.keyBenefits.map((benefit, idx) => (
                <input 
                  key={idx}
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500"
                  placeholder={`Beneficio #${idx + 1}`}
                  value={benefit}
                  onChange={e => handleBenefitChange(idx, e.target.value)}
                />
              ))}
            </div>
            <button 
              type="button"
              onClick={handleAddBenefit}
              className="mt-3 text-sm text-blue-400 font-bold hover:text-blue-300"
            >
              + Añadir otro beneficio
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Tono de Comunicación</label>
            <select 
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={formData.tone}
              onChange={e => setFormData(prev => ({ ...prev, tone: e.target.value as any }))}
            >
              <option value="professional">Profesional y Autoritario</option>
              <option value="aggressive">Agresivo / Ventas Directas</option>
              <option value="empathetic">Empático y Cercano</option>
              <option value="humorous">Divertido / Informal</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${loading ? 'bg-slate-700 opacity-80 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-900/40 active:scale-95'}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-circle-notch animate-spin"></i> Procesando Estrategia...
              </span>
            ) : (
              'Generar Guion de Ventas'
            )}
          </button>
        </form>
      </div>

      {/* Output Section */}
      <div className="lg:sticky lg:top-24 h-full">
        {loading ? (
          <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800 space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-slate-800 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-slate-800 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-3/4 bg-slate-800 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-slate-800 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-slate-800 rounded animate-pulse"></div>
              <div className="h-4 w-5/6 bg-slate-800 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-slate-800 rounded animate-pulse"></div>
              <div className="h-4 w-4/6 bg-slate-800 rounded animate-pulse"></div>
            </div>
            <div className="pt-6">
              <div className="h-20 w-full bg-blue-900/10 border border-blue-900/20 rounded-xl animate-pulse"></div>
            </div>
            <p className="text-center text-xs text-blue-500/50 animate-pulse">La IA está conectando con tu audiencia objetivo...</p>
          </div>
        ) : result ? (
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-2xl border border-slate-800 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="text-blue-400 font-bold tracking-widest text-xs uppercase">Resultado Generado</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${result.headline}\n\n${result.body}\n\n${result.cta}`);
                    alert('Copiado al portapapeles!');
                  }}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-copy"></i>
                </button>
              </div>

              <h2 className="text-2xl font-bold mb-6 text-blue-100 leading-tight">{result.headline}</h2>
              <div className="text-slate-300 whitespace-pre-wrap mb-8 leading-relaxed font-light text-lg">
                {result.body}
              </div>
              <div className="p-5 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                <p className="text-blue-400 text-sm font-semibold mb-2 italic">Call to Action Sugerido:</p>
                <p className="font-bold text-xl text-white">{result.cta}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 min-h-[400px]">
            <i className="fa-solid fa-magic-wand-sparkles text-5xl mb-4 text-slate-600"></i>
            <h3 className="text-xl font-bold text-slate-400 mb-2">Esperando tu configuración</h3>
            <p className="max-w-xs mx-auto">Completa el formulario para ver cómo la IA redacta tu próximo éxito de ventas.</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-900/20 text-red-400 rounded-xl border border-red-900/50 flex items-center gap-2 animate-in fade-in duration-300">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AISalesGenerator;
