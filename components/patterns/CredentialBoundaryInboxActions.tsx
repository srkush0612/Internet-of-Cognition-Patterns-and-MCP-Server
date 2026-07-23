"use client";

import { useEffect, useRef, useState } from "react";

const GRANT_OPTIONS = [
  "Crime Agent → credit data",
  "Credit Agent → crime data",
] as const;

export function CredentialBoundaryInboxActions() {
  const [contextOpen, setContextOpen] = useState(false);
  const [contextDraft, setContextDraft] = useState("");
  const [contextNote, setContextNote] = useState<string | null>(null);

  const [grantOpen, setGrantOpen] = useState(false);
  const [grantReason, setGrantReason] = useState("");
  const [grantTarget, setGrantTarget] = useState<string>(GRANT_OPTIONS[0]);
  const [grantConfirmed, setGrantConfirmed] = useState(false);

  const [policyOpen, setPolicyOpen] = useState(false);

  const [deferred, setDeferred] = useState(false);
  const [undoVisible, setUndoVisible] = useState(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  function closePanels() {
    setContextOpen(false);
    setGrantOpen(false);
    setPolicyOpen(false);
  }

  function handleAddContext() {
    closePanels();
    setContextOpen(true);
  }

  function handleSendContext() {
    const trimmed = contextDraft.trim();
    if (!trimmed) return;
    setContextNote(trimmed);
    setContextDraft("");
    setContextOpen(false);
  }

  function handleGrantOpen() {
    closePanels();
    setGrantOpen(true);
  }

  function handleGrantConfirm() {
    if (!grantReason.trim()) return;
    setGrantConfirmed(true);
    setGrantOpen(false);
    setGrantReason("");
  }

  function handleDefer() {
    closePanels();
    setDeferred(true);
    setUndoVisible(true);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
    undoTimerRef.current = setTimeout(() => {
      setUndoVisible(false);
      undoTimerRef.current = null;
    }, 5000);
  }

  function handleUndoDefer() {
    setDeferred(false);
    setUndoVisible(false);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }

  function handlePolicyToggle() {
    setPolicyOpen((open) => !open);
    setContextOpen(false);
    setGrantOpen(false);
  }

  return (
    <div className="credential-inbox-actions">
      {contextNote ? (
        <div className="pattern-inbox__bubble pattern-inbox__bubble--user">
          <span className="pattern-inbox__bubble-label">You · just now</span>
          <p className="pattern-inbox__bubble-text">{contextNote}</p>
        </div>
      ) : null}

      {grantConfirmed ? (
        <p className="credential-inbox-actions__system">
          Temporary access granted · logged to audit trail · expires end of
          session
        </p>
      ) : null}

      {deferred ? (
        <div className="credential-inbox-actions__deferred">
          <span>
            Case deferred · both agents paused · returns to queue in 24h
          </span>
          {undoVisible ? (
            <button
              type="button"
              className="credential-inbox-actions__link"
              onClick={handleUndoDefer}
            >
              Undo
            </button>
          ) : null}
        </div>
      ) : (
        <div className="credential-inbox-actions__row">
          <button
            type="button"
            className="credential-inbox-actions__btn credential-inbox-actions__btn--primary"
            onClick={handleGrantOpen}
          >
            Grant temporary access
          </button>
          <button
            type="button"
            className="credential-inbox-actions__btn credential-inbox-actions__btn--secondary"
            onClick={handleAddContext}
          >
            Add context
          </button>
          <button
            type="button"
            className="credential-inbox-actions__btn credential-inbox-actions__btn--tertiary"
            onClick={handleDefer}
          >
            Defer
          </button>
          <button
            type="button"
            className="credential-inbox-actions__link"
            onClick={handlePolicyToggle}
            aria-expanded={policyOpen}
          >
            View boundary policy
          </button>
        </div>
      )}

      {contextOpen ? (
        <div className="credential-inbox-actions__expand">
          <input
            type="text"
            className="credential-inbox-actions__input"
            placeholder="Add a note both agents can see..."
            value={contextDraft}
            onChange={(event) => setContextDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSendContext();
            }}
          />
          <button
            type="button"
            className="credential-inbox-actions__btn credential-inbox-actions__btn--send"
            onClick={handleSendContext}
          >
            Send
          </button>
        </div>
      ) : null}

      {grantOpen ? (
        <div className="credential-inbox-actions__expand credential-inbox-actions__grant">
          <p className="credential-inbox-actions__grant-note">
            This grants one-time cross-boundary read access. The reason will be
            logged to the audit trail.
          </p>
          <label className="credential-inbox-actions__field">
            <span className="credential-inbox-actions__field-label">
              Reason for override
            </span>
            <input
              type="text"
              className="credential-inbox-actions__input credential-inbox-actions__input--full"
              value={grantReason}
              onChange={(event) => setGrantReason(event.target.value)}
            />
          </label>
          <label className="credential-inbox-actions__field">
            <span className="credential-inbox-actions__field-label">
              Grant access to
            </span>
            <select
              className="credential-inbox-actions__select"
              value={grantTarget}
              onChange={(event) => setGrantTarget(event.target.value)}
            >
              {GRANT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <div className="credential-inbox-actions__grant-actions">
            <button
              type="button"
              className="credential-inbox-actions__btn credential-inbox-actions__btn--primary"
              onClick={handleGrantConfirm}
              disabled={!grantReason.trim()}
            >
              Grant and log
            </button>
            <button
              type="button"
              className="credential-inbox-actions__link"
              onClick={() => setGrantOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {policyOpen ? (
        <div className="credential-inbox-actions__policy">
          <h4 className="credential-inbox-actions__policy-title">
            AML–Credit Separation Policy
          </h4>
          <p className="credential-inbox-actions__policy-body">
            Financial crime data and credit decisioning data may not be accessed
            by the same agent or analyst within a single workflow. Cross-access
            requires documented exception and compliance sign-off.
          </p>
          <button
            type="button"
            className="credential-inbox-actions__link"
            onClick={() => setPolicyOpen(false)}
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
