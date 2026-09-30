interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
}

export function ActivityItem({
  title,
  description,
  time,
}: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <div className="h-2 w-2 rounded-full bg-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{title}</p>

        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {description}
        </p>
      </div>

      <span className="shrink-0 text-[10px] text-muted-foreground">
        {time}
      </span>
    </div>
  );
}
