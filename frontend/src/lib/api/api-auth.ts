import { apiClient } from "./api-client";
import { UserRole } from "@/types/auth";
import type {
  LoginUserRequestDto,
  LoginUserResponseDto,
  RegisterUserRequestDto,
  RegisterUserResponseDto,
} from "@/types/auth";

export type {
  LoginUserRequestDto,
  LoginUserResponseDto,
  RegisterUserRequestDto,
  RegisterUserResponseDto,
};
export { UserRole };

export interface LoginOptions {
  rememberMe?: boolean;
}

export async function register(
  data: RegisterUserRequestDto
): Promise<RegisterUserResponseDto> {
  return apiClient.post<RegisterUserResponseDto>("/api/auth/register", data);
}

export async function login(
  credentials: LoginUserRequestDto,
  options?: LoginOptions
): Promise<LoginUserResponseDto> {
  const response = await apiClient.post<LoginUserResponseDto>("/api/auth/login", credentials);

  if (response.token && typeof window !== "undefined") {
    if (options?.rememberMe === false) {
      sessionStorage.setItem("token", response.token);
      localStorage.removeItem("token");
    } else {
      localStorage.setItem("token", response.token);
      sessionStorage.removeItem("token");
    }
  }

  return response;
}

export async function logout(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  }
}

export const authApi = {
  login,
  logout,
  register,
};

export default authApi;

// Usage:
// const res = await authApi.login({ email: "user@example.com", password: "secret" });
// await authApi.register({ firstName: "Jane", lastName: "Doe", email: "jane@example.com", password: "secretPassword", passwordConfirmation: "secretPassword" });
// await authApi.logout();
