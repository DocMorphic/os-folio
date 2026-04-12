"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useWindowManager } from "@/hooks/use-window-manager";
import { useTheme } from "@/hooks/use-theme";
import { APP_REGISTRY } from "@/lib/constants";

const PROMPT = "guest@portfolio:~$";

const COMMANDS: Array<[string, string]> = [
  ["apps", "List all available apps you can open."],
  ["calc <expression>", "Evaluate a math expression."],
  ["clear", "Clear the terminal output."],
  ["close <app-id-or-name>", "Close app windows by id or name."],
  ["date", "Show the current date."],
  ["echo <text>", "Print any text back to the terminal."],
  ["game [easy|normal|hard]", "Start Terminal Snake and choose a difficulty."],
  ["help", "List every available command."],
  ["history", "Show recently executed commands."],
  ["joke", "Print a random developer joke."],
  ["ls [apps|commands|open]", "List terminal resources."],
  ["man <command>", "Show detailed help for a command."],
  ["open <app-id-or-name>", "Open or focus an app window."],
  ["pwd", "Print the current desktop path."],
  ["status", "Show terminal and workspace status."],
  ["time", "Show the current local time."],
  ["tip", "Show a quick productivity hint."],
  ["uuid", "Generate a random UUID."],
  ["version", "Show terminal version details."],
  ["whoami", "Show your current terminal identity."],
  ["windows", "List currently open app windows."],
];

interface Line {
  type: "output" | "input" | "error" | "orange";
  text: string;
}

