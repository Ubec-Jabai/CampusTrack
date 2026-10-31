"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/hooks/use-auth";
import {
  changePassword,
  deleteAccount,
  getProfile,
  updateProfile,
  type UserProfileResponseDto,
} from "@/lib/api/api-profile";
import { logout } from "@/lib/api/api-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function UserDashboardPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading, isLoggedIn } = useAuth();
  const [profile, setProfile] = useState<UserProfileResponseDto | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    setError(null);

    try {
      const data = await getProfile();
      setProfile(data);
      setFirstName(data.profile?.firstName ?? "");
      setMiddleName(data.profile?.middleName ?? "");
      setLastName(data.profile?.lastName ?? "");
      setSuffix(data.profile?.suffix ?? "");
      setEmail(data.email);
      setPhone(data.profile?.phone ?? "");
      setStudentNumber(data.profile?.studentNumber ?? "");
      setDepartment(data.profile?.department ?? "");
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : "Failed to load user profile."
      );
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.replace("/sample/login");
      return;
    }

    if (isLoggedIn) {
      (async () => {
        await loadProfile();
      })();
    }
  }, [isAuthLoading, isLoggedIn, loadProfile, router]);

  async function handleLogout() {
    await logout();
    router.replace("/sample/login");
  }

  async function handleUpdateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileError(null);
    setProfileMessage(null);
    setIsSavingProfile(true);

    try {
      const updatedProfile = await updateProfile({
        firstName,
        middleName,
        lastName,
        suffix,
        email,
        phone,
        studentNumber,
        department,
      });
      setProfile(updatedProfile);
      setFirstName(updatedProfile.profile?.firstName ?? "");
      setMiddleName(updatedProfile.profile?.middleName ?? "");
      setLastName(updatedProfile.profile?.lastName ?? "");
      setSuffix(updatedProfile.profile?.suffix ?? "");
      setEmail(updatedProfile.email);
      setPhone(updatedProfile.profile?.phone ?? "");
      setStudentNumber(updatedProfile.profile?.studentNumber ?? "");
      setDepartment(updatedProfile.profile?.department ?? "");
      setProfileMessage("Profile updated successfully.");
    } catch (cause: unknown) {
      setProfileError(cause instanceof Error ? cause.message : "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);
    setIsChangingPassword(true);

    try {
      await changePassword({ currentPassword, password, passwordConfirmation });
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      setPasswordMessage("Password changed successfully.");
    } catch (cause: unknown) {
      setPasswordError(cause instanceof Error ? cause.message : "Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    setAccountError(null);
    setIsDeletingAccount(true);

    try {
      await deleteAccount();
      await logout();
      router.replace("/sample/login");
    } catch (cause: unknown) {
      setAccountError(cause instanceof Error ? cause.message : "Failed to delete account.");
      setIsDeletingAccount(false);
    }
  }

  const isLoading = isAuthLoading || isLoadingProfile;

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className={`w-full ${!isLoading && !error && profile ? "grid grid-cols-1 gap-6 lg:grid-cols-2 max-w-7xl" : "max-w-xl"}`}>
        <Card>
          <CardHeader>
            <CardTitle>User Dashboard</CardTitle>
            <CardDescription>Your authenticated profile information.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <p className="text-muted-foreground">Loading profile information...</p>
            )}

            {!isLoading && error && (
              <div className="space-y-4">
                <p className="text-destructive font-medium">{error}</p>
                <Button onPress={loadProfile}>Retry</Button>
              </div>
            )}

            {!isLoading && !error && !profile && (
              <p className="text-muted-foreground">No profile data available.</p>
            )}

            {!isLoading && !error && profile && (
              <div className="space-y-6">
                {profile.profile?.avatarPath && (
                  <div>
                    <p className="text-muted-foreground">Avatar</p>
                    <div className="flex justify-center">
                      <Image
                        src={profile.profile.avatarPath}
                        alt="Profile avatar"
                        width={128}
                        height={128}
                        className="size-32 rounded-full object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">User ID</p>
                    <p className="font-semibold">{profile.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Role</p>
                    <p className="font-semibold">{profile.userRole}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-semibold">
                      {profile.profile
                        ? [profile.profile.firstName, profile.profile.middleName, profile.profile.lastName, profile.profile.suffix]
                          .filter(Boolean)
                          .join(" ")
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-semibold">{profile.email}</p>
                  </div>
                  {profile.profile?.phone && (
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-semibold">{profile.profile?.phone}</p>
                    </div>
                  )}
                  {profile.userRole === "STUDENT" && profile.profile?.studentNumber && (
                    <div>
                      <p className="text-muted-foreground">Student number</p>
                      <p className="font-semibold">{profile.profile?.studentNumber}</p>
                    </div>
                  )}
                  {profile.profile?.department && (
                    <div>
                      <p className="text-muted-foreground">Department</p>
                      <p className="font-semibold">{profile.profile?.department}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Profile created</p>
                    <p className="font-semibold">
                      {profile.profile?.createdAt
                        ? Number.isNaN(new Date(profile.profile.createdAt).getTime())
                          ? profile.profile.createdAt
                          : new Date(profile.profile.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created At</p>
                    <p className="font-semibold">
                      {Number.isNaN(new Date(profile.createdAt).getTime())
                        ? profile.createdAt
                        : new Date(profile.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          {!isLoading && profile && (
            <CardFooter className="justify-end">
              <Button variant="outline" onPress={handleLogout}>
                Log out
              </Button>
            </CardFooter>
          )}
        </Card>

        {!isLoading && !error && profile && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Edit profile</CardTitle>
                <CardDescription>Update your profile details.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} noValidate>
                  <FieldGroup className="gap-5">
                    <Field>
                      <FieldLabel htmlFor="profile-first-name">First name</FieldLabel>
                      <Input id="profile-first-name" name="firstName" value={firstName} maxLength={100} onChange={(event) => setFirstName(event.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="profile-middle-name">Middle name</FieldLabel>
                      <Input id="profile-middle-name" name="middleName" value={middleName} maxLength={100} onChange={(event) => setMiddleName(event.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="profile-last-name">Last name</FieldLabel>
                      <Input id="profile-last-name" name="lastName" value={lastName} maxLength={100} onChange={(event) => setLastName(event.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="profile-suffix">Suffix</FieldLabel>
                      <Input id="profile-suffix" name="suffix" value={suffix} maxLength={20} onChange={(event) => setSuffix(event.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                      <Input id="profile-email" name="email" type="email" value={email} maxLength={100} onChange={(event) => setEmail(event.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="profile-phone">Phone</FieldLabel>
                      <Input id="profile-phone" name="phone" type="tel" value={phone} maxLength={20} onChange={(event) => setPhone(event.target.value)} />
                    </Field>
                    {profile.userRole === "STUDENT" && (
                      <Field>
                        <FieldLabel htmlFor="profile-student-number">Student number</FieldLabel>
                        <Input id="profile-student-number" name="studentNumber" value={studentNumber} maxLength={50} onChange={(event) => setStudentNumber(event.target.value)} />
                      </Field>
                    )}
                    <Field>
                      <FieldLabel htmlFor="profile-department">Department</FieldLabel>
                      <Input id="profile-department" name="department" value={department} maxLength={100} onChange={(event) => setDepartment(event.target.value)} />
                    </Field>
                    {profileError && <FieldError>{profileError}</FieldError>}
                    {profileMessage && <p role="status">{profileMessage}</p>}
                    <Button type="submit" isDisabled={isSavingProfile}>
                      {isSavingProfile ? "Saving profile..." : "Save profile"}
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change password</CardTitle>
                <CardDescription>Enter your current password and choose a new one.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} noValidate>
                  <FieldGroup className="gap-5">
                    <Field>
                      <FieldLabel htmlFor="current-password">Current password</FieldLabel>
                      <Input id="current-password" name="currentPassword" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="new-password">New password</FieldLabel>
                      <Input id="new-password" name="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="password-confirmation">Confirm new password</FieldLabel>
                      <Input id="password-confirmation" name="passwordConfirmation" type="password" autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} />
                    </Field>
                    {passwordError && <FieldError>{passwordError}</FieldError>}
                    {passwordMessage && <p role="status">{passwordMessage}</p>}
                    <Button type="submit" isDisabled={isChangingPassword}>
                      {isChangingPassword ? "Changing password..." : "Change password"}
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delete account</CardTitle>
                <CardDescription>This action cannot be undone.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DialogTrigger
                  isOpen={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <Button variant="destructive">Delete account</Button>
                  <Dialog isDismissable={!isDeletingAccount}>
                    <DialogHeader>
                      <DialogTitle>Delete account?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. Your account will be permanently deleted.
                      </DialogDescription>
                    </DialogHeader>
                    {accountError && <FieldError>{accountError}</FieldError>}
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onPress={() => setIsDeleteDialogOpen(false)}
                        isDisabled={isDeletingAccount}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onPress={handleDeleteAccount}
                        isDisabled={isDeletingAccount}
                      >
                        {isDeletingAccount ? "Deleting account..." : "Delete account"}
                      </Button>
                    </DialogFooter>
                  </Dialog>
                </DialogTrigger>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
