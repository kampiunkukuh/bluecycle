import { ContentTable } from "../content-table";

export default function ContentTableExample() {
  const items = [
    {
      id: "1",
      title: "Getting Started Guide",
      author: "Sarah Johnson",
      status: "published" as const,
      lastModified: "2 hours ago",
    },
    {
      id: "2",
      title: "API Documentation",
      author: "Mike Davis",
      status: "draft" as const,
      lastModified: "1 day ago",
    },
    {
      id: "3",
      title: "Release Notes v2.0",
      author: "Alex Chen",
      status: "published" as const,
      lastModified: "3 days ago",
    },
  ];

  return (
    <div className="p-4">
      <ContentTable
        items={items}
        onEdit={(id) => console.log("Edit", id)}
        onDelete={(id) => console.log("Delete", id)}
        onView={(id) => console.log("View", id)}
      />
    </div>
  );
}
