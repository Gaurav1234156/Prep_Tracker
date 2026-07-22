"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, PencilIcon, Trash2Icon, Loader2Icon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createTopicArea, updateTopicArea, deleteTopicArea } from "@/app/_actions/taxonomy";

type TopicAreaWithCounts = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  _count: {
    subTopics: number;
    topicCoverages: number;
  };
};

export function TopicAreasClient({
  initialTopicAreas,
}: {
  initialTopicAreas: TopicAreaWithCounts[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State for form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const isEditing = editingId !== null;

  function resetForm() {
    setEditingId(null);
    setName("");
    setSortOrder(0);
  }

  function startEdit(area: TopicAreaWithCounts) {
    setEditingId(area.id);
    setName(area.name);
    setSortOrder(area.sortOrder);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateTopicArea(editingId, { name, sortOrder });
          toast.success("Topic Area updated successfully");
        } else {
          await createTopicArea({ name, sortOrder });
          toast.success("Topic Area created successfully");
        }
        resetForm();
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "An error occurred");
      }
    });
  }

  async function handleDelete(area: TopicAreaWithCounts) {
    const confirmMsg = `Are you sure you want to delete "${area.name}"?`;
    if (!window.confirm(confirmMsg)) return;

    startTransition(async () => {
      try {
        await deleteTopicArea(area.id);
        toast.success("Topic Area deleted successfully");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "An error occurred");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
              <ArrowLeft className="size-3" /> Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Topic Areas</h1>
          <p className="text-muted-foreground text-sm">
            Manage high-level categories used to group interview sub-topics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="md:col-span-1">
          <Card className="border border-slate-200/80 shadow-sm bg-white/70 backdrop-blur-md">
            <CardHeader>
              <CardTitle>{isEditing ? "Edit Topic Area" : "Add Topic Area"}</CardTitle>
              <CardDescription>
                {isEditing ? "Modify the properties of this topic area." : "Create a new topic area categories."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-semibold text-slate-700">
                    Name
                  </label>
                  <Input
                    id="name"
                    placeholder="e.g. System Design, DSA"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="sortOrder" className="text-xs font-semibold text-slate-700">
                    Sort Order
                  </label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                    disabled={isPending}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Lower values appear first in wizard lists.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button type="submit" disabled={isPending} className="flex-1 justify-center">
                    {isPending ? (
                      <Loader2Icon className="size-4 animate-spin mr-1" />
                    ) : isEditing ? (
                      "Save changes"
                    ) : (
                      <>
                        <PlusIcon className="size-4 mr-1" />
                        Create Area
                      </>
                    )}
                  </Button>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* List Card */}
        <div className="md:col-span-2">
          <Card className="border border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle>Existing Areas</CardTitle>
              <CardDescription>
                Currently configured topic areas sorted by rank.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {initialTopicAreas.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No topic areas found.
                </div>
              ) : (
                <div className="divide-y border-t border-slate-100">
                  {initialTopicAreas.map((area) => (
                    <div
                      key={area.id}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{area.name}</span>
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            Order: {area.sortOrder}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Slug: <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-mono">{area.slug}</code></span>
                          <span>·</span>
                          <span>{area._count.subTopics} sub-topics</span>
                          <span>·</span>
                          <span>used {area._count.topicCoverages} times</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => startEdit(area)}
                          disabled={isPending}
                          title="Edit"
                        >
                          <PencilIcon className="size-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(area)}
                          disabled={isPending || area._count.subTopics > 0 || area._count.topicCoverages > 0}
                          title={
                            area._count.subTopics > 0 || area._count.topicCoverages > 0
                              ? "Cannot delete: contains sub-topics or used in interviews"
                              : "Delete"
                          }
                          className="text-destructive hover:bg-destructive/10 disabled:opacity-30"
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
