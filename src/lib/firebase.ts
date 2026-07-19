import { storage, UserProfile } from "../services/storageService";

// Mock implementation of Firestore errors for compatibility
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: any, type: OperationType, path: string) {
  console.error(`Local Storage Error [${type}] at ${path}:`, error);
}

// Mock auth state helper
export const getLocalUser = (): UserProfile | null => {
  const data = sessionStorage.getItem("teachease_session");
  return data ? JSON.parse(data) : null;
};

export const setLocalSession = (user: UserProfile) => {
  sessionStorage.setItem("teachease_session", JSON.stringify(user));
};

export const clearLocalSession = () => {
  sessionStorage.removeItem("teachease_session");
};

// Compatibility exports
export const db = {};
export const auth = {
  currentUser: getLocalUser()
};

export const loginWithGoogle = () => {
  console.log("Google Login disabled. Use local form.");
};

export const logout = () => {
  clearLocalSession();
  window.location.reload();
};
