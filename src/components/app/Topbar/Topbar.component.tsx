import { LogOut, User } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';

import { ThemeToggle } from '@/components/app/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { signOut, useAuthStore } from '@/features/auth';

export function Topbar() {
  const email = useAuthStore((state) => state.session?.user.email);
  const navigate = useNavigate();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: signOut,
    onSuccess: async () => {
      await router.invalidate();
      navigate({ to: '/login' });
    },
  });

  return (
    <header className="border-border bg-card flex h-14 shrink-0 items-center gap-2 border-b px-2 sm:px-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarTrigger />
        </TooltipTrigger>
        <TooltipContent>Toggle menu</TooltipContent>
      </Tooltip>
      <span className="text-foreground text-sm font-medium">HomeFoods</span>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Account menu"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
          >
            <User className="size-4" />
            <span className="hidden max-w-40 truncate sm:inline">{email}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
            <DropdownMenuLabel className="text-muted-foreground truncate text-xs font-normal">
              {email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => mutation.mutate()}>
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
