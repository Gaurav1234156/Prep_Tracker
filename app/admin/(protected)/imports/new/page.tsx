import { requireAdminOrPanelist } from "@/lib/auth/guards";

import { UploadZone } from "@/components/imports/UploadZone";

export const dynamic = "force-dynamic";
export const metadata = { title: "New import | Admin" };

export default async function NewImportPage() {
  await requireAdminOrPanelist();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Bulk import</h1>
        <p className="text-sm text-muted-foreground">
          Upload a CSV of interview experiences. The AI extracts structured data
          per row; every company goes through a review queue before publishing.
        </p>
      </header>

      <UploadZone />
    </div>
  );
}
