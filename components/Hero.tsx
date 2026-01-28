
import React from 'react';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <section className="relative overflow-hidden bg-[#020617] py-24 lg:py-40">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
            <span className="inline-block px-4 py-1.5 mb-8 text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 border border-blue-500/20 rounded-full">
              Especialista en Ventas & Marketing AI
            </span>
            <h1 className="text-6xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
              Vende Más con <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500">
                Inteligencia Real
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-400 mb-12 leading-relaxed max-w-2xl mx-auto font-light">
              La plataforma definitiva para crear textos persuasivos y creativos visuales que convierten leads en clientes.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={onStart}
                className="group relative w-full sm:w-auto px-10 py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-2xl shadow-blue-600/20 hover:bg-blue-500 hover:-translate-y-1 transition-all text-xl overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Empezar Ahora <i className="fa-solid fa-arrow-right text-sm group-hover:translate-x-1 transition-transform"></i>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
              <button className="w-full sm:w-auto px-10 py-5 bg-slate-900/50 text-slate-300 font-bold rounded-2xl border border-slate-800 hover:bg-slate-800 hover:text-white transition-all text-xl backdrop-blur-sm">
                Nuestros Planes
              </button>
            </div>
          </div>

          <div className="mt-24 pt-12 border-t border-slate-800/50 animate-in fade-in duration-1000 delay-500">
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest mb-8">Empresas que confían en nuestra IA</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 opacity-30 grayscale invert hover:opacity-60 transition-all duration-700">
              <div className="flex items-center justify-center"><i className="fa-brands fa-stripe text-4xl"></i></div>
              <div className="flex items-center justify-center"><i className="fa-brands fa-shopify text-4xl"></i></div>
              <div className="flex items-center justify-center"><i className="fa-brands fa-amazon text-4xl"></i></div>
              <div className="flex items-center justify-center"><i className="fa-brands fa-hubspot text-4xl"></i></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
