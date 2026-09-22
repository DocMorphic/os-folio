"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { BlogEntry } from "@/lib/blogs-store";
import styles from "./page.module.css";

export function BlogManager() {
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [blogs, setBlogs] = useState<BlogEntry[]>([]);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadBlogs() {
    const response = await fetch("/api/blogs", { cache: "no-store" });
    if (!response.ok) throw new Error("Couldn't load blogs.");
    const data = await response.json();
    setBlogs(data.blogs ?? []);
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/blogs/admin", { cache: "no-store", signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("Couldn't check owner access. Please reload.");
      const data = await response.json();
      if (controller.signal.aborted) return;
      setConfigured(data.configured);
      setAuthenticated(data.authenticated);
      if (data.authenticated) await loadBlogs();
    }).catch(error => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  async function remove(blog: BlogEntry) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/blogs", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: blog.id }) });
      const data = await response.json();
      if (response.status === 401) setAuthenticated(false);
      if (!response.ok) throw new Error(data.error || "Couldn't delete the blog.");
      setBlogs(current => current.filter(entry => entry.id !== blog.id));
      setConfirm(null);
      setNotice(`Deleted “${blog.title}”.`);
    } catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }

  return <main className={styles.page}><div className={styles.panel}>
    <header><Link href="/">← Portfolio</Link><span>OWNER’S DESK</span></header>
    <h1>Manage blogs</h1><p className={styles.subtitle}>Keep the shelf full of good reads.</p>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {notice && <p role="status" className={styles.notice}>{notice}</p>}
    {loading ? <p role="status">Checking access…</p> : !configured ? <div className={styles.setup}>
      <h2>One-time setup needed</h2>
      <p>Add <code>BLOG_ADMIN_PASSWORD</code> (a password of your choice) and <code>SUPABASE_SERVICE_ROLE_KEY</code> in your Vercel project’s server environment, then redeploy.</p>
      <p>Keep both private. Do not use a <code>NEXT_PUBLIC_</code> prefix.</p>
    </div> : !authenticated ? <form onSubmit={async event => {
      event.preventDefault(); setBusy(true); setError(""); setNotice("");
      try {
        const response = await fetch("/api/blogs/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Couldn't sign in.");
        setPassword(""); setAuthenticated(true); await loadBlogs();
      } catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
      finally { setBusy(false); }
    }}>
      <label htmlFor="owner-password">Owner password</label>
      <input id="owner-password" type="password" autoComplete="current-password" required maxLength={512} value={password} onChange={event => setPassword(event.target.value)} />
      <button disabled={busy}>{busy ? "Signing in…" : "Unlock management"}</button>
      <p className={styles.hint}>Owner-only access. Your session expires after one hour.</p>
    </form> : <>
      <div className={styles.toolbar}><span>{blogs.length} blogs</span><button disabled={busy} onClick={async () => {
        setBusy(true); setError("");
        try {
          const response = await fetch("/api/blogs/admin", { method: "DELETE" });
          if (!response.ok) throw new Error("Couldn't sign out. Please try again.");
          setAuthenticated(false); setBlogs([]); setConfirm(null); setNotice("");
        } catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
        finally { setBusy(false); }
      }}>Lock / sign out</button></div>
      <ul className={styles.list}>{blogs.map(blog => <li key={blog.id}>
        <div className={styles.row}><div><h2>{blog.title}</h2><p>{blog.url}</p></div><button className={styles.delete} disabled={busy} aria-label={`Delete ${blog.title}`} onClick={() => { setConfirm(blog.id); setNotice(""); }}>Delete</button></div>
        {confirm === blog.id && <div className={styles.confirm}>
          <p>Delete “{blog.title}” from the desktop and vending machine? This permanently removes the saved link, not the original article.</p>
          <div><button disabled={busy} onClick={() => setConfirm(null)}>Cancel</button><button className={styles.delete} disabled={busy} onClick={() => void remove(blog)}>{busy ? "Deleting…" : "Yes, delete"}</button></div>
        </div>}
      </li>)}</ul>
      {blogs.length === 0 && <p>The shelf is empty.</p>}
    </>}
  </div></main>;
}