export function TerminalApp() {
  const greeting: Line[] = [
    { type: "orange", text: "Wes Portfolio Terminal v1.1" },
    { type: "output", text: "Type help to list all available commands." },
    { type: "output", text: "Interactive terminal app for quick commands." },
    { type: "output", text: "Use open <app-id> to launch apps." },
    { type: "input", text: `${PROMPT} help` },
    { type: "output", text: "Available commands:" },
    ...COMMANDS.map((c): Line => ({ type: "output", text: `${c[0].padEnd(28)} ${c[1]}` })),
    { type: "output", text: "" },
    { type: "output", text: "Use man <command> for details." },
  ];

  const [lines, setLines] = useState<Line[]>(greeting);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { openWindow, closeWindow } = useWindowManager();
  const { setMode } = useTheme();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const processCommand = useCallback(
    (raw: string) => {
      const parts = raw.trim().split(/\s+/);
      const cmd = parts[0]?.toLowerCase() || "";
      const args = parts.slice(1);
      const newLines: Line[] = [{ type: "input", text: `${PROMPT} ${raw}` }];

      switch (cmd) {
        case "":
          break;
        case "help":
          newLines.push({ type: "output", text: "Available commands:" });
          COMMANDS.forEach(([c, d]) =>
            newLines.push({ type: "output", text: `${c.padEnd(28)} ${d}` })
          );
          newLines.push({ type: "output", text: "" });
          newLines.push({ type: "output", text: "Use man <command> for details." });
          break;
        case "apps":
          newLines.push({ type: "output", text: "Available apps:" });
          Object.values(APP_REGISTRY)
            .filter((a) => a.showInExplorer)
            .forEach((a) => newLines.push({ type: "output", text: `  ${a.id.padEnd(14)} ${a.title}` }));
          break;
        case "open":
          if (!args[0]) newLines.push({ type: "error", text: "usage: open <app-id>" });
          else if (APP_REGISTRY[args[0]]) {
            openWindow(args[0]);
            newLines.push({ type: "output", text: `→ opened ${args[0]}` });
          } else newLines.push({ type: "error", text: `app not found: ${args[0]}` });
          break;
        case "close":
          if (!args[0]) newLines.push({ type: "error", text: "usage: close <app-id>" });
          else if (APP_REGISTRY[args[0]]) {
            closeWindow(args[0]);
            newLines.push({ type: "output", text: `→ closed ${args[0]}` });
          } else newLines.push({ type: "error", text: `app not found: ${args[0]}` });
          break;
        case "clear":
          setLines([]);
          return;
        case "whoami":
          newLines.push({ type: "output", text: "guest@portfolio" });
          break;
        case "echo":
          newLines.push({ type: "output", text: args.join(" ") });
          break;
        case "date":
          newLines.push({ type: "output", text: new Date().toString() });
          break;
        case "time":
          newLines.push({ type: "output", text: new Date().toLocaleTimeString() });
          break;
        case "pwd":
          newLines.push({ type: "output", text: "/desktop" });
          break;
        case "version":
          newLines.push({ type: "output", text: "os-folio terminal v1.1" });
          break;
        case "status":
          newLines.push({ type: "output", text: "workspace: active · terminal: ready" });
          break;
        case "uuid":
          newLines.push({ type: "output", text: crypto.randomUUID() });
          break;
        case "joke":
          newLines.push({ type: "output", text: "Why do programmers prefer dark mode? Because light attracts bugs." });
          break;
        case "tip":
          newLines.push({ type: "output", text: "Tip: Try Cmd+K to open search anywhere." });
          break;
        case "theme":
          if (args[0] === "dark" || args[0] === "light") {
            setMode(args[0]);
            newLines.push({ type: "output", text: `→ theme set to ${args[0]}` });
          } else newLines.push({ type: "error", text: "usage: theme <dark|light>" });
          break;
        case "ls":
          Object.values(APP_REGISTRY)
            .filter((a) => a.showInExplorer)
            .forEach((a) => newLines.push({ type: "output", text: `  ${a.id}` }));
          break;
        case "calc":
          try {
            // Safe-ish eval — arithmetic only
            const expr = args.join(" ");
            if (/^[0-9+\-*/().\s]+$/.test(expr)) {
              // eslint-disable-next-line @typescript-eslint/no-implied-eval
              const result = Function(`"use strict"; return (${expr})`)();
              newLines.push({ type: "output", text: String(result) });
            } else {
              newLines.push({ type: "error", text: "calc: invalid expression" });
            }
          } catch {
            newLines.push({ type: "error", text: "calc: error" });
          }
          break;
        case "windows":
          newLines.push({ type: "output", text: "Currently open windows:" });
          Object.values(APP_REGISTRY).forEach((a) => newLines.push({ type: "output", text: `  ${a.id}` }));
          break;
        case "history":
          history.forEach((h, i) => newLines.push({ type: "output", text: `  ${i + 1}  ${h}` }));
          break;
        default:
          newLines.push({ type: "error", text: `command not found: ${cmd}. Type 'help'.` });
      }

      setLines((prev) => [...prev, ...newLines]);
    },
    [openWindow, closeWindow, setMode, history]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (input.trim()) setHistory((p) => [input, ...p]);
      processCommand(input);
      setInput("");
      setHistoryIndex(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const i = historyIndex + 1;
        setHistoryIndex(i);
        setInput(history[i]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const i = historyIndex - 1;
        setHistoryIndex(i);
        setInput(history[i]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  const getColor = (type: Line["type"]) => {
    if (type === "error") return "#ef4444";
    if (type === "orange") return "#ff7a3a";
    if (type === "input") return "#ff9b5c";
    return "#e8a870";
  };

  return (
    <div
      className="-mx-5 -my-4 flex h-[calc(100%+32px)] flex-col font-mono"
      style={{ background: "#1a0e06" }}
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="custom-scrollbar flex-1 overflow-y-auto px-4 pt-3 pb-1">
        {lines.map((line, i) => (
          <div
            key={i}
            className="whitespace-pre-wrap text-[12.5px] leading-[1.5]"
            style={{ color: getColor(line.type), fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
          >
            {line.text}
          </div>
        ))}
        <div className="flex items-center text-[12.5px]" style={{ color: "#ff9b5c", fontFamily: "var(--font-geist-mono), monospace" }}>
          <span>{PROMPT}&nbsp;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[12.5px] outline-none"
            style={{ color: "#ffb07a", fontFamily: "var(--font-geist-mono), monospace" }}
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
