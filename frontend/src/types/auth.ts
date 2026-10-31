export enum UserRole {
  ADMIN = "ADMIN",
  WORKER = "WORKER",
  STUDENT = "STUDENT",
}

export interface LoginUserRequestDto {
  email: string;
  password: string;
}

export interface LoginUserResponseDto {
  message?: string | null;
  email?: string | null;
  token?: string | null;
}

export interface RegisterUserRequestDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  phone?: string;
  studentNumber?: string;
  department?: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface RegisterUserResponseDto {
  message?: string | null;
}
