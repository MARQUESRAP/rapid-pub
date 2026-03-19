import { cn } from '@/lib/utils';
import { statutColors, statutLabels } from '@/lib/utils';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  statut?: string;
  className?: string;
}

export function Badge({ children, variant = 'default', statut, className }: BadgeProps) {
  // Si un statut est fourni, utiliser les couleurs prédéfinies
  if (statut) {
    const colors = statutColors[statut] || { bg: 'bg-gray-100', text: 'text-gray-700' };
    const label = statutLabels[statut] || statut;
    
    return (
      <span
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
          colors.bg,
          colors.text,
          className
        )}
      >
        {children || label}
      </span>
    );
  }
  
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
