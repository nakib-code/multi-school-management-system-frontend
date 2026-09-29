"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export function SidebarItem({
  href,
  label,
  icon: Icon,
  onClick,
}: SidebarItemProps) {
  const pathname = usePathname();

  const isActive =
    pathname === href ||
    (href !== "/dashboard" &&
      pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" />

      <span className="truncate">{label}</span>
    </Link>
  );
}
