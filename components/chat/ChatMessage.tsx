"use client";

import type { ReactNode } from "react";
import { ChatAvatar, type ChatAvatarRole } from "@/components/chat/ChatAvatar";
import "./chat-message.css";

type ChatMessageProps = {
  role: ChatAvatarRole;
  children: ReactNode;
  className?: string;
  /** Hide avatars on advisor landing; show once chat mode is active. */
  showAvatar?: boolean;
};

export function ChatMessage({
  role,
  children,
  className = "",
  showAvatar = true,
}: ChatMessageProps) {
  if (!showAvatar) {
    return (
      <div
        className={`chat-message chat-message--${role} chat-message--no-avatar ${className}`.trim()}
      >
        <div className="chat-message__body">{children}</div>
      </div>
    );
  }

  return (
    <div className={`chat-message chat-message--${role} ${className}`.trim()}>
      <div className="chat-message__row">
        <ChatAvatar role={role} />
        <div className="chat-message__body">{children}</div>
      </div>
    </div>
  );
}

export { ChatAvatar };
