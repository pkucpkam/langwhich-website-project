export interface User {
  id: number;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string>;
  timestamp: string;
}
