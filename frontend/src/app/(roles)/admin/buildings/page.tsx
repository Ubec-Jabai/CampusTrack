import { Suspense } from "react";
import { BuildingsPageClient } from "@/components/admin/admin-buildings-page-client";

export const instant = false;

export default function AdminBuildingsPage() {
  return (
    <Suspense
      fallback={
        <p className="text-center text-muted-foreground">
          Loading buildings...
        </p>
      }
    >
      <BuildingsPageClient />
    </Suspense>
  );
}
