import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { deleteFile } from "./storage";

export interface Material {
  id: string;
  title: string;
  subject: string;
  description: string;
  fileUrl: string;
  fileType: "pdf" | "doc";
  uploadedAt: Timestamp;
  // Extended fields
  form?: string;          // "Form 1" | "Form 2" | ... | "Form 5"
  category?: string;      // "Notes" | "Exercises" | "Past Year" | etc.
  fileSize?: number;      // bytes
  fileName?: string;      // sanitized display name
  storagePath?: string;   // Supabase storage path for deletion (e.g. "Form 4/Tamil Grammar/Notes/file.pdf")
}

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  category?: string;
  eventType?: "நிகழ்வு" | "போட்டி";
  location?: string;
  time?: string;
  eventDate: Timestamp;
  competitionDate?: Timestamp;
  photoUrls: string[];
  createdAt: Timestamp;
}

export type Competition = SchoolEvent;

export interface TeacherProfile {
  name: string;
  subject: string;
  bio: string;
  photoUrl: string;
}

export interface Photo {
  id: string;
  title: string;
  description?: string;
  url: string;
  storagePath: string;
  driveUrl?: string;
  uploadedAt: Timestamp;
}

export type EventAlbum = Photo;

// ── Materials ──────────────────────────────────────────────────────────────

export async function getMaterials(): Promise<Material[]> {
  const q = query(collection(db, "materials"), orderBy("uploadedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Material));
}

export async function getLatestMaterials(n = 3): Promise<Material[]> {
  const q = query(collection(db, "materials"), orderBy("uploadedAt", "desc"), limit(n));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Material));
}

