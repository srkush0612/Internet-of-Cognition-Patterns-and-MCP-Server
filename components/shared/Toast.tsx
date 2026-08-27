"use client";

import { useEffect, useState } from "react";
import "../chat/chat-micro-interactions.css";
import "./toast.css";

type ToastProps = {
  message: string;
  variant?: "success" | "error";
  duration?: number;
  onDismiss: () => void;
};

export function Toast({
  message,
  variant = "success",
  duration = 4000,
  onDismiss,
}: ToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitAt = Math.max(0, duration - 300);
    const exitTimer = window.setTimeout(() => setExiting(true), exitAt);
    const dismissTimer = window.setTimeout(() => onDismiss(), duration);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [duration, message, onDismiss]);

  return (
    <div
      className={`app-toast app-toast--${variant}${exiting ? " app-toast--exit" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="app-toast__icon" aria-hidden>
        {variant === "success" ? "✓" : "!"}
      </span>
      {message}
    </div>
  );
}
