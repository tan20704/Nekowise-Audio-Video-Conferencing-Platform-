import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

export default function Chat({
  signaling,
  currentUser,
  isOpen,
  onToggle,
  initialMessages = [],
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load initial messages (chat history)
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      const formattedMessages = initialMessages.map((msg) => ({
        id: msg.messageId || msg._id,
        userId: msg.userId,
        username: msg.username,
        text: msg.text,
        timestamp: new Date(msg.timestamp).getTime(),
        own: msg.userId === currentUser?.id,
      }));
      setMessages(formattedMessages);
    }
  }, [initialMessages, currentUser]);

  useEffect(() => {
    if (!signaling) return;

    const unsubscribeMessage = signaling.onMessage("chat-message", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          id: msg.messageId || Date.now(),
          userId: msg.fromUserId,
          username: msg.fromUsername,
          text: msg.text,
          timestamp: msg.timestamp || Date.now(),
        },
      ]);
    });

    const unsubscribeTyping = signaling.onMessage("typing", (msg) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (msg.isTyping) {
          newSet.add(msg.username);
        } else {
          newSet.delete(msg.username);
        }
        return newSet;
      });

      // Auto-clear typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(msg.username);
          return newSet;
        });
      }, 3000);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [signaling]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !signaling) return;

    signaling.sendMessage({
      type: "chat-message",
      text: inputMessage.trim(),
    });

    // Add own message immediately for better UX
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        userId: currentUser?.id,
        username: "You",
        text: inputMessage.trim(),
        timestamp: Date.now(),
        own: true,
      },
    ]);

    setInputMessage("");

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    signaling.sendMessage({
      type: "typing",
      isTyping: false,
    });
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    if (!signaling) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    signaling.sendMessage({
      type: "typing",
      isTyping: true,
    });

    // Stop typing indicator after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      signaling.sendMessage({
        type: "typing",
        isTyping: false,
      });
    }, 2000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-24 right-6 bg-primary hover:bg-primary/90 text-on-primary rounded-full p-4 shadow-lg transition-all z-40"
        title="Open Chat"
      >
        <span className="text-2xl">💬</span>
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {messages.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-surface/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col z-40 border border-outline">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-outline">
        <h3 className="text-on-surface font-semibold flex items-center gap-2">
          <span className="text-xl">💬</span>
          Chat
        </h3>
        <button
          onClick={onToggle}
          className="text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="text-xl">✕</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-on-surface-variant text-center text-sm py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.own ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
                  msg.own
                    ? "bg-primary text-on-primary"
                    : "bg-surface-variant text-on-surface-variant"
                }`}
              >
                {!msg.own && (
                  <div className="text-xs text-on-surface-variant/70 mb-1 font-medium">
                    {msg.username}
                  </div>
                )}
                <div className="text-sm wrap-break-word">{msg.text}</div>
                <div
                  className={`text-xs mt-1 ${
                    msg.own
                      ? "text-on-primary/70"
                      : "text-on-surface-variant/70"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <div className="px-4 py-2 text-xs text-on-surface-variant italic">
          {Array.from(typingUsers).join(", ")}{" "}
          {typingUsers.size === 1 ? "is" : "are"} typing...
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-outline">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 bg-surface-variant text-on-surface px-4 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary border-0"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="bg-primary hover:bg-primary/90 disabled:bg-surface-variant disabled:cursor-not-allowed disabled:text-on-surface-variant text-on-primary px-4 py-2 rounded-2xl transition-all font-medium shadow-sm"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

Chat.propTypes = {
  signaling: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  initialMessages: PropTypes.array,
};
