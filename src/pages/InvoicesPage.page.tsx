import { InvoicesTable } from '@/features/invoices/components/InvoicesTable.component';

export function InvoicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold">Invoices</h1>
        <p className="text-muted-foreground text-sm">
          Issued invoices, linked back to their order.
        </p>
      </div>

      <InvoicesTable />
    </div>
  );
}
