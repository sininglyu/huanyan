import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads');

export function getImagePath(userId: string, suffix: string): string {
  const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const uuid = randomUUID().slice(0, 8);
  return `user_${userId}/skin_analysis/${ts}_${uuid}${suffix}`;
}

export async function saveBuffer(relativePath: string, buffer: Buffer): Promise<string> {
  const fullPath = path.join(UPLOAD_DIR, relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, buffer);
  return relativePath;
}

export function getPublicUrl(relativePath: string): string {
  const base = process.env.OSS_PUBLIC_BASE ?? `http://localhost:3000/uploads`;
  return `${base}/${relativePath.replace(/\\/g, '/')}`;
}
