interface WindowContentProps {
  children: React.ReactNode;
}

export function WindowContent({ children }: WindowContentProps) {
  return (
    <div
      className="custom-scrollbar flex-1 overflow-y-auto px-5 py-4"
      style={{ color: "var(--color-text)" }}
    >
      {children}
    </div>
  );
}
