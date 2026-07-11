import { useState } from 'react';

import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProducts } from '@/features/products';

export interface OrderItemDraft {
  variantId: number;
  productName: string;
  variantTitle: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  attributes: Record<string, unknown>;
}

interface OrderItemsEditorProps {
  items: OrderItemDraft[];
  onAdd: (item: OrderItemDraft) => void;
  onRemove: (index: number) => void;
  onQuantityChange: (index: number, quantity: number) => void;
}

export function OrderItemsEditor({
  items,
  onAdd,
  onRemove,
  onQuantityChange,
}: OrderItemsEditorProps) {
  const { data: products } = useProducts();
  const [productId, setProductId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [quantity, setQuantity] = useState('1');

  const selectedProduct = products?.find((p) => String(p.id) === productId);
  const variants = selectedProduct?.product_variants ?? [];
  const selectedVariant = variants.find((v) => String(v.id) === variantId);

  const handleAdd = () => {
    if (!selectedProduct || !selectedVariant) return;
    const qty = Math.max(1, Math.round(Number(quantity)) || 1);
    onAdd({
      variantId: selectedVariant.id,
      productName: selectedProduct.name,
      variantTitle: selectedVariant.title,
      sku: selectedVariant.sku,
      unitPrice: Number(selectedVariant.price),
      quantity: qty,
      attributes: (selectedVariant.attributes as Record<string, unknown>) ?? {},
    });
    setProductId('');
    setVariantId('');
    setQuantity('1');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_2fr_90px_auto]">
        <Select
          value={productId}
          onValueChange={(value) => {
            setProductId(value);
            setVariantId('');
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products?.map((product) => (
              <SelectItem key={product.id} value={String(product.id)}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={variantId}
          onValueChange={setVariantId}
          disabled={!selectedProduct}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select variant" />
          </SelectTrigger>
          <SelectContent>
            {variants.map((variant) => (
              <SelectItem key={variant.id} value={String(variant.id)}>
                {variant.title} — ₹{variant.price}
                {!variant.in_stock ? ' (out of stock)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <Button type="button" onClick={handleAdd} disabled={!selectedVariant}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No items added yet — add at least one to create the order.
        </p>
      ) : (
        <div className="border-border overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Unit price</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Line total</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={`${item.variantId}-${index}`}>
                  <TableCell className="whitespace-nowrap">
                    {item.productName}
                    <span className="text-muted-foreground">
                      {' '}
                      — {item.variantTitle}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {item.sku}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    ₹{item.unitPrice}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        onQuantityChange(
                          index,
                          Math.max(1, Math.round(Number(e.target.value)) || 1),
                        )
                      }
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    ₹{(item.unitPrice * item.quantity).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => onRemove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
