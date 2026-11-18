import { UserRole } from "./auth";

export interface CreateUserRequestDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  phone?: string;
  studentNumber?: string;
  department?: string;
  email: string;
  password: string;
  userRole: UserRole;
}

export interface UpdateUserRequestDto {
  userRole?: UserRole;
  password?: string;
  available?: boolean;
  lastAssignedAt?: string;
}

export interface SearchUserParams {
  firstName?: string;
  lastName?: string;
  email?: string;
  userRole?: UserRole;
  studentNumber?: string;
  department?: string;
  from?: string;
  to?: string;
}
