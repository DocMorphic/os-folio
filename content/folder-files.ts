// Desktop photo folders — user can edit filenames + trip text here.
// Drop images in public/photos/{folderId}/ and list them in `items`.

export interface FolderItem {
  name: string;
  type: "text" | "image";
  src?: string;
}

export interface FolderData {
  label: string;
  description: string;
  text: string;
  items: FolderItem[];
}

export const FOLDER_CONTENTS: Record<string, FolderData> = {
  germany: {
    label: "germany",
    description: "Photos and notes from life and trips around Germany.",
    text: `# Germany

Photos since I moved to Germany for the first time in August 2025.
`,
    items: [
      { name: "germany-notes.txt", type: "text" },
      { name: "germany-1.jpg", type: "image", src: "/photos/germany/germany-1.jpg" },
      { name: "germany-2.jpg", type: "image", src: "/photos/germany/germany-2.jpg" },
      { name: "germany-3.jpg", type: "image", src: "/photos/germany/germany-3.jpg" },
      { name: "germany-4.jpg", type: "image", src: "/photos/germany/germany-4.jpg" },
      { name: "germany-5.jpg", type: "image", src: "/photos/germany/germany-5.jpg" },
      { name: "germany-6.jpg", type: "image", src: "/photos/germany/germany-6.jpg" },
      { name: "germany-7.jpg", type: "image", src: "/photos/germany/germany-7.jpg" },
      { name: "germany-8.jpg", type: "image", src: "/photos/germany/germany-8.jpg" },
      { name: "germany-9.jpg", type: "image", src: "/photos/germany/germany-9.jpg" },
      { name: "germany-10.jpg", type: "image", src: "/photos/germany/germany-10.jpg" },
    ],
  },
  austria: {
    label: "austria",
    description: "Photos and notes from trips around Austria.",
    text: `# Austria

Photos from when I went to Salzburg in November 2025.
`,
    items: [
      { name: "austria-notes.txt", type: "text" },
      { name: "austria-1.jpg", type: "image", src: "/photos/austria/austria-1.jpg" },
      { name: "austria-2.jpg", type: "image", src: "/photos/austria/austria-2.jpg" },
      { name: "austria-3.jpg", type: "image", src: "/photos/austria/austria-3.jpg" },
      { name: "austria-4.jpg", type: "image", src: "/photos/austria/austria-4.jpg" },
    ],
  },
  india: {
    label: "india",
    description: "Photos and memories from home — Rajkot and beyond.",
    text: `# India

Photos from India, Gujarat especially, where I've spent most of my life.
`,
    items: [
      { name: "india-notes.txt", type: "text" },
      { name: "india-1.jpg", type: "image", src: "/photos/india/india-1.jpg" },
      { name: "india-2.jpg", type: "image", src: "/photos/india/india-2.jpg" },
      { name: "india-3.jpg", type: "image", src: "/photos/india/india-3.jpg" },
      { name: "india-4.jpg", type: "image", src: "/photos/india/india-4.jpg" },
      { name: "india-5.jpg", type: "image", src: "/photos/india/india-5.jpg" },
      { name: "india-6.jpg", type: "image", src: "/photos/india/india-6.jpg" },
      { name: "india-7.jpg", type: "image", src: "/photos/india/india-7.jpg" },
      { name: "india-8.jpg", type: "image", src: "/photos/india/india-8.jpg" },
      { name: "india-9.jpg", type: "image", src: "/photos/india/india-9.jpg" },
    ],
  },
};
