import { StatusBadge } from "../status-badge";

export default function StatusBadgeExample() {
  return (
    <div className="p-4 flex gap-2">
      <StatusBadge status="draft" />
      <StatusBadge status="published" />
      <StatusBadge status="archived" />
    </div>
  );
}
