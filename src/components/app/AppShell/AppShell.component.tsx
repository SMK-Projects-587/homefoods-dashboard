import { Outlet } from '@tanstack/react-router';

import { AppSidebar } from '@/components/app/AppSidebar';
import { Breadcrumbs } from '@/components/app/Breadcrumbs';
import { Topbar } from '@/components/app/Topbar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Breadcrumbs className="mb-4" />
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
