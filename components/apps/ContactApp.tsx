"use client";

import { useState } from "react";

type SubmitState = "idle" | "sending" | "success" | "error";

export function ContactApp() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", website: "" });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitted = submitState === "success";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: { [k: string]: string } = {};
    if (!form.name.trim()) newErrors.name = "Please add your name.";
    if (!form.email.trim()) newErrors.email = "Please add your email.";
    if (!form.subject.trim()) newErrors.subject = "Please add a subject.";
    if (!form.message.trim()) newErrors.message = "Please add a message.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitState("sending");
    setSubmitError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitState("error");
        setSubmitError(data.error || `failed to send (${res.status})`);
        return;
      }
      setSubmitState("success");
    } catch (err) {
      setSubmitState("error");
      setSubmitError(err instanceof Error ? err.message : "network error");
    }
  };

  if (submitted) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 py-12">
        <span className="text-3xl">✉</span>
        <h2 className="font-serif-heading text-[24px]">Message Sent</h2>
        <p className="text-[12.5px]" style={{ color: "var(--color-text-muted)" }}>
          Thanks — I&apos;ll get back to you soon.
        </p>
        <button
          className="mt-2 px-4 py-2 text-[12.5px] font-medium text-white"
          style={{ background: "var(--color-button-dark)" }}
          onClick={() => {
            setSubmitState("idle");
            setForm({ name: "", email: "", subject: "", message: "", website: "" });
            setErrors({});
            setSubmitError(null);
          }}
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <div>
        <h1 className="font-serif-heading text-[30px] leading-none" style={{ color: "var(--color-text)" }}>
          Contact
        </h1>
        <p className="mt-3 text-[12.5px] leading-[1.55]" style={{ color: "var(--color-text-secondary)" }}>
          Send a message directly for project inquiries, collaborations, or just to say hello.
        </p>
      </div>

      {/* Info box */}
      <div
        className="border px-4 py-3"
        style={{
          background: "var(--color-info-box)",
          borderColor: "var(--color-border)",
        }}
      >
        <span className="text-[12.5px]" style={{ color: "var(--color-text-muted)" }}>
          Fill in your details and send your message directly.
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="NAME" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            placeholder="Your name"
            className="w-full border px-3 py-2.5 text-[12.5px] outline-none transition-colors"
            style={{
              background: "var(--color-input-bg)",
              borderColor: errors.name ? "var(--color-error)" : "var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </Field>

        <Field label="EMAIL" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            placeholder="you@example.com"
            className="w-full border px-3 py-2.5 text-[12.5px] outline-none transition-colors"
            style={{
              background: "var(--color-input-bg)",
              borderColor: errors.email ? "var(--color-error)" : "var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </Field>

        <Field label="SUBJECT" error={errors.subject}>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => {
              setForm({ ...form, subject: e.target.value });
              if (errors.subject) setErrors({ ...errors, subject: "" });
            }}
            placeholder="Project inquiry"
            className="w-full border px-3 py-2.5 text-[12.5px] outline-none transition-colors"
            style={{
              background: "var(--color-input-bg)",
              borderColor: errors.subject ? "var(--color-error)" : "var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </Field>

        <Field label="MESSAGE" error={errors.message}>
          <textarea
            value={form.message}
            onChange={(e) => {
              setForm({ ...form, message: e.target.value });
              if (errors.message) setErrors({ ...errors, message: "" });
            }}
            rows={5}
            placeholder="Tell me a bit about your project..."
            className="custom-scrollbar w-full resize-none border px-3 py-2.5 text-[12.5px] outline-none transition-colors"
            style={{
              background: "var(--color-input-bg)",
              borderColor: errors.message ? "var(--color-error)" : "var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </Field>

        {/* Honeypot field — hidden from users, trapped bots fill this */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          style={{
            position: "absolute",
            left: "-9999px",
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />

        {/* Error display */}
        {submitState === "error" && submitError && (
          <div
            className="border px-3 py-2 text-[12px]"
            style={{
              background: "var(--color-info-box)",
              borderColor: "var(--color-error)",
              color: "var(--color-error)",
            }}
          >
            Couldn&apos;t send: {submitError}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={submitState === "sending"}
            className="flex items-center gap-2 px-5 py-2.5 text-[12.5px] font-medium text-white transition-colors disabled:opacity-70"
            style={{ background: "var(--color-button-dark)" }}
            onMouseEnter={(e) => {
              if (submitState !== "sending") e.currentTarget.style.background = "var(--color-button-dark-hover)";
            }}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-button-dark)")}
          >
            {submitState === "sending" && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="animate-spin">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            {submitState === "sending" ? "Sending..." : "Send message"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[10.5px] font-semibold tracking-wider"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </label>
      {children}
      {error && (
        <span className="text-[11.5px]" style={{ color: "var(--color-error)" }}>
          {error}
        </span>
      )}
    </div>
  );
}
