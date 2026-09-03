export function Card({
  children,
  className = "",
  quiet = false,
}: {
  children: React.ReactNode;
  className?: string;
  quiet?: boolean;
}) {
  return (
    <div
      className={`border-4 border-border shadow-brutal-md transition-all duration-200 ease-out hover:-translate-y-2 hover:shadow-brutal-lg ${
        quiet ? "bg-violet text-black" : "bg-panel"
      } ${className}`}
    >
      {children}
    </div>
  );
}
