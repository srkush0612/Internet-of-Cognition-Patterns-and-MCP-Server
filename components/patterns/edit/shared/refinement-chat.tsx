"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { RefinementMessage } from "./types";
import "./conversation-edit-shared.css";

export type RefinementChatProps = {
  messages: RefinementMessage[];
  onSendRefinement: (text: string) => void;
  isLoading: boolean;
  patternSlug: string;
};

export function RefinementChat({
  messages,
  onSendRefinement,
  isLoading,
  patternSlug,
}: RefinementChatProps) {
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed || isLoading) return;
    onSendRefinement(trimmed);
    setDraft("");
  }, [draft, isLoading, onSendRefinement]);

  return (
    <section
      className="conv-edit-chat"
      aria-label={`Refine ${patternSlug.replace(/-/g, " ")} parameters`}
    >
      <h3 className="conv-edit-chat__title">Refinement</h3>
      <div
        ref={listRef}
        className="conv-edit-chat__messages"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 ? (
          <p className="conv-edit-form__hint">
            Type refinements like &ldquo;Add comms agent&rdquo; or &ldquo;Change outcome to
            approved with GDPR measures&rdquo;.
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`conv-edit-chat__message conv-edit-chat__message--${message.role}`}
            >
              {message.text}
            </div>
          ))
        )}
      </div>
      <div className="conv-edit-chat__input-row">
        <label htmlFor={inputId} className="conv-edit-sr-only">
          Refinement message
        </label>
        <input
          id={inputId}
          type="text"
          className="conv-edit-chat__input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder='Type refinement (e.g., "Add comms agent")'
          disabled={isLoading}
          aria-busy={isLoading}
        />
        <button
          type="button"
          className="conv-edit-btn conv-edit-btn--primary"
          onClick={handleSend}
          disabled={isLoading || !draft.trim()}
        >
          Send
        </button>
      </div>
    </section>
  );
}
