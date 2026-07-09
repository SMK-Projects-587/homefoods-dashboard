import { supabase } from '@/lib/supabase';

type R2Bucket = 'images' | 'invoices';
type PresignAction = 'upload' | 'download' | 'delete';

interface PresignResponse {
  url: string;
  method: 'PUT' | 'GET';
  bucket: R2Bucket;
  key: string;
  expires_in: number;
}

async function presign(
  action: PresignAction,
  bucket: R2Bucket,
  key: string,
): Promise<PresignResponse> {
  const { data, error } = await supabase.functions.invoke<PresignResponse>(
    'r2-presign',
    {
      body: { action, bucket, key },
    },
  );
  if (error) throw error;
  if (!data) throw new Error('r2-presign returned no data');
  return data;
}

// Object keys must start with one of these prefixes (enforced server-side too).
export function buildImageKey(
  kind: 'products' | 'categories',
  slug: string,
  file: File,
): string {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const id = crypto.randomUUID();
  return `${kind}/${slug || 'untitled'}/${id}.${ext}`;
}

export async function uploadImage(key: string, file: File): Promise<void> {
  const { url } = await presign('upload', 'images', key);
  const res = await fetch(url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
}

export async function getImageDownloadUrl(key: string): Promise<string> {
  const { url } = await presign('download', 'images', key);
  return url;
}

export async function deleteImage(key: string): Promise<void> {
  await presign('delete', 'images', key);
}
