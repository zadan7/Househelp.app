import { storage } from '../pages/firebase';

// Uploads a local image (file:// URI from expo-image-picker) to Firebase Storage
// and returns its download URL. Throws on failure so the caller can stop and tell the user.
export async function uploadPhoto(uri, path) {
  if (!uri) throw new Error('No image selected');
  const ref = storage.ref(path);
  try {
    await ref.putFile(uri);
  } catch (e) {
    // Some devices need the bare path instead of the file:// URI.
    await ref.putFile(uri.replace('file://', ''));
  }
  return ref.getDownloadURL();
}

// Makes an email safe to use inside a storage path.
export const safeKey = (email) => String(email).toLowerCase().replace(/[^a-z0-9]/g, '_');
