import { useState } from 'react';

import { FileText, Plus } from 'lucide-react';
import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { CreateOrderFromTemplateDialog } from '@/features/orders/components/CreateOrderFromTemplateDialog.component';
import { OrdersTable } from '@/features/orders/components/OrdersTable.component';

export function OrdersPage() {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Orders</h1>
          <p className="text-muted-foreground text-sm">
            Orders recorded manually by staff.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => setTemplateDialogOpen(true)}>
            <FileText className="size-4" />
            Create order from template
          </Button>
          <Button asChild>
            <Link to="/orders/new">
              <Plus className="size-4" />
              New order
            </Link>
          </Button>
        </div>
      </div>

      <OrdersTable />

      <CreateOrderFromTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
      />
    </div>
  );
}
