import path from "path";
import fs from "fs";
import { DATA_DIR } from "./db";

const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

export function eventUploadDir(eventId: string): string {
  const dir = path.join(UPLOADS_DIR, eventId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function photoFilePath(eventId: string, storedName: string): string {
  // storedName is always generated server-side, but guard against traversal anyway.
  const safe = path.basename(storedName);
  return path.join(UPLOADS_DIR, eventId, safe);
}

export async function savePhotoFile(eventId: string, storedName: string, data: Buffer): Promise<void> {
  const dir = eventUploadDir(eventId);
  await fs.promises.writeFile(path.join(dir, path.basename(storedName)), data);
}

export async function deletePhotoFiles(eventId: string, names: (string | null)[]): Promise<void> {
  for (const name of names) {
    if (!name) continue;
    try {
      await fs.promises.unlink(photoFilePath(eventId, name));
    } catch {
      // already gone
    }
  }
}
