export interface User {
  id: string;
  fullName: string;
  email: string;
  isVerified: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}
