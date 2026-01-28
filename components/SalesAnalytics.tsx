
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

const conversionData = [
  { name: 'Sem 1', conversion: 4.2, revenue: 12000 },
  { name: 'Sem 2', conversion: 4.8, revenue: 15400 },
  { name: 'Sem 3', conversion: 6.1, revenue: 21000 },
  { name: 'Sem 4', conversion: 5.9, revenue: 19800 },
  { name: 'Sem 5', conversion: 7.2, revenue: 28000 },
  { name: 'Sem 6', conversion: 8.5, revenue: 34500 },
];

const SalesAnalytics: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Ingresos Totales', val: '$130,700', trend: '+12.5%', color: 'blue' },
          { label: 'Conversión Media', val: '6.45%', trend: '+2.1%', color: 'emerald' },
          { label: 'Costo por Lead', val: '$14.20', trend: '-8.4%', color: 'indigo' },
          { label: 'Retorno (ROAS)', val: '4.8x', trend: '+0.5', color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-800">
            <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h4 className="text-2xl font-bold text-white">{stat.val}</h4>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Tendencia de Ingresos</h3>
            <p className="text-sm text-slate-500">Últimas 6 semanas de actividad</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={conversionData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)', color: '#f8fafc' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Chart */}
        <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Tasa de Conversión</h3>
            <p className="text-sm text-slate-500">Optimización de cierres (%)</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                <Tooltip 
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)', color: '#f8fafc' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Bar dataKey="conversion" fill="#818cf8" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;
