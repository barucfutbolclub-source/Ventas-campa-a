
import React from 'react';

const services = [
  {
    icon: 'fa-brain',
    title: 'Estrategia Psicológica',
    description: 'Implementamos gatillos mentales y marcos psicológicos para acelerar la toma de decisiones del cliente.'
  },
  {
    icon: 'fa-pen-nib',
    title: 'Copywriting de Conversión',
    description: 'Textos que no solo informan, sino que seducen y guían al usuario hacia el botón de compra.'
  },
  {
    icon: 'fa-chart-line',
    title: 'Optimización de Embudos',
    description: 'Analizamos cada etapa de tu funnel para reducir la fricción y aumentar el ticket promedio.'
  },
  {
    icon: 'fa-microphone',
    title: 'Entrenamiento de Equipos',
    description: 'Formamos a tu fuerza de ventas con técnicas de negociación moderna y manejo de objeciones.'
  },
  {
    icon: 'fa-robot',
    title: 'Automatización AI',
    description: 'Integramos agentes de IA para calificar leads y responder preguntas frecuentes 24/7.'
  },
  {
    icon: 'fa-shield-halved',
    title: 'Consultoría de Marca',
    description: 'Construimos una autoridad sólida para que tus clientes confíen en ti antes del primer contacto.'
  }
];

const Services: React.FC = () => {
  return (
    <section className="py-20 bg-[#0f172a]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Servicios Especializados</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Soluciones integrales diseñadas para maximizar el retorno de inversión y el crecimiento sostenible de tu negocio.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 hover:border-blue-500/50 transition-all group">
              <div className="w-14 h-14 bg-blue-900/30 text-blue-400 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <i className={`fa-solid ${service.icon}`}></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
