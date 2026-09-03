import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "ink";
type Size = "sm" | "md" | "lg";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  className?: string;
};

const sizeClass: Record<Size, string> = {
  sm: "h-12 px-4 text-sm",
  md: "h-14 px-6 text-base",
  lg: "min-h-16 px-8 py-4 text-lg md:text-xl",
};

const variantClass: Record<Variant, string> = {
  primary: "bg-accent text-black",
  secondary: "bg-yellow text-black",
  ghost: "bg-panel text-foreground",
  ink: "bg-ink text-[var(--cream)] dark:bg-cream dark:text-black",
};

export function Button({
  children,
  href,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled,
  className = "",
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center border-4 border-border font-grotesk font-bold uppercase tracking-tight shadow-brutal transition-all duration-100 ease-out hover:-translate-y-0.5 hover:shadow-brutal-md active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none ${sizeClass[size]} ${variantClass[variant]} ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
