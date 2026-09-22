import type { Metadata } from "next";
import { BlogManager } from "./BlogManager";

export const metadata: Metadata = { title: "Manage blogs · Dharmay Dave", robots: { index: false, follow: false } };

export default function BlogAdminPage() {
  return <BlogManager />;
}
