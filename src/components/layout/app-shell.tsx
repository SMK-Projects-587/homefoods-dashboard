import { Outlet } from '@tanstack/react-router';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import AppSidebar from './app-sidebar';
import Topbar from './topbar';

export default function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
