'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, LayoutDashboard, Settings, Ticket, Users } from 'lucide-react';
import LogoutButton from './LogoutButton';

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/events', label: 'Manage Events', icon: CalendarDays },
    { href: '/admin/reservations', label: 'Reservations', icon: Ticket },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/profile', label: 'Profile', icon: Settings },
  ];

  return (
    <aside className='bg-surface border-border flex min-h-screen w-64 flex-col border-r'>
      <div className='border-border border-b p-4'>
        <h2 className='text-foreground text-lg font-semibold'>Admin Panel</h2>
      </div>
      <nav className='space-y-2 p-4'>
        {links.map((link) => {
          const isDashboard = link.href === '/admin';
          const isActive =
            pathname === link.href || (!isDashboard && pathname?.startsWith(`${link.href}/`));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-2 transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <link.icon className='h-4 w-4' aria-hidden='true' />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className='border-border mt-auto border-t p-4'>
        <LogoutButton />
      </div>
    </aside>
  );
}
