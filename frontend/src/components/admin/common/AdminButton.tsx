import type { ButtonHTMLAttributes, ReactNode } from "react";

type AdminButtonVariant = "primary" | "secondary" | "ghost";

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  icon?: ReactNode;
  variant?: AdminButtonVariant;
};

const variantClasses: Record<AdminButtonVariant, string> = {
  primary:
    "border-primary-container bg-primary-container text-on-primary hover:bg-[#0284c7] hover:border-[#0284c7]",
  secondary:
    "border-border bg-surface text-text-secondary hover:text-text-main hover:border-tertiary-container",
  ghost:
    "border-transparent bg-transparent text-text-secondary hover:bg-surface-alt hover:text-text-main",
};

export default function AdminButton({
  children,
  icon,
  variant = "secondary",
  className = "",
  type,
  ...buttonProps
}: AdminButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={`inline-flex h-control-h items-center justify-center gap-2 rounded-[10px] border px-4 text-button-text font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-fixed ${variantClasses[variant]} ${className}`}
      {...buttonProps}
    >
      {icon ? <span className="flex text-[18px] leading-none">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}
