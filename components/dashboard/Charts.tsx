'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent } from '@/components/ui';

// Couleurs du design system
const COLORS = {
  primary: '#FF8C00',
  success: '#10B981',
};

const PIE_COLORS = ['#FF8C00', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

interface CAChartProps {
  data: { mois: string; mois_label: string; ca: number }[];
}

export function CAChart({ data }: CAChartProps) {
  const chartData = data.map((d) => ({
    mois: d.mois_label || d.mois,
    CA: parseFloat(String(d.ca)) || 0,
  }));

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Chiffre d'affaires (6 derniers mois)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}€`} />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(2)} €`, 'CA']}
                contentStyle={{ borderRadius: 8 }}
              />
              <Area
                type="monotone"
                dataKey="CA"
                stroke={COLORS.primary}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCA)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface TauxConversionProps {
  taux: number;
}

export function TauxConversionGauge({ taux }: TauxConversionProps) {
  const data = [
    { name: 'Acceptés', value: taux },
    { name: 'Autres', value: 100 - taux },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Taux de conversion</h3>
        <div className="h-40 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={65}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                <Cell fill={COLORS.success} />
                <Cell fill="#E5E7EB" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{taux}%</p>
              <p className="text-xs text-gray-500">Devis acceptés</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TopClientsProps {
  clients: { nom: string; entreprise: string; ca_total: number; nb_commandes: number }[];
}

export function TopClientsChart({ clients }: TopClientsProps) {
  const chartData = clients.map((c) => ({
    nom: c.entreprise || c.nom,
    CA: parseFloat(String(c.ca_total)) || 0,
  }));

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Top 5 clients (CA)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}€`} />
              <YAxis type="category" dataKey="nom" tick={{ fontSize: 11 }} width={100} />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(2)} €`, 'CA']}
                contentStyle={{ borderRadius: 8 }}
              />
              <Bar dataKey="CA" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface RepartitionProduitsProps {
  data: { type: string; count: number; montant: number }[];
}

export function RepartitionProduitsChart({ data }: RepartitionProduitsProps) {
  const chartData = data.map((d) => ({
    name: formatProductType(d.type),
    value: parseFloat(String(d.montant)) || 0,
  }));

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Répartition par produit</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(2)} €`]}
                contentStyle={{ borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Légende sous le graphique */}
        <div className="flex flex-wrap gap-2 mt-2 justify-center">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-1 text-xs">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <span className="text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper pour formater les types de produits
function formatProductType(type: string): string {
  const types: Record<string, string> = {
    flyers: 'Flyers',
    cartes_visite: 'Cartes de visite',
    affiches: 'Affiches',
    depliants: 'Dépliants',
    kakemono: 'Kakémono',
    stickers: 'Stickers',
    brochures: 'Brochures',
    autres: 'Autres',
  };
  return types[type] || type;
}
