'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  Receipt,
  Settings,
  Package,
  Calendar,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Devis', href: '/devis', icon: FileText },
  { name: 'Commandes', href: '/commandes', icon: Package },
  { name: 'Calendrier', href: '/calendrier', icon: Calendar },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Factures', href: '/factures', icon: Receipt },
];

const secondaryNavigation = [
  { name: 'Paramètres', href: '/parametres', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF8C00] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">RP</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">Rapid-Pub</span>
        </Link>
      </div>
      
      {/* Navigation principale */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#FFF3E0] text-[#FF8C00]'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive ? 'text-[#FF8C00]' : 'text-gray-400')} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {/* Navigation secondaire */}
      <div className="px-3 py-4 border-t border-gray-200">
        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#FFF3E0] text-[#FF8C00]'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive ? 'text-[#FF8C00]' : 'text-gray-400')} />
              {item.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
