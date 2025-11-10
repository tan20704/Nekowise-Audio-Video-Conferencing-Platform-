import { Video } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-surface mt-auto">
      <div className="container mx-auto px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary text-3xl">
            hub
          </span>
          <span className="text-xl font-semibold font-display">Nekowise</span>
        </div>
        <p className="text-sm text-on-surface-variant">
          &copy; 2025 Nekowise. High-quality video conferencing powered by
          WebRTC.
        </p>
      </div>
    </footer>
  );
}
