interface WindowContentProps {
  children: React.ReactNode;
}

export function WindowContent({ children }: WindowContentProps) {
  return (
    <div
      className="window-content custom-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto px-5 py-4"
      style={{ color: "var(--color-text)" }}
    >
      {children}
    </div>
  );
}
