
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#020617] border-t border-slate-800 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <span className="text-lg font-bold text-white tracking-tight">SalesMaster<span className="text-blue-500">AI</span></span>
          </div>
          
          <nav className="flex gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-blue-500 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Términos</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Cookies</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Soporte</a>
          </nav>

          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-500 hover:border-blue-900 transition-all">
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-400 hover:border-blue-800 transition-all">
              <i className="fa-brands fa-twitter"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:border-rose-900 transition-all">
              <i className="fa-brands fa-instagram"></i>
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-600 text-xs">
          © {new Date().getFullYear()} SalesMaster AI Hub. Todos los derechos reservados. Impulsado por Gemini 3.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
