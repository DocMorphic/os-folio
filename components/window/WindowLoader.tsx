export function WindowLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="window-content-loader" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="window-content-loader-track" aria-hidden="true">
        <span className="window-content-loader-bar" />
      </div>
    </div>
  );
}
