"use client";

import { Sparkles, User } from "lucide-react";
import "./chat-message.css";

export type ChatAvatarRole = "user" | "assistant";

type ChatAvatarProps = {
  role: ChatAvatarRole;
  /** Pulse animation for loading/thinking states. */
  animated?: boolean;
};

const AVATAR_ICON_SIZE = 16;
const AVATAR_ICON_STROKE = 2.25;

/** Circular avatar for chat roles — lucide icons matching Tabler ti-user / ti-sparkles. */
export function ChatAvatar({ role, animated = false }: ChatAvatarProps) {
  const isUser = role === "user";
  const iconColor = isUser ? "#187adc" : "#7c3aed";

  return (
    <span
      className={`chat-avatar chat-avatar--${role}${
        animated ? " chat-avatar--pulse" : ""
      }`}
      role="img"
      aria-label={isUser ? "You" : "Agent"}
      title={isUser ? "You" : "Agent"}
    >
      {isUser ? (
        <User
          size={AVATAR_ICON_SIZE}
          strokeWidth={AVATAR_ICON_STROKE}
          color={iconColor}
          aria-hidden
        />
      ) : (
        <Sparkles
          size={AVATAR_ICON_SIZE}
          strokeWidth={AVATAR_ICON_STROKE}
          color={iconColor}
          aria-hidden
        />
      )}
    </span>
  );
}
