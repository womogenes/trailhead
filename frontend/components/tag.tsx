export default function Tag({
  label,
  onClick,
}: {
  label: string;
  onClick: Function;
}) {
  return (
    <button
      className="bg-muted text-muted-foreground hover:bg-primary hover:text-muted rounded-full px-3 py-1 transition-colors"
      onClick={() => onClick(label)}
    >
      {label}
    </button>
  );
}
