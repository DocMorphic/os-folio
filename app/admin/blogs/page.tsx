import type { Metadata } from "next";
import { Desktop } from "@/components/desktop/Desktop";

export const metadata: Metadata = { title: "Manage blogs · Dharmay Dave", robots: { index: false, follow: false } };

export default function BlogAdminPage() {
  return <Desktop initialBlogManagement />;
}
