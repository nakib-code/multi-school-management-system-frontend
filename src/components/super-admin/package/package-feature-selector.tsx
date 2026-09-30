"use client";

import { PACKAGE_FEATURES } from "@/features/super-admin/packages/constants";
import { PackageFeature } from "@/features/super-admin/packages/type";


interface PackageFeatureSelectorProps {
  value: PackageFeature[];
  onChange: (features: PackageFeature[]) => void;
  disabled?: boolean;
}

export function PackageFeatureSelector({
  value,
  onChange,
  disabled = false,
}: PackageFeatureSelectorProps) {
  const isSelected = (feature: PackageFeature) => {
    return value.includes(feature);
  };

  const toggleFeature = (feature: PackageFeature) => {
    if (disabled) return;

    if (isSelected(feature)) {
      onChange(value.filter((item) => item !== feature));
      return;
    }

    onChange([...value, feature]);
  };

  const selectAll = () => {
    if (disabled) return;

    onChange(PACKAGE_FEATURES.map((item) => item.value));
  };

  const clearAll = () => {
    if (disabled) return;

    onChange([]);
  };

  const allSelected =
    value.length === PACKAGE_FEATURES.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Package Features
          </h3>

          <p className="mt-1 text-xs text-muted-foreground">
            Select the features available in this package.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAll}
            disabled={disabled || allSelected}
            className="text-xs font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            Select all
          </button>

          <span className="text-muted-foreground">•</span>

          <button
            type="button"
            onClick={clearAll}
            disabled={disabled || value.length === 0}
            className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Selected count */}
      <div className="rounded-lg border bg-muted/30 px-3 py-2">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {value.length}
          </span>{" "}
          of {PACKAGE_FEATURES.length} features selected
        </p>
      </div>

      {/* Features */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PACKAGE_FEATURES.map((item) => {
          const selected = isSelected(item.value);

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => toggleFeature(item.value)}
              disabled={disabled}
              className={[
                "flex items-center gap-3 rounded-xl border p-4 text-left transition",
                "hover:border-primary/50 hover:bg-muted/40",
                "disabled:cursor-not-allowed disabled:opacity-60",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background",
              ].join(" ")}
            >
              <span
                className={[
                  "flex size-5 shrink-0 items-center justify-center rounded-md border text-xs",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/40",
                ].join(" ")}
              >
                {selected ? "✓" : ""}
              </span>

              <span
                className={[
                  "text-sm",
                  selected
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}