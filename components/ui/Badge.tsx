export function Badge({
  children,
  className = "",
  rotate = -6,
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
}) {
  const hasBg = /\bbg-/.test(className);
  const hasText = /\btext-/.test(className);

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border-4 border-border ${
        hasBg ? "" : "bg-yellow"
      } px-4 py-1 font-grotesk text-sm font-black uppercase tracking-tight ${
        hasText ? "" : "text-black"
      } shadow-brutal transition-transform duration-100 hover:rotate-12 ${className}`}
      style={{ rotate: `${rotate}deg` }}
    >
      {children}
    </span>
  );
}
