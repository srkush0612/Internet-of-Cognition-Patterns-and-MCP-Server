"use client";

import { ChatAvatar } from "@/components/chat/ChatAvatar";
import "./chat-micro-interactions.css";
import "./chat-loading-message.css";
import "./chat-message.css";

type ChatLoadingMessageProps = {
  label?: string;
  showAvatar?: boolean;
};

export function ChatLoadingMessage({
  label = "Analyzing your scenario",
  showAvatar = true,
}: ChatLoadingMessageProps) {
  return (
    <div
      className="chat-loading-message"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {showAvatar ? <ChatAvatar role="assistant" animated /> : null}
      <div className="chat-loading-message__text">
        {label}
        <span className="chat-loading-message__dots" aria-hidden>
          <span className="chat-loading-message__dot" />
          <span className="chat-loading-message__dot chat-loading-message__dot--2" />
          <span className="chat-loading-message__dot chat-loading-message__dot--3" />
        </span>
      </div>
    </div>
  );
}
