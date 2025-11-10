import { useEffect, useState } from "react";

export default function ReactionOverlay({ reactions }) {
  const [displayReactions, setDisplayReactions] = useState([]);

  useEffect(() => {
    // Convert reactions Map to array and add animation data
    const reactionArray = Array.from(reactions.entries()).map(
      ([userId, data]) => ({
        id: `${userId}-${data.timestamp}`,
        emoji: data.emoji,
        username: data.username,
        timestamp: data.timestamp,
      })
    );

    setDisplayReactions(reactionArray);

    // Auto-remove reactions after 3 seconds
    const timeout = setTimeout(() => {
      setDisplayReactions((prev) =>
        prev.filter((r) => Date.now() - r.timestamp < 3000)
      );
    }, 100);

    return () => clearTimeout(timeout);
  }, [reactions]);

  if (displayReactions.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {displayReactions.map((reaction, index) => (
        <FloatingReaction
          key={reaction.id}
          emoji={reaction.emoji}
          username={reaction.username}
          index={index}
        />
      ))}
    </div>
  );
}

function FloatingReaction({ emoji, username, index }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 50);

    // Remove after 3 seconds
    const timeout = setTimeout(() => setIsVisible(false), 3000);

    return () => clearTimeout(timeout);
  }, []);

  // Random horizontal position
  const leftPosition = 20 + ((index * 15) % 60);

  return (
    <div
      className={`absolute bottom-0 transition-all duration-3000 ease-out ${
        isVisible ? "opacity-0 -translate-y-96" : "opacity-100 translate-y-0"
      }`}
      style={{
        left: `${leftPosition}%`,
        transform: `translateX(-50%) ${
          isVisible ? "translateY(-384px)" : "translateY(0)"
        }`,
      }}
    >
      <div className="flex flex-col items-center">
        <div className="text-6xl mb-2 animate-bounce">{emoji}</div>
        <div className="bg-surface/90 backdrop-blur-sm text-on-surface text-xs px-3 py-1 rounded-full shadow-md">
          {username}
        </div>
      </div>
    </div>
  );
}
