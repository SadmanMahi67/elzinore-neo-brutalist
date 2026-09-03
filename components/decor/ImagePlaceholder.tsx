export function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[180px] w-full items-center justify-center bg-violet p-6 text-center font-grotesk text-xl font-black uppercase tracking-tight text-black">
      {label}
    </div>
  );
}
