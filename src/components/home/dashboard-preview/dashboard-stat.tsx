interface DashboardStatProps {
  label: string;
  value: string;
  description: string;
}

export function DashboardStat({
  label,
  value,
  description,
}: DashboardStatProps) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/80 p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>

      <p className="mt-2 text-xl font-bold tracking-tight">{value}</p>

      <p className="mt-1 text-[11px] text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
