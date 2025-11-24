import { Badge } from "@/components/ui/badge";

type Status = "draft" | "published" | "archived";

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<Status, { label: string; variant: "secondary" | "default" | "outline" }> = {
    draft: { label: "Draft", variant: "secondary" },
    published: { label: "Published", variant: "default" },
    archived: { label: "Archived", variant: "outline" },
  };

  const { label, variant } = variants[status];

  return (
    <Badge variant={variant} data-testid={`badge-status-${status}`}>
      {label}
    </Badge>
  );
}
