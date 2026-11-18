"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { UserFormDialog } from "@/components/admin/admin-user-form-dialog";
import { UsersTable } from "@/components/admin/admin-users-table";
import {
  USER_ROLE_OPTIONS,
  isUserRole,
} from "@/components/admin/admin-user-options";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUsers, searchUsers } from "@/lib/api/api-admin-users";
import { UserRole } from "@/types/auth";
import type { UserProfileResponseDto } from "@/types/profile";
import type { PageMeta } from "@/types/page";

interface UserFilters {
  firstName: string;
  lastName: string;
  email: string;
  userRole: UserRole | null;
  studentNumber: string;
  department: string;
  from: string;
  to: string;
}

const EMPTY_FILTERS: UserFilters = {
  firstName: "",
  lastName: "",
  email: "",
  userRole: null,
  studentNumber: "",
  department: "",
  from: "",
  to: "",
};

function hasActiveFilters(filters: UserFilters): boolean {
  return (
    filters.firstName !== "" ||
    filters.lastName !== "" ||
    filters.email !== "" ||
    filters.userRole !== null ||
    filters.studentNumber !== "" ||
    filters.department !== "" ||
    filters.from !== "" ||
    filters.to !== ""
  );
}

export function UsersPageClient() {
  const [users, setUsers] = useState<UserProfileResponseDto[]>([]);
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<UserFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<UserFilters>(EMPTY_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(
    async (targetPage: number, activeFilters: UserFilters) => {
      try {
        const result = hasActiveFilters(activeFilters)
          ? await searchUsers({
              firstName: activeFilters.firstName || undefined,
              lastName: activeFilters.lastName || undefined,
              email: activeFilters.email || undefined,
              userRole: activeFilters.userRole ?? undefined,
              studentNumber: activeFilters.studentNumber || undefined,
              department: activeFilters.department || undefined,
              from: activeFilters.from || undefined,
              to: activeFilters.to || undefined,
              page: targetPage,
            })
          : await getUsers({ page: targetPage });

        setUsers(result.content);
        setPageMeta(result.page);
        setPage(targetPage);
        setError(null);
      } catch (cause: unknown) {
        setError(
          cause instanceof Error ? cause.message : "Failed to load users."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let ignore = false;

    getUsers({ page: 1 })
      .then((result) => {
        if (ignore) {
          return;
        }

        setUsers(result.content);
        setPageMeta(result.page);
        setPage(1);
        setIsLoading(false);
      })
      .catch((cause: unknown) => {
        if (ignore) {
          return;
        }

        setError(
          cause instanceof Error ? cause.message : "Failed to load users."
        );
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  function refresh(targetPage: number, activeFilters: UserFilters) {
    setIsLoading(true);
    setError(null);
    void loadUsers(targetPage, activeFilters);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(filters);
    refresh(1, filters);
  }

  function handleClear() {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    refresh(1, EMPTY_FILTERS);
  }

  function handlePrevious() {
    refresh(page - 1, appliedFilters);
  }

  function handleNext() {
    refresh(page + 1, appliedFilters);
  }

  function handleReload() {
    refresh(page, appliedFilters);
  }

  function handleDeleted() {
    const targetPage = users.length === 1 && page > 1 ? page - 1 : page;
    refresh(targetPage, appliedFilters);
  }

  const totalPages = pageMeta ? Math.max(pageMeta.totalPages, 1) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-semibold">Users</h1>
        <p className="text-muted-foreground">
          Create, update, and remove user accounts.
        </p>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <form
          onSubmit={handleSearch}
          noValidate
          className="flex flex-1 flex-col gap-3"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Field>
              <FieldLabel htmlFor="user-filter-first-name">
                First name
              </FieldLabel>
              <Input
                id="user-filter-first-name"
                name="firstName"
                value={filters.firstName}
                maxLength={100}
                onChange={(event) =>
                  setFilters({ ...filters, firstName: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-filter-last-name">Last name</FieldLabel>
              <Input
                id="user-filter-last-name"
                name="lastName"
                value={filters.lastName}
                maxLength={100}
                onChange={(event) =>
                  setFilters({ ...filters, lastName: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-filter-email">Email</FieldLabel>
              <Input
                id="user-filter-email"
                name="email"
                type="email"
                value={filters.email}
                maxLength={100}
                onChange={(event) =>
                  setFilters({ ...filters, email: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel>Role</FieldLabel>
              <Select
                className="w-full"
                selectedKey={filters.userRole ?? 0}
                onSelectionChange={(key) => {
                  if (key === 0) {
                    setFilters({ ...filters, userRole: null });
                  } else if (
                    typeof key === "string" &&
                    isUserRole(key)
                  ) {
                    setFilters({ ...filters, userRole: key });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem id={0}>Any role</SelectItem>
                  {USER_ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="user-filter-student-number">
                Student number
              </FieldLabel>
              <Input
                id="user-filter-student-number"
                name="studentNumber"
                value={filters.studentNumber}
                maxLength={50}
                onChange={(event) =>
                  setFilters({ ...filters, studentNumber: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-filter-department">
                Department
              </FieldLabel>
              <Input
                id="user-filter-department"
                name="department"
                value={filters.department}
                maxLength={100}
                onChange={(event) =>
                  setFilters({ ...filters, department: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-filter-from">Created from</FieldLabel>
              <Input
                id="user-filter-from"
                name="from"
                type="date"
                value={filters.from}
                onChange={(event) =>
                  setFilters({ ...filters, from: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-filter-to">Created to</FieldLabel>
              <Input
                id="user-filter-to"
                name="to"
                type="date"
                value={filters.to}
                onChange={(event) =>
                  setFilters({ ...filters, to: event.target.value })
                }
              />
            </Field>
          </div>
          <div className="flex gap-2">
            <Button type="submit" isDisabled={isLoading}>
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onPress={handleClear}
              isDisabled={isLoading}
            >
              Clear
            </Button>
          </div>
        </form>
        <UserFormDialog
          onSaved={handleReload}
          trigger={<Button>New user</Button>}
        />
      </div>

      <Card>
        <CardContent>
          {isLoading && (
            <p className="py-10 text-center text-muted-foreground">
              Loading users...
            </p>
          )}

          {!isLoading && error && (
            <div className="flex flex-col gap-3 py-6">
              <Alert variant="destructive">
                <AlertTitle>Unable to load users</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div>
                <Button
                  variant="outline"
                  onPress={() => refresh(page, appliedFilters)}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <UsersTable
              users={users}
              onReload={handleReload}
              onDeleted={handleDeleted}
            />
          )}
        </CardContent>

        {!isLoading && !error && (
          <CardFooter className="flex-col gap-3 border-t sm:flex-row sm:justify-between">
            <p className="text-muted-foreground">
              {pageMeta ? `${pageMeta.totalElements} users` : ""}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <Button
                variant="outline"
                size="sm"
                isDisabled={page <= 1}
                onPress={handlePrevious}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                isDisabled={page >= totalPages}
                onPress={handleNext}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
