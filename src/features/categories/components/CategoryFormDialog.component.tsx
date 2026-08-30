import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { ImageOff, Loader2, Trash2, Upload } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { RemoteImage } from '@/components/app/RemoteImage';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  useCreateCategory,
  useRemoveCategoryImage,
  useUpdateCategory,
  useUploadCategoryImage,
} from '../hooks/useCategories';
import type { Category } from '../types';

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  nativeName: z.string().trim(),
  description: z.string().trim(),
  image: z.instanceof(File).nullable(),
});

type CategoryValues = z.infer<typeof categorySchema>;

// Keyed by category id where used, so it remounts (resetting local state) when
// the edited category changes — no setState-in-effect needed.
function CategoryImageField({ category }: { category: Category }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePath, setImagePath] = useState(category.image_path);
  const uploadMutation = useUploadCategoryImage(category.id, category.slug);
  const removeMutation = useRemoveCategoryImage(category.id);

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Image</Label>
      <div className="flex items-center gap-4">
        <RemoteImage
          imageKey={imagePath || undefined}
          alt={category.name}
          className="size-20"
        />
        <div className="flex flex-col items-start gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                uploadMutation.mutate(
                  { file, previousPath: imagePath },
                  { onSuccess: (updated) => setImagePath(updated.image_path) },
                );
              }
              e.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {imagePath ? 'Replace' : 'Upload image'}
          </Button>
          {imagePath && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              disabled={removeMutation.isPending}
              onClick={() =>
                removeMutation.mutate(imagePath, {
                  onSuccess: () => setImagePath(''),
                })
              }
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// New-category flow: hold the picked file locally (previewed via an object URL)
// and hand it to the parent; it's uploaded after the category is created.
function CategoryImagePicker({
  onSelect,
}: {
  onSelect: (file: File | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(
    null,
  );

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview.url);
  }, [preview]);

  const choose = (file: File | null) => {
    setPreview(file ? { file, url: URL.createObjectURL(file) } : null);
    onSelect(file);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Image</Label>
      <div className="flex items-center gap-4">
        {preview ? (
          <img
            src={preview.url}
            alt="Selected category"
            className="border-border size-20 rounded-md border object-cover"
          />
        ) : (
          <div className="border-border bg-muted text-muted-foreground flex size-20 items-center justify-center rounded-md border border-dashed">
            <ImageOff className="size-4" />
          </div>
        )}
        <div className="flex flex-col items-start gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              choose(e.target.files?.[0] ?? null);
              e.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-4" />
            {preview ? 'Change' : 'Select image'}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => choose(null)}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: CategoryFormDialogProps) {
  const isEditing = !!category;
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const mutation = isEditing ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', nativeName: '', description: '', image: null },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name ?? '',
        nativeName: category?.native_name ?? '',
        description: category?.description ?? '',
        image: null,
      });
    }
  }, [open, category, reset]);

  // `image` is a create-only form field; strip it from the DB payload.
  const onSubmit = ({ image, nativeName, ...rest }: CategoryValues) => {
    const input = { ...rest, native_name: nativeName || null };
    if (isEditing) {
      updateMutation.mutate(
        { id: category.id, input },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      // slug is left blank on purpose — a DB trigger slugifies the name.
      createMutation.mutate(
        { input: { ...input, slug: '' }, imageFile: image },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit category' : 'New category'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the category name or description.'
              : 'The URL slug is generated automatically from the name.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          {category ? (
            <CategoryImageField key={category.id} category={category} />
          ) : (
            <CategoryImagePicker onSelect={(file) => setValue('image', file)} />
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category-native-name">Native name</Label>
            <Input id="category-native-name" {...register('nativeName')} />
            <p className="text-muted-foreground text-xs">
              Optional Telugu display name shown beneath the English name in the
              storefront.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category-description">Description</Label>
            <Textarea
              id="category-description"
              rows={3}
              {...register('description')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {isEditing ? 'Save changes' : 'Create category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
