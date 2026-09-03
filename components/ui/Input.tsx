export function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-14 w-full border-4 border-border bg-panel px-4 font-grotesk font-bold text-foreground shadow-brutal outline-none ${className}`}
      {...props}
    />
  );
}
