
import React from 'react';

const Contact: React.FC = () => {
  return (
    <section className="py-24 bg-[#020617]">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-slate-800">
          <div className="lg:w-1/2 p-12 lg:p-20 text-white flex flex-col justify-center bg-gradient-to-br from-slate-900 to-blue-950/30">
            <h2 className="text-4xl font-extrabold mb-6 leading-tight">¿Listo para duplicar tus ingresos?</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Reserva una consultoría estratégica gratuita de 15 minutos. Analizaremos tu proceso actual y detectaremos los cuellos de botella que están frenando tu crecimiento.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl shadow-lg shadow-blue-900/40">
                  <i className="fa-solid fa-check"></i>
                </div>
                <div>
                  <h4 className="font-bold">Análisis de Embudos</h4>
                  <p className="text-sm text-slate-400">Revisión profunda de tu funnel actual.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl shadow-lg shadow-blue-900/40">
                  <i className="fa-solid fa-check"></i>
                </div>
                <div>
                  <h4 className="font-bold">Mapa de Ruta Personalizado</h4>
                  <p className="text-sm text-slate-400">Estrategia paso a paso para escalar.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 bg-[#0f172a] p-12 lg:p-20">
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">Nombre</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">Email</label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="tu@empresa.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Web de tu Negocio</label>
                <input type="url" className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Mensaje (Opcional)</label>
                <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-600 outline-none resize-none transition-all" placeholder="Cuéntanos un poco sobre tus desafíos actuales..."></textarea>
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40 active:scale-[0.98]">
                Reservar Mi Sesión Gratuita
              </button>
              <p className="text-center text-xs text-slate-500 mt-4">
                * Cupos limitados por semana para garantizar la máxima calidad.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
