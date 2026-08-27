"use client";

import { useCallback, useId, useRef, useState } from "react";
import "./conversation-edit-shared.css";

export type ConversationInputProps = {
  onSubmit: (text: string) => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  placeholder?: string;
  onOpenScenarios?: () => void;
};

export function ConversationInput({
  onSubmit,
  onFileUpload,
  isLoading,
  placeholder = "Describe your use case, include agents, conflicts, timeline…",
  onOpenScenarios,
}: ConversationInputProps) {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaId = useId();

  const handleExtract = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  }, [isLoading, onSubmit, text]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) onFileUpload(file);
      event.target.value = "";
    },
    [onFileUpload],
  );

  return (
    <div className="conv-edit-input">
      <label htmlFor={textareaId} className="conv-edit-form__label">
        Describe your scenario
      </label>
      <textarea
        id={textareaId}
        className="conv-edit-input__textarea"
        rows={5}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        aria-busy={isLoading}
      />
      <div className="conv-edit-input__actions">
        <button
          type="button"
          className="conv-edit-btn conv-edit-btn--primary"
          onClick={handleExtract}
          disabled={isLoading || !text.trim()}
        >
          {isLoading ? "Extracting…" : "Extract"}
        </button>
        <button
          type="button"
          className="conv-edit-btn conv-edit-btn--secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          Upload file
        </button>
        {onOpenScenarios ? (
          <button
            type="button"
            className="conv-edit-btn conv-edit-btn--secondary"
            onClick={onOpenScenarios}
            disabled={isLoading}
          >
            Try scenario
          </button>
        ) : null}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="conv-edit-input__file"
        accept=".pdf,.doc,.docx,.txt,.json,.csv"
        onChange={handleFileChange}
        aria-hidden
        tabIndex={-1}
      />
      {isLoading ? (
        <p className="conv-edit-input__loading" role="status">
          Extracting fields from your description…
        </p>
      ) : null}
    </div>
  );
}
