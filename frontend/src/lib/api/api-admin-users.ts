import { apiClient } from "./api-client";
import type { PageResponse } from "@/types/page";
import type { UserProfileResponseDto } from "@/types/profile";
import type {
  CreateUserRequestDto,
  SearchUserParams,
  UpdateUserRequestDto,
} from "@/types/user";

export type {
  CreateUserRequestDto,
  SearchUserParams,
  UpdateUserRequestDto,
  UserProfileResponseDto,
};
export { UserRole } from "@/types/auth";

const DEFAULT_PAGE_SIZE = 10;

export interface PageParams {
  page?: number;
  size?: number;
}

type QueryValue = string | number | undefined;

function buildQuery(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") {
      continue;
    }
    search.set(key, String(value));
  }

  const query = search.toString();
  return query.length > 0 ? `?${query}` : "";
}

export async function getUsers(
  params: PageParams = {}
): Promise<PageResponse<UserProfileResponseDto>> {
  const { page = 1, size = DEFAULT_PAGE_SIZE } = params;
  return apiClient.get<PageResponse<UserProfileResponseDto>>(
    `/api/users${buildQuery({ page, size })}`
  );
}

export async function getUser(id: number): Promise<UserProfileResponseDto> {
  return apiClient.get<UserProfileResponseDto>(`/api/users/${id}`);
}

export async function searchUsers(
  params: SearchUserParams & PageParams = {}
): Promise<PageResponse<UserProfileResponseDto>> {
  const {
    firstName,
    lastName,
    email,
    userRole,
    studentNumber,
    department,
    from,
    to,
    page = 1,
    size = DEFAULT_PAGE_SIZE,
  } = params;
  return apiClient.get<PageResponse<UserProfileResponseDto>>(
    `/api/users/search${buildQuery({
      firstName,
      lastName,
      email,
      userRole,
      studentNumber,
      department,
      from,
      to,
      page,
      size,
    })}`
  );
}

export async function createUser(
  data: CreateUserRequestDto
): Promise<UserProfileResponseDto> {
  return apiClient.post<UserProfileResponseDto>("/api/users", data);
}

export async function updateUser(
  id: number,
  data: UpdateUserRequestDto
): Promise<UserProfileResponseDto> {
  return apiClient.patch<UserProfileResponseDto>(`/api/users/${id}`, data);
}

export async function deleteUser(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/users/${id}`);
}

export const adminUsersApi = {
  getUsers,
  getUser,
  searchUsers,
  createUser,
  updateUser,
  deleteUser,
};

export default adminUsersApi;

// Usage:
// const users = await adminUsersApi.getUsers({ page: 1 });
// const user = await adminUsersApi.getUser(1);
// const found = await adminUsersApi.searchUsers({ userRole: UserRole.WORKER, department: "IT" });
// const created = await adminUsersApi.createUser({ firstName: "Jane", lastName: "Doe", email: "jane@example.com", password: "secretPassword", userRole: UserRole.WORKER });
// const updated = await adminUsersApi.updateUser(1, { userRole: UserRole.ADMIN, available: true });
// await adminUsersApi.deleteUser(1);
