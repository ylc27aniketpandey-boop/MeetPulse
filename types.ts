export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  participants: string[];
  tags: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  summary?: string;
  actionItems?: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export enum ViewState {
  LANDING,
  LOGIN,
  SIGNUP,
  DASHBOARD
}
