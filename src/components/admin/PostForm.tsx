"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { WysiwygEditor } from "@/components/admin/WysiwygEditor";
import { useToast } from "@/components/ui/toast";

export interface PostFormValues {
  _id?: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author?: string;
  tags: string[];
  published: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

const DEFAULT_VALUES: PostFormValues = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  author: "NFL Predictions Hub Staff",
  tags: [],
  published: false,
  metaTitle: "",
  metaDescription: "",
};

export function PostForm({ initialValues }: { initialValues?: Partial<PostFormValues> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [values, setValues] = useState<PostFormValues>({ ...DEFAULT_VALUES, ...initialValues });
  const [tagsInput, setTagsInput] = useState((initialValues?.tags || []).join(", "));
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(initialValues?._id);

  const update = <K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEdit ? `/api/posts/${initialValues!._id}` : "/api/posts";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Save failed", description: data.error, variant: "error" });
        setSaving(false);
        return;
      }
      toast({ title: isEdit ? "Post updated" : "Post created", variant: "success" });
      router.push("/admin/blog");
      router.refresh();
    } catch {
      toast({ title: "Something went wrong", variant: "error" });
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input value={values.title} onChange={(e) => update("title", e.target.value)} required />
      </div>

      <div className="space-y-1.5">
        <Label>Excerpt</Label>
        <Textarea value={values.excerpt} onChange={(e) => update("excerpt", e.target.value)} rows={2} required />
      </div>

      <div className="space-y-1.5">
        <Label>Content</Label>
        <WysiwygEditor content={values.content} onChange={(html) => update("content", html)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Cover Image URL</Label>
          <Input
            type="url"
            value={values.coverImage}
            onChange={(e) => update("coverImage", e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-1.5">
          <Label>Author</Label>
          <Input value={values.author} onChange={(e) => update("author", e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Tags (comma-separated)</Label>
        <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Chiefs, Playoffs, Analysis" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Meta Title (SEO)</Label>
          <Input value={values.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Meta Description (SEO)</Label>
          <Input value={values.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={values.published} onCheckedChange={(v) => update("published", v)} />
        <Label>Published</Label>
      </div>

      <Button type="submit" variant="neon" disabled={saving}>
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : isEdit ? "Update Post" : "Create Post"}
      </Button>
    </form>
  );
}
