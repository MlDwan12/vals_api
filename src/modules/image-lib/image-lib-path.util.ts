import { join, resolve } from 'node:path';

export function buildImageLibDestinationAbs(date: Date = new Date()): string {
  return resolve(process.cwd(), 'uploads', 'image-lib');
}

export function getUploadsRootAbs(): string {
  return resolve(process.cwd(), 'uploads');
}

export function getImageLibRootAbs(): string {
  return resolve(process.cwd(), 'uploads', 'image-lib');
}
