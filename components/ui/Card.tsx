import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ className, children, onClick, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        hover && 'hover:shadow-md hover:border-gray-300 transition-all cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('px-4 py-3 border-b border-gray-100', className)}>
      {children}
    </div>
  );
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('px-4 py-3', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg', className)}>
      {children}
    </div>
  );
}
