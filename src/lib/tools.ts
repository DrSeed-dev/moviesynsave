// The list of tools. The home page and the header both read from this, so
// adding a tool later means adding one entry here.

export type Tool = {
  href: string;
  title: string;
  shortTitle: string; // used in the header, where space is tight
  description: string;
};

export const TOOLS: Tool[] = [
  {
    href: "/compress",
    title: "Compress video",
    shortTitle: "Compress",
    description:
      "Make a video smaller so it is easier to share. Choose Smallest, Balanced or Best quality.",
  },
  {
    href: "/extract-audio",
    title: "Extract audio",
    shortTitle: "Extract audio",
    description: "Turn any video into an MP3.",
  },
];