"use client";

import { useEffect, useId, type ReactNode } from "react";
import "./edit-panel-drawer.css";

export type EditPanelDrawerProps = {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  isSaving?: boolean;
  onClose: () => void;
  onSave: () => void;
  onCancel: () => void;
  children: ReactNode;
};

export function EditPanelDrawer({
  isOpen,
  title,
  subtitle,
  isSaving = false,
  onClose,
  onSave,
  onCancel,
  children,
}: EditPanelDrawerProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, isSaving, onClose]);

  return (
    <>
      <div
        className={`edit-panel-drawer__overlay${isOpen ? " edit-panel-drawer__overlay--open" : ""}`}
        onClick={isSaving ? undefined : onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={`edit-panel-drawer${isOpen ? " edit-panel-drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!isOpen}
      >
        <header className="edit-panel-drawer__header">
          <div className="min-w-0">
            <div id={titleId} className="edit-panel-drawer__title">
              {title}
            </div>
            {subtitle ? (
              <div className="edit-panel-drawer__subtitle">{subtitle}</div>
            ) : null}
          </div>
          <button
            type="button"
            className="edit-panel-drawer__close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close customise panel"
          >
            ✕
          </button>
        </header>

        <div className="edit-panel-drawer__body">{children}</div>

        <footer className="edit-panel-drawer__footer">
          <button
            type="button"
            className="edit-panel-drawer__btn edit-panel-drawer__btn--primary"
            onClick={onSave}
            disabled={isSaving}
            aria-busy={isSaving}
          >
            {isSaving ? (
              <>
                <span className="edit-panel-drawer__spinner" aria-hidden />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </button>
          <button
            type="button"
            className="edit-panel-drawer__btn edit-panel-drawer__btn--secondary"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
        </footer>
      </aside>
    </>
  );
}
