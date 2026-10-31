import { UserRole } from "./auth";

export interface ProfileDto {
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  phone: string | null;
  studentNumber: string | null;
  department: string | null;
  avatarPath: string | null;
  createdAt: string;
}

export interface UpdateUserProfileRequestDto {
  email?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  phone?: string;
  studentNumber?: string;
  department?: string;
}

export interface UpdateUserPasswordRequestDto {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}

export interface UserProfileResponseDto {
  id: number;
  email: string;
  userRole: UserRole;
  createdAt: string;
  profile: ProfileDto | null;
}
