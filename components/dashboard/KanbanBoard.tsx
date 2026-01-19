'use client';

import { useState } from 'react';
import { Modal, Button, Badge } from '@/components/ui';
import { formatPrice, formatDate } from '@/lib/utils';
import { Inbox, Send, Factory, CheckCircle, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import type { KanbanItem } from '@/types';

interface KanbanBoardProps {
  aTraiter: KanbanItem[];
  devisEnvoyes: KanbanItem[];
  enProduction: KanbanItem[];
  termine: KanbanItem[];
  onStatusChange?: (item: KanbanItem, newStatus: string) => void;
}

interface ColumnConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  textColor: string;
  items: KanbanItem[];
  acceptTypes: ('devis' | 'commande')[];
  dropStatus: string;
}

export function KanbanBoard({
  aTraiter,
  devisEnvoyes,
  enProduction,
  termine,
  onStatusChange,
}: KanbanBoardProps) {
  const [selectedItem, setSelectedItem] = useState<KanbanItem | null>(null);
  const [draggedItem, setDraggedItem] = useState<KanbanItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const columns: ColumnConfig[] = [
    {
      id: 'a_traiter',
      title: 'À traiter',
      icon: <Inbox className="w-5 h-5" />,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600',
      items: aTraiter,
      acceptTypes: ['devis'],
      dropStatus: 'brouillon',
    },
    {
      id: 'devis_envoyes',
      title: 'Devis envoyés',
      icon: <Send className="w-5 h-5" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      items: devisEnvoyes,
      acceptTypes: ['devis'],
      dropStatus: 'envoye',
    },
    {
      id: 'en_production',
      title: 'En production',
      icon: <Factory className="w-5 h-5" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-600',
      items: enProduction,
      acceptTypes: ['devis', 'commande'],
      dropStatus: 'en_production',
    },
    {
      id: 'termine',
      title: 'Terminé',
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
      items: termine,
      acceptTypes: ['commande'],
      dropStatus: 'pret',
    },
  ];

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, item: KanbanItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => {
      target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
    setDragOverColumn(null);
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, column: ColumnConfig) => {
    e.preventDefault();
    if (!draggedItem) return;
    
    // Vérifier si la colonne accepte ce type d'item
    const canDrop = column.acceptTypes.includes(draggedItem.type as 'devis' | 'commande');
    e.dataTransfer.dropEffect = canDrop ? 'move' : 'none';
    
    if (canDrop) {
      setDragOverColumn(column.id);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, column: ColumnConfig) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedItem || !onStatusChange) return;
    
    // Déterminer le nouveau statut
    let newStatus = column.dropStatus;
    
    // Cas spécial: devis déposé dans "En production" = accepté
    if (column.id === 'en_production' && draggedItem.type === 'devis') {
      newStatus = 'accepte';
    }
    
    // Cas spécial: commande déposée dans "Terminé" = prêt
    if (column.id === 'termine' && draggedItem.type === 'commande') {
      newStatus = 'pret';
    }
    
    if (newStatus !== draggedItem.statut) {
      onStatusChange(draggedItem, newStatus);
    }
  };

  // Actions disponibles pour chaque item
  const getActions = (item: KanbanItem) => {
    const actions: { label: string; status: string; variant: 'primary' | 'outline' | 'danger' }[] = [];
    
    if (item.type === 'devis') {
      if (item.statut === 'brouillon') {
        actions.push({ label: 'Envoyer au client', status: 'envoye', variant: 'primary' });
      } else if (item.statut === 'envoye') {
        actions.push({ label: 'Accepter', status: 'accepte', variant: 'primary' });
        actions.push({ label: 'Refuser', status: 'refuse', variant: 'danger' });
      }
    } else if (item.type === 'commande') {
      if (item.statut === 'nouvelle') {
        actions.push({ label: 'Démarrer production', status: 'en_production', variant: 'primary' });
      } else if (item.statut === 'en_production') {
        actions.push({ label: 'Marquer prêt', status: 'pret', variant: 'primary' });
      } else if (item.statut === 'pret') {
        actions.push({ label: 'Marquer livré', status: 'livre', variant: 'primary' });
      }
    }
    
    return actions;
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`flex-1 min-w-[280px] rounded-xl ${column.bgColor} border-2 ${
              dragOverColumn === column.id ? 'border-[#FF8C00] border-dashed' : column.borderColor
            } transition-colors`}
            onDragOver={(e) => handleDragOver(e, column)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column)}
          >
            {/* Header */}
            <div className="p-3 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 ${column.textColor}`}>
                  {column.icon}
                  <span className="font-semibold">{column.title}</span>
                </div>
                <span className="bg-white px-2 py-0.5 rounded-full text-sm font-medium">
                  {column.items.length}
                </span>
              </div>
            </div>
            
            {/* Items */}
            <div className="p-2 space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto">
              {column.items.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Aucun élément
                </div>
              ) : (
                column.items.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedItem(item)}
                    className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    {/* Client + Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-medium text-gray-900 text-sm truncate">
                        {item.client_nom}
                      </span>
                      <Badge statut={item.statut} className="text-xs shrink-0" />
                    </div>
                    
                    {/* Titre */}
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {item.titre}
                    </p>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#FF8C00]">
                        {formatPrice(item.prix)}
                      </span>
                      
                      {/* Indicateurs */}
                      <div className="flex items-center gap-2">
                        {item.jours_depuis_envoi !== undefined && item.jours_depuis_envoi > 0 && (
                          <span className={`text-xs flex items-center gap-1 ${
                            item.jours_depuis_envoi >= 5 ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            <Clock className="w-3 h-3" />
                            J+{item.jours_depuis_envoi}
                          </span>
                        )}
                        {item.relance_count !== undefined && item.relance_count > 0 && (
                          <span className="text-xs text-orange-500 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {item.relance_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal détail */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.type === 'devis' ? 'Détail du devis' : 'Détail de la commande'}
        size="md"
      >
        {selectedItem && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-lg">{selectedItem.client_nom}</h4>
                <p className="text-gray-600">{selectedItem.titre}</p>
              </div>
              <Badge statut={selectedItem.statut} />
            </div>

            {/* Prix */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4">
              <span className="text-sm text-gray-500">Montant HT</span>
              <p className="text-3xl font-bold text-[#FF8C00]">
                {formatPrice(selectedItem.prix)}
              </p>
            </div>

            {/* Infos */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500">Type</span>
                <p className="font-medium capitalize">{selectedItem.type}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500">Créé le</span>
                <p className="font-medium">{formatDate(selectedItem.created_at)}</p>
              </div>
              {selectedItem.jours_depuis_envoi !== undefined && selectedItem.jours_depuis_envoi > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-500">En attente</span>
                  <p className="font-medium">{selectedItem.jours_depuis_envoi} jour{selectedItem.jours_depuis_envoi > 1 ? 's' : ''}</p>
                </div>
              )}
              {selectedItem.relance_count !== undefined && selectedItem.relance_count > 0 && (
                <div className="bg-orange-50 rounded-lg p-3">
                  <span className="text-gray-500">Relances</span>
                  <p className="font-medium text-orange-600">{selectedItem.relance_count}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {getActions(selectedItem).map((action, i) => (
                <Button
                  key={i}
                  variant={action.variant}
                  onClick={() => {
                    if (onStatusChange) {
                      onStatusChange(selectedItem, action.status);
                    }
                    setSelectedItem(null);
                  }}
                >
                  {action.label}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ))}
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
