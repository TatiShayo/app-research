import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { customAlphabet } from "nanoid";

export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

const slugId = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 6);
const token = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 24);
const rowId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 16);

export type EventRow = {
  id: string;
  slug: string;
  name: string;
  event_date: string | null;
  host_email: string;
  admin_token: string;
  status: "pending" | "active";
  gallery_public: number;
  stripe_session_id: string | null;
  created_at: string;
};

export type PhotoRow = {
  id: string;
  event_id: string;
  stored_name: string;
  thumb_name: string | null;
  original_name: string;
  uploader_name: string | null;
  caption: string | null;
  mime: string;
  size: number;
  created_at: string;
};

function open(): Database.Database {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(path.join(DATA_DIR, "guestsnap.db"));
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      event_date TEXT,
      host_email TEXT NOT NULL,
      admin_token TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      gallery_public INTEGER NOT NULL DEFAULT 1,
      stripe_session_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id),
      stored_name TEXT NOT NULL,
      thumb_name TEXT,
      original_name TEXT NOT NULL,
      uploader_name TEXT,
      caption TEXT,
      mime TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_photos_event ON photos(event_id, created_at);
  `);
  return db;
}

// Reuse the connection across Next.js dev-server hot reloads.
const globalForDb = globalThis as unknown as { __gsdb?: Database.Database };
export const db = globalForDb.__gsdb ?? (globalForDb.__gsdb = open());

export function createEvent(input: {
  name: string;
  eventDate: string | null;
  hostEmail: string;
  status: "pending" | "active";
}): EventRow {
  const event: Omit<EventRow, "created_at"> = {
    id: rowId(),
    slug: slugId(),
    name: input.name,
    event_date: input.eventDate,
    host_email: input.hostEmail,
    admin_token: token(),
    status: input.status,
    gallery_public: 1,
    stripe_session_id: null,
  };
  db.prepare(
    `INSERT INTO events (id, slug, name, event_date, host_email, admin_token, status, gallery_public, stripe_session_id)
     VALUES (@id, @slug, @name, @event_date, @host_email, @admin_token, @status, @gallery_public, @stripe_session_id)`
  ).run(event);
  return getEventById(event.id)!;
}

export function getEventById(id: string): EventRow | undefined {
  return db.prepare("SELECT * FROM events WHERE id = ?").get(id) as EventRow | undefined;
}

export function getEventBySlug(slug: string): EventRow | undefined {
  return db.prepare("SELECT * FROM events WHERE slug = ?").get(slug) as EventRow | undefined;
}

export function getEventByAdminToken(adminToken: string): EventRow | undefined {
  return db.prepare("SELECT * FROM events WHERE admin_token = ?").get(adminToken) as EventRow | undefined;
}

export function getEventByStripeSession(sessionId: string): EventRow | undefined {
  return db.prepare("SELECT * FROM events WHERE stripe_session_id = ?").get(sessionId) as EventRow | undefined;
}

export function setStripeSession(eventId: string, sessionId: string) {
  db.prepare("UPDATE events SET stripe_session_id = ? WHERE id = ?").run(sessionId, eventId);
}

export function activateEvent(eventId: string) {
  db.prepare("UPDATE events SET status = 'active' WHERE id = ?").run(eventId);
}

export function setGalleryPublic(eventId: string, isPublic: boolean) {
  db.prepare("UPDATE events SET gallery_public = ? WHERE id = ?").run(isPublic ? 1 : 0, eventId);
}

export function insertPhoto(input: {
  eventId: string;
  storedName: string;
  thumbName: string | null;
  originalName: string;
  uploaderName: string | null;
  caption: string | null;
  mime: string;
  size: number;
}): PhotoRow {
  const id = rowId();
  db.prepare(
    `INSERT INTO photos (id, event_id, stored_name, thumb_name, original_name, uploader_name, caption, mime, size)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, input.eventId, input.storedName, input.thumbName, input.originalName, input.uploaderName, input.caption, input.mime, input.size);
  return getPhotoById(id)!;
}

export function getPhotoById(id: string): PhotoRow | undefined {
  return db.prepare("SELECT * FROM photos WHERE id = ?").get(id) as PhotoRow | undefined;
}

export function listPhotos(eventId: string): PhotoRow[] {
  return db
    .prepare("SELECT * FROM photos WHERE event_id = ? ORDER BY created_at DESC, id DESC")
    .all(eventId) as PhotoRow[];
}

export function countPhotos(eventId: string): number {
  const row = db.prepare("SELECT COUNT(*) AS n FROM photos WHERE event_id = ?").get(eventId) as { n: number };
  return row.n;
}

export function deletePhoto(id: string) {
  db.prepare("DELETE FROM photos WHERE id = ?").run(id);
}
