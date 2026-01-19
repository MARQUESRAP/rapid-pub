'use client';

import { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { Button, Input, Textarea } from '@/components/ui';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'devis' | 'relance';
  devisId?: string;
  devisNumero?: string;
  clientNom?: string;
  clientEmail?: string;
  onSuccess?: () => void;
}

export function EmailModal({
  isOpen,
  onClose,
  type,
  devisId,
  devisNumero,
  clientNom,
  clientEmail,
  onSuccess,
}: EmailModalProps) {
  const [destinataire, setDestinataire] = useState(clientEmail || '');
  const [sujet, setSujet] = useState(
    type === 'devis'
      ? `Votre devis ${devisNumero} - Rapid-Pub`
      : `Relance: Devis ${devisNumero} - Rapid-Pub`
  );
  const [message, setMessage] = useState(
    type === 'devis'
      ? `Bonjour ${clientNom || ''},

Veuillez trouver ci-joint votre devis ${devisNumero}.

N'hésitez pas à nous contacter pour toute question.

Cordialement,
L'équipe Rapid-Pub`
      : `Bonjour ${clientNom || ''},

Nous nous permettons de vous relancer concernant le devis ${devisNumero} envoyé récemment.

Avez-vous eu le temps d'y réfléchir ? Nous restons à votre disposition pour toute question.

Cordialement,
L'équipe Rapid-Pub`
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!destinataire) {
      setError('Veuillez entrer une adresse email');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type === 'relance' ? 'relance' : 'devis',
          devisId,
          destinataire,
          sujet,
          message,
        }),
      });

      if (response.ok) {
        setSent(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
          setSent(false);
        }, 1500);
      } else {
        setError('Erreur lors de l\'envoi');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {type === 'devis' ? '📧 Envoyer le devis' : '🔔 Relancer le client'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-green-600">Email envoyé !</p>
            </div>
          ) : (
            <>
              <Input
                label="Destinataire"
                type="email"
                value={destinataire}
                onChange={(e) => setDestinataire(e.target.value)}
                placeholder="email@exemple.com"
              />
              
              <Input
                label="Sujet"
                value={sujet}
                onChange={(e) => setSujet(e.target.value)}
              />
              
              <Textarea
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
              />

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                💡 Le PDF du devis sera automatiquement joint à l'email
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!sent && (
          <div className="flex items-center justify-end gap-3 p-4 border-t">
            <Button variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {sending ? 'Envoi...' : 'Envoyer'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
