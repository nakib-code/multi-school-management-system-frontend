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
        className="flex items-center gap-1.5 text-sm font-semibold text-[#061842]"
      >
        <span className="text-[#008f87]">{icon}</span>

        <span>{label}</span>

        {required && (
          <span
            className="text-red-500"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p
          className="text-xs font-medium text-red-500"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}