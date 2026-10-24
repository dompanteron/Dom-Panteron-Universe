"use client";

import { useEffect } from "react";

export default function AdminModal({
  open,
  title,
  onClose,
  children
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <button
        type="button"
        aria-label="Close dialog"
        className="fixed inset-0 bg-black/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className="relative z-10 my-auto w-full max-w-3xl border border-white/15 bg-panteron-black shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <h2 id="admin-modal-title" className="font-display text-xl sm:text-2xl">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            Close
          </button>
        </div>
        <div className="max-h-[min(80vh,48rem)] overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
