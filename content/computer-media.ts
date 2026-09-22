export type ComputerMedia = {
  code: string;
  title: string;
  src: string;
  kind: "video" | "audio";
};

// Add the owner's chosen code and /media/... asset here. These are playful
// client-side Easter eggs, not passwords or access controls.
export const computerMedia: ComputerMedia[] = [];