/** Find an existing material with the same SHA-256 hash (duplicate detection). */
export async function findMaterialByHash(hash: string): Promise<Material | null> {
  const q = query(collection(db, "materials"), where("fileHash", "==", hash), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Material;
}

export async function addMaterial(data: Omit<Material, "id" | "uploadedAt">) {
  return addDoc(collection(db, "materials"), { ...data, uploadedAt: serverTimestamp() });
}

export async function updateMaterial(id: string, data: Partial<Omit<Material, "id">>) {
  return updateDoc(doc(db, "materials", id), data);
}

export async function deleteMaterial(id: string) {
  return deleteDoc(doc(db, "materials", id));
}

// ── Events / நிகழ்வுகள் & போட்டிகள் ──────────────────────────────────────────

export async function getEvents(): Promise<SchoolEvent[]> {
  try {
    // 1. Fetch from 'competitions' collection
    const compQuery = query(collection(db, "competitions"), orderBy("createdAt", "desc"));
    const compSnap = await getDocs(compQuery).catch(() => ({ docs: [] } as any));

    // 2. Fetch from 'events' collection if any
    const eventsQuery = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const eventsSnap = await getDocs(eventsQuery).catch(() => ({ docs: [] } as any));

    const combinedDocs = [...compSnap.docs, ...eventsSnap.docs];
    const eventMap = new Map<string, SchoolEvent>();

    for (const d of combinedDocs) {
      if (eventMap.has(d.id)) continue;
      const data = d.data();

      // Strictly exclude gallery photo albums (identified by driveUrl, isStandalonePhoto, or contentType)
      const isPhotoAlbum =
        data.isStandalonePhoto === true ||
        data.contentType === "gallery_album" ||
        Boolean(data.driveUrl) ||
        Boolean(data.google_drive_url) ||
        Boolean(data.googleDriveUrl);

      if (isPhotoAlbum) continue;

      const dateField = data.eventDate || data.competitionDate || data.createdAt;
      const resolvedType: "நிகழ்வு" | "போட்டி" =
        data.eventType === "போட்டி" || data.category === "போட்டி" || data.type === "competition"
          ? "போட்டி"
          : "நிகழ்வு";

      eventMap.set(d.id, {
        id: d.id,
        title: data.title || "",
        description: data.description || data.aiDescription || "",
        category: data.category || resolvedType,
        eventType: resolvedType,
        location: data.location || data.venue || "",
        time: data.time || "",
        eventDate: dateField,
        competitionDate: dateField,
        photoUrls: data.photoUrls || (data.coverUrl ? [data.coverUrl] : data.url ? [data.url] : []),
        createdAt: data.createdAt,
      } as SchoolEvent);
    }

    const rawEvents = Array.from(eventMap.values());
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const getEventTime = (e: SchoolEvent) => {
      if (e.eventDate?.toDate) return e.eventDate.toDate().getTime();
      if (e.eventDate?.seconds) return e.eventDate.seconds * 1000;
      if (e.eventDate) return new Date(e.eventDate as any).getTime();
      return 0;
    };

    const upcoming = rawEvents
      .filter((e) => getEventTime(e) >= startOfToday)
      .sort((a, b) => getEventTime(a) - getEventTime(b));

    const past = rawEvents
      .filter((e) => getEventTime(e) < startOfToday)
      .sort((a, b) => getEventTime(b) - getEventTime(a));

    return [...upcoming, ...past];
  } catch (err) {
    console.error("[getEvents Error]", err);
    return [];
  }
}

export const getCompetitions = getEvents;

export async function getLatestEvents(n = 2): Promise<SchoolEvent[]> {
  const events = await getEvents();
  return events.slice(0, n);
}

export const getLatestCompetitions = getLatestEvents;

export async function addEvent(data: {
  title: string;
  description: string;
  location?: string;
  time?: string;
  category?: string;
  eventType?: "நிகழ்வு" | "போட்டி";
  eventDate: Timestamp;
  photoUrls?: string[];
}) {
  const evtType = data.eventType || (data.category === "போட்டி" ? "போட்டி" : "நிகழ்வு");
  const payload = {
    title: data.title.trim(),
    description: (data.description || "").trim(),
    location: (data.location || "").trim(),
    venue: (data.location || "").trim(),
    time: (data.time || "").trim(),
    category: evtType,
    eventType: evtType,
    type: evtType === "போட்டி" ? "competition" : "event",
    contentType: evtType === "போட்டி" ? "competition" : "event",
    isStandalonePhoto: false,
    eventDate: data.eventDate,
    competitionDate: data.eventDate,
    photoUrls: data.photoUrls || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(collection(db, "competitions"), payload);
}

export const addCompetition = addEvent as any;

export async function updateEvent(id: string, data: Partial<SchoolEvent>) {
  const payload: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  if (data.eventDate && !data.competitionDate) {
    payload.competitionDate = data.eventDate;
  }
  if (data.eventType) {
    payload.eventType = data.eventType;
    payload.category = data.eventType;
    payload.type = data.eventType === "போட்டி" ? "competition" : "event";
    payload.contentType = data.eventType === "போட்டி" ? "competition" : "event";
  }

  try {
    const compDoc = doc(db, "competitions", id);
    const snap = await getDoc(compDoc);
    if (snap.exists()) {
      return await updateDoc(compDoc, payload);
    }
  } catch {}

  try {
    const eventDoc = doc(db, "events", id);
    const snap = await getDoc(eventDoc);
    if (snap.exists()) {
      return await updateDoc(eventDoc, payload);
    }
  } catch {}

  return updateDoc(doc(db, "competitions", id), payload);
}

export const updateCompetition = updateEvent as any;

export async function deleteEvent(id: string) {
  try {
    const compRef = doc(db, "competitions", id);
    const snap = await getDoc(compRef);
    if (snap.exists()) {
      const data = snap.data() as any;
      const photoUrls = data.photoUrls || (data.coverUrl ? [data.coverUrl] : data.url ? [data.url] : []);
      for (const url of photoUrls) {
        if (url) await deleteFile(url).catch(() => {});
      }
      return await deleteDoc(compRef);
    }
  } catch {}

  try {
    const eventDoc = doc(db, "events", id);
    const snap = await getDoc(eventDoc);
    if (snap.exists()) {
      const data = snap.data() as any;
      const photoUrls = data.photoUrls || (data.coverUrl ? [data.coverUrl] : data.url ? [data.url] : []);
      for (const url of photoUrls) {
        if (url) await deleteFile(url).catch(() => {});
      }
      return await deleteDoc(eventDoc);
    }
  } catch {}
}

export const deleteCompetition = deleteEvent;

// ── Teacher Profile ────────────────────────────────────────────────────────

export async function getTeacherProfile(): Promise<TeacherProfile | null> {
  const snap = await getDoc(doc(db, "teacherProfile", "main"));
  if (!snap.exists()) return null;
  return snap.data() as TeacherProfile;
}

export async function upsertTeacherProfile(data: TeacherProfile) {
  return updateDoc(doc(db, "teacherProfile", "main"), data as never).catch(() =>
    addDoc(collection(db, "teacherProfile"), { ...data } as never)
  );
}

// ── Photo Albums / புகைப்படங்கள் ──────────────────────────────────────────────

export async function getPhotos(): Promise<Photo[]> {
  try {
    const compQuery = query(collection(db, "competitions"), orderBy("createdAt", "desc"));
    const compSnap = await getDocs(compQuery).catch(() => ({ docs: [] } as any));

    const galleryQuery = query(collection(db, "gallery_albums"), orderBy("createdAt", "desc"));
    const gallerySnap = await getDocs(galleryQuery).catch(() => ({ docs: [] } as any));

    const photosQuery = query(collection(db, "photos"), orderBy("createdAt", "desc"));
    const photosSnap = await getDocs(photosQuery).catch(() => ({ docs: [] } as any));

    const combinedDocs = [...compSnap.docs, ...gallerySnap.docs, ...photosSnap.docs];
    const albumMap = new Map<string, Photo>();

    for (const d of combinedDocs) {
      if (albumMap.has(d.id)) continue;
      const c = d.data();

      // Strictly include only genuine photo albums
      const isPhotoAlbum =
        c.isStandalonePhoto === true ||
        c.contentType === "gallery_album" ||
        Boolean(c.driveUrl) ||
        Boolean(c.google_drive_url) ||
        Boolean(c.googleDriveUrl);

      if (!isPhotoAlbum) continue;

      albumMap.set(d.id, {
        id: d.id,
        title: c.title || "",
        description: c.description || "",
        url: c.url || c.cover_image_url || c.coverUrl || (c.photoUrls && c.photoUrls[0]) || "",
        storagePath: c.storagePath || "",
        driveUrl: c.driveUrl || c.google_drive_url || c.googleDriveUrl || "",
        uploadedAt: c.createdAt || c.uploadedAt,
      } as Photo);
    }

    return Array.from(albumMap.values());
  } catch (err) {
    console.error("[getPhotos Error]", err);
    return [];
  }
}

export const getAlbums = getPhotos;

export async function addPhoto(data: Omit<Photo, "id" | "uploadedAt">) {
  const payload = {
    title: data.title.trim(),
    description: (data.description || "").trim(),
    url: data.url,
    cover_image_url: data.url,
    coverUrl: data.url,
    storagePath: data.storagePath,
    driveUrl: data.driveUrl || "",
    google_drive_url: data.driveUrl || "",
    googleDriveUrl: data.driveUrl || "",
    isStandalonePhoto: true,
    contentType: "gallery_album",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(collection(db, "competitions"), payload);
}

export const addAlbum = addPhoto;

export async function updatePhoto(id: string, data: Partial<Omit<Photo, "id">>) {
  const payload: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  if (data.driveUrl) {
    payload.google_drive_url = data.driveUrl;
    payload.googleDriveUrl = data.driveUrl;
    payload.driveUrl = data.driveUrl;
  }
  if (data.url) {
    payload.cover_image_url = data.url;
    payload.coverUrl = data.url;
    payload.url = data.url;
  }

  try {
    const compDoc = doc(db, "competitions", id);
    const snap = await getDoc(compDoc);
    if (snap.exists()) {
      return await updateDoc(compDoc, payload);
    }
  } catch {}

  try {
    const galleryDoc = doc(db, "gallery_albums", id);
    const snap = await getDoc(galleryDoc);
    if (snap.exists()) {
      return await updateDoc(galleryDoc, payload);
    }
  } catch {}

  try {
    const photoDoc = doc(db, "photos", id);
    const snap = await getDoc(photoDoc);
    if (snap.exists()) {
      return await updateDoc(photoDoc, payload);
    }
  } catch {}

  return updateDoc(doc(db, "competitions", id), payload as never);
}

export const updateAlbum = updatePhoto;

export async function deletePhoto(id: string) {
  try {
    const photoRef = doc(db, "competitions", id);
    const snap = await getDoc(photoRef);
    if (snap.exists()) {
      const data = snap.data() as any;
      if (data.url || data.cover_image_url || data.storagePath) {
        await deleteFile(data.storagePath || data.url || data.cover_image_url).catch(() => {});
      }
      return await deleteDoc(photoRef);
    }
  } catch {}

  try {
    const galleryDoc = doc(db, "gallery_albums", id);
    const snap = await getDoc(galleryDoc);
    if (snap.exists()) {
      const data = snap.data() as any;
      if (data.url || data.storagePath) {
        await deleteFile(data.storagePath || data.url).catch(() => {});
      }
      return await deleteDoc(galleryDoc);
    }
  } catch {}

  try {
    const photoDoc = doc(db, "photos", id);
    const snap = await getDoc(photoDoc);
    if (snap.exists()) {
      const data = snap.data() as any;
      if (data.url || data.storagePath) {
        await deleteFile(data.storagePath || data.url).catch(() => {});
      }
      return await deleteDoc(photoDoc);
    }
  } catch {}
}

export const deleteAlbum = deletePhoto;


