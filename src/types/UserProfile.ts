export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  gender?: string | null;
  goal?: string | null;
  createdAt?: any; // Firestore timestamp
  lastLogin?: any; // Firestore timestamp
}