import type { ReactNode } from "react";

interface RegistrationFormFieldProps {
  label: string;
  htmlFor: string;
  icon: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function RegistrationFormField({
  label,
  htmlFor,
  icon,
  error,
  required = false,
  className = "",
  children,
}: RegistrationFormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-sm font-medium"
      >
        {icon}

        <span>{label}</span>

        {required && (
          <span className="text-destructive">*</span>
        )}
      </label>

      {children}

      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}