export type UserRole = "CUSTOMER" | "ADMIN" | "WAREHOUSE" | "PRODUCTION";
export type AccountStatus = "ACTIVE" | "INACTIVE";

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  fullName: string;
  phone: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
