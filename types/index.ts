export interface Photo {
  id: string;
  imageUrl: string;
  caption: string;
  date: string;
  fileName: string;
  userId: string | null;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
} 