'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout';
import { Card, Badge } from '@/components/ui';
import { ChevronLeft, ChevronRight, Loader2, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Commande {
  id: string;
  numero: string;
  titre: string;
  statut: string;
  date_livraison_prevue: string;
  prix_total: number;
  client_nom: string;
}

export default function CalendrierPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommandes = async () => {
    try {
      // Calculer les dates du mois
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await fetch(
        `/api/calendrier?start=${startOfMonth.toISOString().split('T')[0]}&end=${endOfMonth.toISOString().split('T')[0]}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setCommandes(data.commandes || []);
      }
    } catch (err) {
      console.error('Erreur chargement calendrier:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCommandes();
  }, [currentDate]);

  // Navigation mois
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Générer les jours du mois
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: (Date | null)[] = [];
    
    // Jours vides avant le 1er du mois
    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Lundi = 0
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Jours du mois
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // Obtenir les commandes pour un jour
  const getCommandesForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return commandes.filter((cmd) => {
      const cmdDate = new Date(cmd.date_livraison_prevue).toISOString().split('T')[0];
      return cmdDate === dateStr;
    });
  };

  const days = getDaysInMonth();
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'nouvelle':
        return 'bg-purple-500';
      case 'en_production':
        return 'bg-yellow-500';
      case 'pret':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Calendrier" subtitle="Planning de production" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF8C00]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Calendrier" subtitle="Planning de production" />
      
      <div className="p-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold capitalize min-w-[200px] text-center">
              {monthName}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-[#FF8C00] hover:bg-[#FFF3E0] rounded-lg"
          >
            Aujourd'hui
          </button>
        </div>

        {/* Légende */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-600">Nouvelle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600">En production</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Prêt</span>
          </div>
        </div>

        {/* Calendrier */}
        <Card>
          <div className="grid grid-cols-7">
            {/* En-têtes jours */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-gray-500 border-b bg-gray-50"
              >
                {day}
              </div>
            ))}
            
            {/* Jours */}
            {days.map((date, index) => (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-b border-r ${
                  date ? 'bg-white' : 'bg-gray-50'
                } ${date && isToday(date) ? 'bg-[#FFF3E0]' : ''}`}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${
                      isToday(date) ? 'text-[#FF8C00]' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {getCommandesForDay(date).map((cmd) => (
                        <div
                          key={cmd.id}
                          className={`p-1.5 rounded text-xs text-white ${getStatutColor(cmd.statut)} cursor-pointer hover:opacity-90`}
                          title={`${cmd.numero} - ${cmd.client_nom}`}
                        >
                          <div className="font-medium truncate">{cmd.numero}</div>
                          <div className="truncate opacity-90">{cmd.client_nom}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Liste des commandes du mois */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Commandes à livrer ce mois ({commandes.length})
          </h3>
          
          {commandes.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune livraison prévue ce mois</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {commandes.map((cmd) => (
                <Card key={cmd.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{cmd.numero}</p>
                      <p className="text-sm text-gray-600">{cmd.client_nom}</p>
                      <p className="text-sm text-gray-500 mt-1">{cmd.titre}</p>
                    </div>
                    <Badge statut={cmd.statut} />
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-sm text-gray-500">
                      Livraison: {new Date(cmd.date_livraison_prevue).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="font-semibold text-[#FF8C00]">
                      {formatPrice(cmd.prix_total)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
