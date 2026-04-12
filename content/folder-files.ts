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

{{TODO: Write your trip notes here. Where did you go, what did you see, what do you remember?}}
`,
    items: [
      { name: "germany-notes.txt", type: "text" },
      { name: "PXL_20250930_125739647.jpg", type: "image", src: "/photos/germany/PXL_20250930_125739647.jpg" },
      { name: "PXL_20251006_095645001.jpg", type: "image", src: "/photos/germany/PXL_20251006_095645001.jpg" },
      { name: "PXL_20251019_152613964.jpg", type: "image", src: "/photos/germany/PXL_20251019_152613964.jpg" },
      { name: "PXL_20251206_142934493.jpg", type: "image", src: "/photos/germany/PXL_20251206_142934493.jpg" },
      { name: "PXL_20251206_145819100.jpg", type: "image", src: "/photos/germany/PXL_20251206_145819100.jpg" },
      { name: "PXL_20251206_145828605.jpg", type: "image", src: "/photos/germany/PXL_20251206_145828605.jpg" },
      { name: "PXL_20251206_150917316.jpg", type: "image", src: "/photos/germany/PXL_20251206_150917316.jpg" },
      { name: "PXL_20251218_094628184.jpg", type: "image", src: "/photos/germany/PXL_20251218_094628184.jpg" },
      { name: "PXL_20251218_135447033.jpg", type: "image", src: "/photos/germany/PXL_20251218_135447033.jpg" },
      { name: "PXL_20251224_152347298.jpg", type: "image", src: "/photos/germany/PXL_20251224_152347298.jpg" },
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
      { name: "PXL_20251108_105236468.jpg", type: "image", src: "/photos/austria/PXL_20251108_105236468.jpg" },
      { name: "PXL_20251108_111813223.jpg", type: "image", src: "/photos/austria/PXL_20251108_111813223.jpg" },
      { name: "PXL_20251108_125833823.jpg", type: "image", src: "/photos/austria/PXL_20251108_125833823.jpg" },
      { name: "PXL_20251218_132713189.jpg", type: "image", src: "/photos/austria/PXL_20251218_132713189.jpg" },
    ],
  },
  india: {
    label: "india",
    description: "Photos and memories from home — Rajkot and beyond.",
    text: `# India

{{TODO: Your India notes. Rajkot, family, growing up, whatever you want to share.}}
`,
    items: [
      { name: "india-notes.txt", type: "text" },
      { name: "PXL_20230530_092649732.jpg", type: "image", src: "/photos/india/PXL_20230530_092649732.jpg" },
      { name: "PXL_20230531_070720136.jpg", type: "image", src: "/photos/india/PXL_20230531_070720136.jpg" },
      { name: "PXL_20230601_060150566.jpg", type: "image", src: "/photos/india/PXL_20230601_060150566.jpg" },
      { name: "PXL_20230601_061202253.jpg", type: "image", src: "/photos/india/PXL_20230601_061202253.jpg" },
      { name: "PXL_20240825_094907001.jpg", type: "image", src: "/photos/india/PXL_20240825_094907001.jpg" },
      { name: "PXL_20241026_060325028.jpg", type: "image", src: "/photos/india/PXL_20241026_060325028.jpg" },
      { name: "PXL_20250517_084856833.jpg", type: "image", src: "/photos/india/PXL_20250517_084856833.jpg" },
      { name: "PXL_20250517_090221925.jpg", type: "image", src: "/photos/india/PXL_20250517_090221925.jpg" },
      { name: "PXL_20250517_093848608.jpg", type: "image", src: "/photos/india/PXL_20250517_093848608.jpg" },
    ],
  },
};
