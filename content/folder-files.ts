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
    description: "Photos and notes from trips around Germany.",
    text: `# Germany

{{TODO: Write your trip notes here. Where did you go, what did you see, what do you remember?}}
`,
    items: [
      { name: "germany-notes.txt", type: "text" },
      // Drop photos in public/photos/germany/ and add them here:
      // { name: "munich-1.jpg", type: "image", src: "/photos/germany/munich-1.jpg" },
    ],
  },
  austria: {
    label: "austria",
    description: "Photos and notes from trips around Austria.",
    text: `# Austria

{{TODO: Your Austria trip notes. Vienna? Salzburg? Alps? Write whatever you want here.}}
`,
    items: [
      { name: "austria-notes.txt", type: "text" },
      // Drop photos in public/photos/austria/ and add them here:
      // { name: "vienna-1.jpg", type: "image", src: "/photos/austria/vienna-1.jpg" },
    ],
  },
  india: {
    label: "india",
    description: "Photos and memories from home.",
    text: `# India

{{TODO: Your India notes. Rajkot, family, growing up, whatever you want to share.}}
`,
    items: [
      { name: "india-notes.txt", type: "text" },
      // Drop photos in public/photos/india/ and add them here:
      // { name: "rajkot-1.jpg", type: "image", src: "/photos/india/rajkot-1.jpg" },
    ],
  },
};
