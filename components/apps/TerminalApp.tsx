"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useWindowManager } from "@/hooks/use-window-manager";
import { useTheme } from "@/hooks/use-theme";
import { APP_REGISTRY } from "@/lib/constants";
import { ABOUT_TXT, BUILD_LOG_MD } from "@/content/text-files";
import { FOLDER_CONTENTS } from "@/content/folder-files";
import { projects } from "@/content/projects";
import { experience } from "@/content/experience";
import { blogPosts } from "@/content/blog-posts";
import { aboutData } from "@/content/about";

const PROMPT = "dharmay@portfolio:~$";

const COMMANDS: Array<[string, string]> = [
  ["apps", "List all available apps you can open."],
  ["blog", "List blog posts."],
  ["calc <expression>", "Evaluate a math expression."],
  ["cat <file>", "Print contents of a text file."],
  ["clear", "Clear the terminal output."],
  ["close <app-id>", "Close a window by app id."],
  ["coffee", "Get a coffee ☕"],
  ["contact", "Open the contact window."],
  ["credits", "Show credits and acknowledgements."],
  ["date", "Show the current date."],
  ["echo <text>", "Print any text back to the terminal."],
  ["email", "Open mailto link."],
  ["exit", "Close the terminal."],
  ["experience", "List career experience."],
  ["folders", "List desktop folders."],
  ["fortune", "Random developer quote."],
  ["github", "Open GitHub profile."],
  ["hello", "Say hi."],
  ["help", "List every available command."],
  ["history", "Show recently executed commands."],
  ["joke", "Print a random developer joke."],
  ["linkedin", "Open LinkedIn profile."],
  ["ls [apps|folders|files]", "List terminal resources."],
  ["matrix", "Enter the matrix."],
  ["neofetch", "Print system info."],
  ["open <app-id>", "Open or focus an app window."],
  ["projects", "List all projects."],
  ["pwd", "Print the current desktop path."],
  ["quit", "Close the terminal."],
  ["status", "Show terminal and workspace status."],
  ["sudo <command>", "Become root."],
  ["theme <dark|light>", "Switch theme."],
  ["time", "Show the current local time."],
  ["tip", "Show a quick productivity hint."],
  ["uuid", "Generate a random UUID."],
  ["version", "Show terminal version details."],
  ["whoami", "Show your current terminal identity."],
  ["windows", "List currently open app windows."],
];

const JOKES = [
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "I'd tell you a UDP joke, but you might not get it.",
  "There are 10 types of people: those who understand binary and those who don't.",
  "A SQL query walks into a bar, walks up to two tables and asks: 'can I join you?'",
  "Why do Java developers wear glasses? Because they don't C#.",
];

const FORTUNES = [
  "The best error message is the one that never shows up.",
  "Code is read much more often than it is written.",
  "First, solve the problem. Then, write the code.",
  "Make it work, make it right, make it fast.",
  "Simplicity is the ultimate sophistication.",
  "Talk is cheap. Show me the code. — Linus Torvalds",
  "Perfection is achieved when there is nothing left to take away.",
];

const TIPS = [
  "Press Cmd+K to open Search from anywhere.",
  "Press Esc to close the focused window.",
  "Drag a window from its title bar to move it.",
  "Click the logo in the menu bar to see site stats.",
  "Type 'help' to see every command available.",
];

interface Line {
  type: "output" | "input" | "error" | "orange" | "green";
  text: string;
}

