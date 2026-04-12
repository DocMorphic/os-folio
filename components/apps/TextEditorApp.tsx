"use client";

import { useState, useEffect } from "react";
import { useWindowManager } from "@/hooks/use-window-manager";

interface TextEditorAppProps {
  initialContent: string;
  appId: string;
}

export function TextEditorApp({ initialContent, appId }: TextEditorAppProps) {
  const [content, setContent] = useState(initialContent);
  const { setWindowStatus } = useWindowManager();

  // Update title bar char count on content change
  useEffect(() => {
    setWindowStatus(appId, `${content.length} chars`);
    // Clear on unmount
    return () => {
      setWindowStatus(appId, "");
    };
  }, [content, appId, setWindowStatus]);

  return (
    <div
      className="-mx-5 -my-4 h-[calc(100%+32px)] overflow-hidden"
      style={{ background: "#1a0e06" }}
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="custom-scrollbar h-full w-full resize-none bg-transparent p-5 outline-none"
        style={{
          color: "#e8c98f",
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          fontSize: "13px",
          lineHeight: "1.6",
          tabSize: 2,
        }}
        spellCheck={false}
      />
    </div>
  );
}

// Wrapped instances per file
import { ABOUT_TXT, BUILD_LOG_MD } from "@/content/text-files";
import { FOLDER_CONTENTS } from "@/content/folder-files";

export function AboutTxtApp() {
  return <TextEditorApp initialContent={ABOUT_TXT} appId="about-txt" />;
}

export function BuildLogApp() {
  return <TextEditorApp initialContent={BUILD_LOG_MD} appId="build-log-md" />;
}

export function GermanyNotesApp() {
  return <TextEditorApp initialContent={FOLDER_CONTENTS.germany.text} appId="germany-notes" />;
}

export function AustriaNotesApp() {
  return <TextEditorApp initialContent={FOLDER_CONTENTS.austria.text} appId="austria-notes" />;
}

export function IndiaNotesApp() {
  return <TextEditorApp initialContent={FOLDER_CONTENTS.india.text} appId="india-notes" />;
}
