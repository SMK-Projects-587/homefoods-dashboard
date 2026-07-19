import { Download, FileText, Loader2, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OrderStatus } from '@/features/orders';
import { formatDate } from '@/lib/utils';

import {
  useDownloadInvoice,
  useGenerateInvoice,
  useInvoice,
} from '../hooks/useInvoices';

const ELIGIBLE_STATUSES: OrderStatus[] = ['confirmed', 'completed'];

interface InvoiceCardProps {
  orderId: number;
  orderStatus: OrderStatus;
  paymentStatus: string | null;
}

/**
 * Only `confirmed`/`completed` orders that are also marked `paid` can be
 * invoiced — enforced by the live `issue_invoice` Postgres function, mirrored
 * here so the button isn't offered for a guaranteed-to-fail case. (Note:
 * this payment-status requirement is in the function as actually deployed
 * locally, but is NOT reflected in
 * supabase/migrations/20260720100000_invoice_issuance.sql in the homefoods
 * repo as of this writing — that migration's `issue_invoice` only checks
 * status. Worth reconciling upstream; this dashboard matches the live
 * behavior, not the checked-in migration.)
 * An invoice, once issued, is permanent — `invoices.order_id` is unique, so
 * this is a one-time action per order, not a re-generate-on-demand one.
 */
export function InvoiceCard({
  orderId,
  orderStatus,
  paymentStatus,
}: InvoiceCardProps) {
  const { data: invoice, isPending } = useInvoice(orderId);
  const generateMutation = useGenerateInvoice(orderId);
  const downloadMutation = useDownloadInvoice();

  if (isPending) return null;

  const eligible =
    ELIGIBLE_STATUSES.includes(orderStatus) && paymentStatus === 'paid';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {invoice?.pdf_key ? (
          <>
            <div className="text-sm">
              <p className="text-foreground font-medium">
                {invoice.invoice_number}
              </p>
              {invoice.issued_at && (
                <p className="text-muted-foreground">
                  Issued {formatDate(invoice.issued_at)}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-fit"
              disabled={downloadMutation.isPending}
              onClick={() => downloadMutation.mutate(invoice.pdf_key)}
            >
              {downloadMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              View invoice
            </Button>
          </>
        ) : invoice ? (
          <>
            <p className="text-muted-foreground text-sm">
              Invoice {invoice.invoice_number} was issued, but the PDF
              didn&rsquo;t finish generating.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-fit"
              disabled={generateMutation.isPending}
              onClick={() => generateMutation.mutate()}
            >
              {generateMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Retry
            </Button>
          </>
        ) : eligible ? (
          <>
            <p className="text-muted-foreground text-sm">
              No invoice has been generated for this order yet.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-fit"
              disabled={generateMutation.isPending}
              onClick={() => generateMutation.mutate()}
            >
              {generateMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileText className="size-4" />
              )}
              Generate invoice
            </Button>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            Available once the order is confirmed or completed and payment is
            marked paid.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
