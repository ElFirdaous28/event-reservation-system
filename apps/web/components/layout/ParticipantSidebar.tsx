'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PartyPopper, Ticket, User } from 'lucide-react';
import LogoutButton from './LogoutButton';

export function ParticipantSidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/participant', label: 'Dashboard', icon: Home },
    { href: '/events', label: 'Browse Events', icon: PartyPopper },
    { href: '/participant/my-reservations', label: 'My Reservations', icon: Ticket },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border min-h-screen flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">My Dashboard</h2>
      </div>
      <nav className="p-4 space-y-2">
        {links.map((link) => {
          const isDashboard = link.href === '/participant';
          const isActive = pathname === link.href || (!isDashboard && pathname?.startsWith(`${link.href}/`));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <link.icon className="h-4 w-4" aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4 border-t border-border">
        <LogoutButton />
      </div>
    </aside>
  );
}
