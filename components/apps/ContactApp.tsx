"use client";

import { useState } from "react";

export function ContactApp() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
    console.log("Contact form:", form);
    setSubmitted(true);
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
            setSubmitted(false);
            setForm({ name: "", email: "", subject: "", message: "" });
            setErrors({});
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

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-5 py-2.5 text-[12.5px] font-medium text-white transition-colors"
            style={{ background: "var(--color-button-dark)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-button-dark-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-button-dark)")}
          >
            Send message
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
