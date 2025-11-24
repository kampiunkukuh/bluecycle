import { useState } from "react";
import { ContentTable, ContentItem } from "@/components/content-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// TODO: Remove mock data when implementing real backend
const initialContent: ContentItem[] = [
  {
    id: "1",
    title: "Getting Started Guide",
    author: "Sarah Johnson",
    status: "published",
    lastModified: "2 hours ago",
  },
  {
    id: "2",
    title: "API Documentation",
    author: "Mike Davis",
    status: "draft",
    lastModified: "1 day ago",
  },
  {
    id: "3",
    title: "Release Notes v2.0",
    author: "Alex Chen",
    status: "published",
    lastModified: "3 days ago",
  },
  {
    id: "4",
    title: "User Tutorial",
    author: "Emma Wilson",
    status: "draft",
    lastModified: "1 week ago",
  },
];

export default function ContentManagement() {
  const [content, setContent] = useState<ContentItem[]>(initialContent);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorForm, setEditorForm] = useState({
    title: "",
    body: "",
    status: "draft" as "draft" | "published",
  });

  const filteredContent = content.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (id: string) => {
    const item = content.find((c) => c.id === id);
    if (item) {
      setEditingId(id);
      setEditorForm({
        title: item.title,
        body: "",
        status: item.status as "draft" | "published",
      });
      setShowEditor(true);
    }
  };

  const handleDelete = (id: string) => {
    console.log("Delete content:", id);
    setContent(content.filter((c) => c.id !== id));
  };

  const handleView = (id: string) => {
    console.log("View content:", id);
  };

  const handleSave = () => {
    if (editingId) {
      setContent(
        content.map((c) =>
          c.id === editingId
            ? { ...c, title: editorForm.title, status: editorForm.status, lastModified: "Just now" }
            : c
        )
      );
    } else {
      const newItem: ContentItem = {
        id: String(Date.now()),
        title: editorForm.title,
        author: "Current User",
        status: editorForm.status,
        lastModified: "Just now",
      };
      setContent([newItem, ...content]);
    }
    setShowEditor(false);
    setEditingId(null);
    setEditorForm({ title: "", body: "", status: "draft" });
  };

  const openNewContentDialog = () => {
    setEditingId(null);
    setEditorForm({ title: "", body: "", status: "draft" });
    setShowEditor(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Content Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, edit, and manage your content
          </p>
        </div>
        <Button onClick={openNewContentDialog} data-testid="button-new-content">
          <Plus className="mr-2 h-4 w-4" />
          New Content
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-content"
          />
        </div>
      </div>

      <ContentTable
        items={filteredContent}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Content" : "New Content"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Make changes to your content" : "Create new content for your site"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editorForm.title}
                onChange={(e) =>
                  setEditorForm({ ...editorForm, title: e.target.value })
                }
                placeholder="Enter content title"
                data-testid="input-content-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Content</Label>
              <Textarea
                id="body"
                value={editorForm.body}
                onChange={(e) =>
                  setEditorForm({ ...editorForm, body: e.target.value })
                }
                placeholder="Write your content here..."
                className="min-h-48"
                data-testid="input-content-body"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editorForm.status}
                onValueChange={(value: "draft" | "published") =>
                  setEditorForm({ ...editorForm, status: value })
                }
              >
                <SelectTrigger id="status" data-testid="select-content-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditor(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleSave} data-testid="button-save-content">
              {editingId ? "Save Changes" : "Create Content"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
