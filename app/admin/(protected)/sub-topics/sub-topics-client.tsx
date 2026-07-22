"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, PencilIcon, Trash2Icon, Loader2Icon, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSubTopic, updateSubTopic, deleteSubTopic } from "@/app/_actions/taxonomy";

type SubTopicWithRelations = {
  id: string;
  name: string;
  slug: string;
  topicAreaId: string;
  topicArea: {
    name: string;
  };
  _count: {
    entries: number;
  };
};

type TopicAreaOption = {
  id: string;
  name: string;
};

export function SubTopicsClient({
  initialSubTopics,
  topicAreas,
}: {
  initialSubTopics: SubTopicWithRelations[];
  topicAreas: TopicAreaOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedFilterAreaId, setSelectedFilterAreaId] = useState<string>("ALL");

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [topicAreaId, setTopicAreaId] = useState("");

  const isEditing = editingId !== null;

  function resetForm() {
    setEditingId(null);
    setName("");
    setTopicAreaId("");
  }

  function startEdit(sub: SubTopicWithRelations) {
    setEditingId(sub.id);
    setName(sub.name);
    setTopicAreaId(sub.topicAreaId);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!topicAreaId) {
      toast.error("Topic Area is required");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateSubTopic(editingId, { name, topicAreaId });
          toast.success("Sub-topic updated successfully");
        } else {
          await createSubTopic({ name, topicAreaId });
          toast.success("Sub-topic created successfully");
        }
        resetForm();
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "An error occurred");
      }
    });
  }

  async function handleDelete(sub: SubTopicWithRelations) {
    if (!window.confirm(`Are you sure you want to delete "${sub.name}"?`)) return;

    startTransition(async () => {
      try {
        await deleteSubTopic(sub.id);
        toast.success("Sub-topic deleted successfully");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "An error occurred");
      }
    });
  }

  // Filter logic
  const filteredSubTopics = useMemo(() => {
    return initialSubTopics.filter((sub) => {
      const matchesSearch = sub.name.toLowerCase().includes(search.toLowerCase()) ||
        sub.slug.toLowerCase().includes(search.toLowerCase());
      const matchesArea = selectedFilterAreaId === "ALL" || sub.topicAreaId === selectedFilterAreaId;
      return matchesSearch && matchesArea;
    });
  }, [initialSubTopics, search, selectedFilterAreaId]);

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sub-Topics</h1>
          <p className="text-muted-foreground text-sm">
            Manage granular concepts (e.g. DP, Graphs, Promises) mapped to Topic Areas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-1">
          <Card className="border border-slate-200/80 shadow-sm bg-white/70 backdrop-blur-md">
            <CardHeader>
              <CardTitle>{isEditing ? "Edit Sub-Topic" : "Add Sub-Topic"}</CardTitle>
              <CardDescription>
                {isEditing ? "Modify the properties of this sub-topic." : "Create a new sub-topic in a topic area."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="topicArea" className="text-xs font-semibold text-slate-700">
                    Topic Area
                  </label>
                  <Select value={topicAreaId} onValueChange={(val) => setTopicAreaId(val || "")} disabled={isPending}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select topic area…" />
                    </SelectTrigger>
                    <SelectContent>
                      {topicAreas.map((ta) => (
                        <SelectItem key={ta.id} value={ta.id}>
                          {ta.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="subName" className="text-xs font-semibold text-slate-700">
                    Sub-Topic Name
                  </label>
                  <Input
                    id="subName"
                    placeholder="e.g. Graphs, Dynamic Programming"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isPending}
                  />
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
                        Create Sub-Topic
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
        <div className="lg:col-span-2 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search sub-topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
            <div className="w-48">
              <Select value={selectedFilterAreaId} onValueChange={(val) => setSelectedFilterAreaId(val || "ALL")}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Filter by Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Topic Areas</SelectItem>
                  {topicAreas.map((ta) => (
                    <SelectItem key={ta.id} value={ta.id}>
                      {ta.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border border-slate-200/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Sub-Topics List</CardTitle>
                <Badge variant="outline">
                  Showing {filteredSubTopics.length} of {initialSubTopics.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredSubTopics.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No sub-topics match your filters.
                </div>
              ) : (
                <div className="divide-y border-t border-slate-100 max-h-[600px] overflow-y-auto">
                  {filteredSubTopics.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{sub.name}</span>
                          <Badge variant="outline" className="text-[10px] bg-indigo-50 border-indigo-200 text-indigo-700">
                            {sub.topicArea.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Slug: <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-mono">{sub.slug}</code></span>
                          <span>·</span>
                          <span>used {sub._count.entries} times</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => startEdit(sub)}
                          disabled={isPending}
                          title="Edit"
                        >
                          <PencilIcon className="size-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(sub)}
                          disabled={isPending || sub._count.entries > 0}
                          title={
                            sub._count.entries > 0
                              ? "Cannot delete: used in interviews"
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
