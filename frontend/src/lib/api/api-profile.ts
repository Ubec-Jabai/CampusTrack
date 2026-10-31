import { apiClient } from "./api-client";
import type {
  UpdateUserPasswordRequestDto,
  UpdateUserProfileRequestDto,
  UserProfileResponseDto,
} from "@/types/profile";

export type {
  UpdateUserPasswordRequestDto,
  UpdateUserProfileRequestDto,
  UserProfileResponseDto,
};

export async function getProfile(): Promise<UserProfileResponseDto> {
  return apiClient.get<UserProfileResponseDto>("/api/profile/me");
}

export async function updateProfile(
  data: UpdateUserProfileRequestDto
): Promise<UserProfileResponseDto> {
  return apiClient.patch<UserProfileResponseDto>("/api/profile/me", data);
}

export async function changePassword(
  data: UpdateUserPasswordRequestDto
): Promise<UserProfileResponseDto> {
  return apiClient.patch<UserProfileResponseDto>(
    "/api/profile/me/change-password",
    data
  );
}

export async function deleteAccount(): Promise<void> {
  return apiClient.delete<void>("/api/profile/me");
}

export const profileApi = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};

export default profileApi;

// Usage:
// const profile = await profileApi.getProfile();
// const updated = await profileApi.updateProfile({ firstName: "Jane", lastName: "Doe", email: "jane@example.com" });
// await profileApi.changePassword({ currentPassword: "oldPass", password: "newPassword123", passwordConfirmation: "newPassword123" });
// await profileApi.deleteAccount();
