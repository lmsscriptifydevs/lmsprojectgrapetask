export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-md border border-lightBorder bg-cardBg p-5 text-sm">
      <p className="font-medium text-lightGrayHover">{title}</p>
      <p className="mt-1 text-bodyGrayText">{detail}</p>
    </div>
  );
}
