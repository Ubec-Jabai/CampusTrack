"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { USER_ROLE_OPTIONS, isUserRole } from "@/components/admin/admin-user-options";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser, updateUser } from "@/lib/api/api-admin-users";
import { UserRole } from "@/types/auth";
import type { UserProfileResponseDto } from "@/types/profile";
import type { UpdateUserRequestDto } from "@/types/user";

interface UserFormDialogProps {
  trigger: ReactNode;
  user?: UserProfileResponseDto;
  onSaved: () => void;
}

const AVAILABILITY_OPTIONS: { id: string; label: string }[] = [
  { id: "available", label: "Available" },
  { id: "unavailable", label: "Unavailable" },
];

function getAvailabilityLabel(available: boolean | null): string {
  if (available === null) {
    return "Not set";
  }
  return available ? "Available" : "Unavailable";
}

export function UserFormDialog({ trigger, user, onSaved }: UserFormDialogProps) {
  const firstNameId = useId();
  const middleNameId = useId();
  const lastNameId = useId();
  const suffixId = useId();
  const emailId = useId();
  const passwordId = useId();
  const phoneId = useId();
  const studentNumberId = useId();
  const departmentId = useId();
  const profile = user?.profile ?? null;
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [middleName, setMiddleName] = useState(profile?.middleName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [suffix, setSuffix] = useState(profile?.suffix ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<UserRole | null>(
    user?.userRole ?? null
  );
  const [available, setAvailable] = useState<boolean | null>(
    profile?.available ?? null
  );
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [studentNumber, setStudentNumber] = useState(
    profile?.studentNumber ?? ""
  );
  const [department, setDepartment] = useState(profile?.department ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = user !== undefined;
  const submitLabel = isSubmitting
    ? "Saving..."
    : isEditing
      ? "Save changes"
      : "Create user";

  function handleOpenChange(open: boolean): void {
    setIsOpen(open);

    if (open) {
      setFirstName(profile?.firstName ?? "");
      setMiddleName(profile?.middleName ?? "");
      setLastName(profile?.lastName ?? "");
      setSuffix(profile?.suffix ?? "");
      setEmail(user?.email ?? "");
      setPassword("");
      setUserRole(user?.userRole ?? null);
      setAvailable(profile?.available ?? null);
      setPhone(profile?.phone ?? "");
      setStudentNumber(profile?.studentNumber ?? "");
      setDepartment(profile?.department ?? "");
      setError(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isEditing) {
      const trimmedFirstName = firstName.trim();
      if (!trimmedFirstName) {
        setError("First name is required.");
        return;
      }

      const trimmedLastName = lastName.trim();
      if (!trimmedLastName) {
        setError("Last name is required.");
        return;
      }

      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        setError("Email is required.");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      if (!userRole) {
        setError("User role is required.");
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        await createUser({
          firstName: trimmedFirstName,
          middleName: middleName.trim() || undefined,
          lastName: trimmedLastName,
          suffix: suffix.trim() || undefined,
          phone: phone.trim() || undefined,
          studentNumber: studentNumber.trim() || undefined,
          department: department.trim() || undefined,
          email: trimmedEmail,
          password,
          userRole,
        });
        toast.success("User created.");
        setIsOpen(false);
        onSaved();
      } catch (cause: unknown) {
        setError(
          cause instanceof Error ? cause.message : "Failed to create user."
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!userRole) {
      setError("User role is required.");
      return;
    }

    if (password !== "" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: UpdateUserRequestDto = { userRole };
    if (password !== "") {
      payload.password = password;
    }
    if (available !== null) {
      payload.available = available;
    }

    try {
      await updateUser(user.id, payload);
      toast.success("User updated.");
      setIsOpen(false);
      onSaved();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : "Failed to update user."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      {trigger}
      <Dialog className="sm:max-w-lg" isDismissable={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit user" : "New user"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this user's role, availability, or password."
              : "Add a new user account to the campus."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup className="gap-5">
            {!isEditing && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor={firstNameId}>First name</FieldLabel>
                  <Input
                    id={firstNameId}
                    name="firstName"
                    value={firstName}
                    maxLength={100}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={middleNameId}>Middle name</FieldLabel>
                  <Input
                    id={middleNameId}
                    name="middleName"
                    value={middleName}
                    maxLength={100}
                    onChange={(event) => setMiddleName(event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={lastNameId}>Last name</FieldLabel>
                  <Input
                    id={lastNameId}
                    name="lastName"
                    value={lastName}
                    maxLength={100}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={suffixId}>Suffix</FieldLabel>
                  <Input
                    id={suffixId}
                    name="suffix"
                    value={suffix}
                    maxLength={20}
                    onChange={(event) => setSuffix(event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={phoneId}>Phone</FieldLabel>
                  <Input
                    id={phoneId}
                    name="phone"
                    value={phone}
                    maxLength={20}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={studentNumberId}>
                    Student number
                  </FieldLabel>
                  <Input
                    id={studentNumberId}
                    name="studentNumber"
                    value={studentNumber}
                    maxLength={50}
                    onChange={(event) => setStudentNumber(event.target.value)}
                  />
                </Field>
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor={departmentId}>Department</FieldLabel>
                  <Input
                    id={departmentId}
                    name="department"
                    value={department}
                    maxLength={100}
                    onChange={(event) => setDepartment(event.target.value)}
                  />
                </Field>
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor={emailId}>Email</FieldLabel>
                  <Input
                    id={emailId}
                    name="email"
                    type="email"
                    value={email}
                    maxLength={100}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </Field>
              </div>
            )}
            <Field>
              <FieldLabel>Role</FieldLabel>
              <Select
                className="w-full"
                selectedKey={userRole}
                onSelectionChange={(key) => {
                  if (typeof key === "string" && isUserRole(key)) {
                    setUserRole(key);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {isEditing && (
              <Field>
                <FieldLabel>Availability</FieldLabel>
                <Select
                  className="w-full"
                  selectedKey={
                    available === null
                      ? 0
                      : available
                        ? "available"
                        : "unavailable"
                  }
                  onSelectionChange={(key) => {
                    if (key === 0) {
                      setAvailable(null);
                    } else if (key === "available") {
                      setAvailable(true);
                    } else if (key === "unavailable") {
                      setAvailable(false);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem id={0}>Not set</SelectItem>
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <SelectItem key={option.id} id={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  {`Current availability: ${getAvailabilityLabel(
                    profile?.available ?? null
                  )}.`}
                </FieldDescription>
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor={passwordId}>
                {isEditing ? "New password" : "Password"}
              </FieldLabel>
              <Input
                id={passwordId}
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required={!isEditing}
              />
              {isEditing && (
                <FieldDescription>
                  Leave blank to keep the current password.
                </FieldDescription>
              )}
            </Field>
            {error && <FieldError>{error}</FieldError>}
            <DialogFooter>
              <DialogClose variant="outline" isDisabled={isSubmitting}>
                Cancel
              </DialogClose>
              <Button type="submit" isDisabled={isSubmitting}>
                {submitLabel}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </Dialog>
    </DialogTrigger>
  );
}
