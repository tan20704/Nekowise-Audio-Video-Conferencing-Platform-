import { useState } from "react";

const REACTION_EMOJIS = ["👍", "👏", "❤️", "😂", "🎉", "🔥", "👎", "🤔"];

export default function ReactionPicker({ onReaction, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleReaction = (emoji) => {
    onReaction(emoji);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 rounded-full bg-surface-variant hover:bg-primary-container/50 text-on-surface transition-colors text-2xl shadow-sm"
        title="Send Reaction"
      >
        😊
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Reaction Panel */}
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-surface rounded-2xl shadow-xl p-2 z-50 border border-outline">
            <div className="flex gap-1">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-3xl p-2 hover:bg-primary-container/50 rounded-2xl transition-all hover:scale-110"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
