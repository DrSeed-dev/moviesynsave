"use client";

import { UploadIcon } from "@/components/icons";

type FilePickerProps = {
  onSelect: (file: File) => void;
  accept?: string;
  title?: string;
  hint?: string;
};

export function FilePicker({
  onSelect,
  accept = "video/*",
  title = "Choose a video",
  hint = "MP4, MOV, WebM and more",
}: FilePickerProps) {
  return (
    <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-300 px-4 py-8 text-center transition-colors hover:border-neutral-500 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-600 dark:border-neutral-700 dark:hover:border-neutral-500">
      <UploadIcon className="h-8 w-8 text-neutral-500" />
      <span className="font-medium">{title}</span>
      <span className="text-sm text-neutral-500">{hint}</span>
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelect(file);
          // Reset so choosing the same file again still triggers onChange.
          event.target.value = "";
        }}
      />
    </label>
  );
}