export function TerminalApp() {
  const greeting: Line[] = [
    { type: "orange", text: "Dharmay Dave — Portfolio Terminal v1.2" },
    { type: "output", text: "Type 'help' to list all available commands." },
    { type: "output", text: "Try: projects, cat about.txt, matrix, fortune" },
    { type: "output", text: "" },
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

  const runMatrix = useCallback(() => {
    const chars = "01";
    const frames: Line[] = [];
    for (let i = 0; i < 8; i++) {
      let line = "";
      for (let j = 0; j < 56; j++) {
        line += Math.random() > 0.5 ? chars[Math.floor(Math.random() * 2)] : " ";
      }
      frames.push({ type: "green", text: line });
    }
    frames.push({ type: "green", text: "" });
    frames.push({ type: "orange", text: "Wake up, Neo..." });
    frames.push({ type: "output", text: "" });
    setLines((prev) => [...prev, { type: "input", text: `${PROMPT} matrix` }, ...frames]);
  }, []);

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
            newLines.push({ type: "output", text: `  ${c.padEnd(26)} ${d}` })
          );
          newLines.push({ type: "output", text: "" });
          break;

        case "apps":
          newLines.push({ type: "output", text: "Available apps:" });
          Object.values(APP_REGISTRY)
            .filter((a) => a.showInExplorer)
            .forEach((a) =>
              newLines.push({ type: "output", text: `  ${a.id.padEnd(14)} ${a.title}` })
            );
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

        case "cat":
          if (!args[0]) {
            newLines.push({ type: "error", text: "usage: cat <file>" });
          } else {
            const file = args[0].toLowerCase();
            if (file === "about.txt" || file === "about") {
              ABOUT_TXT.split("\n").forEach((l) =>
                newLines.push({ type: "output", text: l })
              );
            } else if (file === "build-log.md" || file === "build-log") {
              BUILD_LOG_MD.split("\n").forEach((l) =>
                newLines.push({ type: "output", text: l })
              );
            } else if (
              file.startsWith("germany") ||
              file.startsWith("austria") ||
              file.startsWith("india")
            ) {
              const folderId = file.split(/[-.]/)[0];
              const folder = FOLDER_CONTENTS[folderId];
              if (folder) {
                folder.text.split("\n").forEach((l) =>
                  newLines.push({ type: "output", text: l })
                );
              } else {
                newLines.push({ type: "error", text: `cat: ${args[0]}: No such file` });
              }
            } else {
              newLines.push({ type: "error", text: `cat: ${args[0]}: No such file` });
            }
          }
          break;

        case "projects":
          newLines.push({ type: "output", text: "Projects:" });
          projects.forEach((p) =>
            newLines.push({
              type: "output",
              text: `  ${p.title.padEnd(24)} ${p.year}  ${p.tags.slice(0, 3).join(", ")}`,
            })
          );
          newLines.push({ type: "output", text: "" });
          newLines.push({ type: "output", text: "Type 'open works' to see the full timeline." });
          break;

        case "experience":
          newLines.push({ type: "output", text: "Career timeline:" });
          experience.forEach((e) =>
            newLines.push({
              type: "output",
              text: `  ${e.role.padEnd(28)} ${e.company.padEnd(20)} ${e.startDate} – ${e.endDate}`,
            })
          );
          break;

        case "blog":
          newLines.push({ type: "output", text: "Blog posts:" });
          blogPosts.forEach((p) =>
            newLines.push({ type: "output", text: `  - ${p.title}` })
          );
          break;

        case "folders":
          newLines.push({ type: "output", text: "Desktop folders:" });
          Object.values(FOLDER_CONTENTS).forEach((f) =>
            newLines.push({
              type: "output",
              text: `  ${f.label.padEnd(12)} ${f.items.length} items`,
            })
          );
          break;

        case "contact":
          openWindow("contact");
          newLines.push({ type: "output", text: "→ opened contact" });
          break;

        case "credits":
          newLines.push({ type: "output", text: "" });
          newLines.push({ type: "orange", text: "  credits" });
          newLines.push({ type: "output", text: "  ─────────────────────────────" });
          newLines.push({ type: "output", text: "  design inspired by Wes Dieleman" });
          newLines.push({ type: "output", text: "  https://wesdieleman.com" });
          newLines.push({ type: "output", text: "" });
          newLines.push({ type: "output", text: "  built by Dharmay Dave, 2026" });
          newLines.push({ type: "output", text: "  Next.js · React · Tailwind · Supabase" });
          newLines.push({ type: "output", text: "" });
          break;

        case "github":
          newLines.push({ type: "output", text: aboutData.socials.github });
          if (typeof window !== "undefined") window.open(aboutData.socials.github, "_blank");
          break;

        case "linkedin":
          newLines.push({ type: "output", text: aboutData.socials.linkedin });
          if (typeof window !== "undefined") window.open(aboutData.socials.linkedin, "_blank");
          break;

        case "email":
          newLines.push({ type: "output", text: aboutData.socials.email });
          if (typeof window !== "undefined")
            window.location.href = `mailto:${aboutData.socials.email}`;
          break;

        case "matrix":
          runMatrix();
          return;

        case "coffee":
          newLines.push({ type: "output", text: "" });
          newLines.push({ type: "orange", text: "       )  (" });
          newLines.push({ type: "orange", text: "      (   ) )" });
          newLines.push({ type: "orange", text: "       ) ( (" });
          newLines.push({ type: "output", text: "    _______)_" });
          newLines.push({ type: "output", text: " .-'---------|" });
          newLines.push({ type: "output", text: "( C|/\\/\\/\\/\\/|" });
          newLines.push({ type: "output", text: " '-./\\/\\/\\/\\/|" });
          newLines.push({ type: "output", text: "   '_________'" });
          newLines.push({ type: "output", text: "    '-------'" });
          newLines.push({ type: "output", text: "" });
          newLines.push({ type: "output", text: "Here's your coffee ☕" });
          break;

        case "fortune":
          newLines.push({
            type: "output",
            text: FORTUNES[Math.floor(Math.random() * FORTUNES.length)],
          });
          break;

        case "sudo":
          newLines.push({ type: "output", text: "nice try 😉" });
          break;

        case "hello":
        case "hi":
          newLines.push({ type: "output", text: "hey! 👋 welcome to my portfolio." });
          break;

        case "exit":
        case "quit":
          closeWindow("terminal");
          return;

        case "whoami":
          newLines.push({ type: "output", text: "dharmay" });
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
          newLines.push({ type: "output", text: "Portfolio Terminal v1.2" });
          break;

        case "status":
          newLines.push({ type: "output", text: "workspace: active · terminal: ready" });
          break;

        case "uuid":
          newLines.push({ type: "output", text: crypto.randomUUID() });
          break;

        case "joke":
          newLines.push({
            type: "output",
            text: JOKES[Math.floor(Math.random() * JOKES.length)],
          });
          break;

        case "tip":
          newLines.push({
            type: "output",
            text: TIPS[Math.floor(Math.random() * TIPS.length)],
          });
          break;

        case "theme":
          if (args[0] === "dark" || args[0] === "light") {
            setMode(args[0]);
            newLines.push({ type: "output", text: `→ theme set to ${args[0]}` });
          } else newLines.push({ type: "error", text: "usage: theme <dark|light>" });
          break;

        case "ls":
          if (!args[0] || args[0] === "apps") {
            Object.values(APP_REGISTRY)
              .filter((a) => a.showInExplorer)
              .forEach((a) => newLines.push({ type: "output", text: `  ${a.id}` }));
          } else if (args[0] === "folders") {
            Object.values(FOLDER_CONTENTS).forEach((f) =>
              newLines.push({ type: "output", text: `  ${f.label}` })
            );
          } else if (args[0] === "files") {
            ["about.txt", "build-log.md", "germany.txt", "austria.txt", "india.txt"].forEach(
              (f) => newLines.push({ type: "output", text: `  ${f}` })
            );
          } else {
            newLines.push({ type: "error", text: `ls: unknown target '${args[0]}'` });
          }
          break;

        case "calc":
          try {
            const expr = args.join(" ");
            if (/^[0-9+\-*/().\s]+$/.test(expr)) {
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
          newLines.push({ type: "output", text: "Known apps (open to toggle):" });
          Object.values(APP_REGISTRY).forEach((a) =>
            newLines.push({ type: "output", text: `  ${a.id}` })
          );
          break;

        case "history":
          history.forEach((h, i) =>
            newLines.push({ type: "output", text: `  ${i + 1}  ${h}` })
          );
          break;

        case "neofetch":
          newLines.push({ type: "output", text: "" });
          newLines.push({ type: "orange", text: "  ┌─────────────────────┐" });
          newLines.push({ type: "orange", text: "  │   OS-FOLIO v1.2     │" });
          newLines.push({ type: "orange", text: "  └─────────────────────┘" });
          newLines.push({ type: "output", text: "  User:    dharmay" });
          newLines.push({ type: "output", text: "  OS:      os-folio" });
          newLines.push({ type: "output", text: "  Shell:   portfolio-terminal" });
          newLines.push({ type: "output", text: "  Engine:  Next.js + React 19" });
          newLines.push({ type: "output", text: "  Theme:   Tailwind CSS 4" });
          newLines.push({ type: "output", text: "  Host:    Munich, Germany" });
          newLines.push({ type: "output", text: "" });
          break;

        default:
          // rm -rf / joke
          if (raw.trim() === "rm -rf /" || raw.trim() === "rm -rf /*") {
            newLines.push({ type: "error", text: "don't be scary 😅" });
            break;
          }
          newLines.push({
            type: "error",
            text: `${cmd}: command not found. Type 'help'.`,
          });
      }

      setLines((prev) => [...prev, ...newLines]);
    },
    [openWindow, closeWindow, setMode, history, runMatrix]
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
    if (type === "green") return "#5fa85f";
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
            style={{
              color: getColor(line.type),
              fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            }}
          >
            {line.text}
          </div>
        ))}
        <div
          className="flex items-center text-[12.5px]"
          style={{
            color: "#ff9b5c",
            fontFamily: "var(--font-geist-mono), monospace",
          }}
        >
          <span>{PROMPT}&nbsp;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[12.5px] outline-none"
            style={{
              color: "#ffb07a",
              fontFamily: "var(--font-geist-mono), monospace",
            }}
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
