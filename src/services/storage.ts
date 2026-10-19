import { PresetKit, SoundPadData, UserProfile } from '../types';
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'pulse-pad-assets';
const DB_VERSION = 1;
const STORE_NAME = 'user-samples';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function saveCustomSample(padId: string, audioBlob: Blob): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORE_NAME, audioBlob, padId);
  } catch (err) {
    console.warn('Failed to save custom sample to IndexedDB:', err);
  }
}

export async function getCustomSample(padId: string): Promise<Blob | null> {
  try {
    const db = await getDb();
    const result = await db.get(STORE_NAME, padId);
    return result || null;
  } catch (err) {
    console.warn('Failed to get custom sample from IndexedDB:', err);
    return null;
  }
}

export async function deleteCustomSample(padId: string): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(STORE_NAME, padId);
  } catch (err) {
    console.warn('Failed to delete custom sample from IndexedDB:', err);
  }
}

const STORAGE_KEYS = {
  CURRENT_KIT: 'pulsepad_current_kit',
  USER_PROFILE: 'pulsepad_user_profile',
  CUSTOM_KITS: 'pulsepad_custom_kits',
  APP_SETTINGS: 'pulsepad_app_settings',
};

export const defaultUser: UserProfile = {
  id: 'user_pro_sound',
  username: 'soundmaster',
  displayName: 'DJ Sound Pulse',
  avatarSeed: 'Pulse99',
  isLoggedIn: true,
  savedKitsCount: 4,
  lastSyncTimestamp: Date.now() - 3600000,
};

export function saveCurrentKit(kit: PresetKit) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_KIT, JSON.stringify(kit));
  } catch (err) {
    console.warn('Failed to save current kit to localStorage:', err);
  }
}

export function loadSavedKit(): PresetKit | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_KIT);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.warn('Failed to load saved kit:', err);
  }
  return null;
}

export function saveUserProfile(user: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
  } catch (err) {
    console.warn('Failed to save user profile:', err);
  }
}

export function loadUserProfile(): UserProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (data) return JSON.parse(data);
  } catch {
    // fallback
  }
  return defaultUser;
}

export function saveCustomKitToLibrary(kit: PresetKit): PresetKit[] {
  try {
    const existing = loadCustomKits();
    const updated = [kit, ...existing.filter((k) => k.id !== kit.id)];
    localStorage.setItem(STORAGE_KEYS.CUSTOM_KITS, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save custom kit:', err);
    return [];
  }
}

export function loadCustomKits(): PresetKit[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_KITS);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.warn('Failed to load custom kits:', err);
  }
  return [];
}

// Generate shareable JSON export or cloud payload
export function exportKitToJson(kit: PresetKit): string {
  return JSON.stringify(kit, null, 2);
}

// Import JSON kit payload
export function importKitFromJson(jsonStr: string): PresetKit | null {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.pads && Array.isArray(parsed.pads)) {
      return {
        ...parsed,
        id: `kit-imported-${Date.now()}`,
        name: parsed.name ? `${parsed.name} (Imported)` : 'Imported Kit',
      };
    }
  } catch (err) {
    console.error('Invalid kit JSON file:', err);
  }
  return null;
}
