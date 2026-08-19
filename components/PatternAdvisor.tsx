"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  InstanceSidebar,
  type InstanceSidebarData,
} from "@/components/InstanceSidebar";
import { PatternDesignPreview } from "@/components/PatternDesignPreview";
import { PatternPreview } from "@/components/PatternPreview";
import type { ChatRecommendation, ComponentDefinition } from "@/lib/pattern-advisor";
import { defaultWorkspaceForSlug } from "@/lib/workspace-defaults";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  recommendations?: ChatRecommendation[];
  topRecommendation?: ChatRecommendation | null;
};

type ActiveInstance = InstanceSidebarData;

const WELCOME_MESSAGE =
  "Hi! I help you discover Human Agent IoC Patterns. Describe a problem you're facing, and I'll recommend patterns that might help. For example: 'We need to track decisions we make', 'Multiple teams disagree on approach', 'We need to audit what agents did'";

function findPatternContext(
  messages: ChatMessage[],
  slug: string,
): { name: string; explanation?: string } {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const match = messages[index].recommendations?.find(
      (recommendation) => recommendation.pattern.slug === slug,
    );
    if (match) {
      return {
        name: match.pattern.name,
        explanation: match.explanation,
      };
    }
  }

  return { name: slug };
}

export function PatternAdvisor({ initialPrompt }: { initialPrompt?: string }) {
  const sessionId = useMemo(
    () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );
  const agentId = useMemo(
    () => `advisor-${sessionId}`,
    [sessionId],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeInstance, setActiveInstance] = useState<ActiveInstance | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);
  const sentInitialPrompt = useRef(false);

  const showToast = useCallback((text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setInput("");
      setLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, sessionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Chat request failed");
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.aiResponse,
            recommendations: data.recommendations,
            topRecommendation: data.topRecommendation,
          },
        ]);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something went wrong";
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Sorry, I ran into an issue: ${message}. Please try again.`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, sessionId],
  );

  useEffect(() => {
    if (!initialPrompt?.trim() || sentInitialPrompt.current) {
      return;
    }

    sentInitialPrompt.current = true;
    void sendMessage(initialPrompt);
  }, [initialPrompt, sendMessage]);

  const handleSendMessage = useCallback(async () => {
    await sendMessage(input);
  }, [input, sendMessage]);

  const handleInstantiatePattern = useCallback(
    async (slug: string) => {
      const { name: patternName, explanation } = findPatternContext(messages, slug);

      try {
        const [instanceResponse, componentResponse] = await Promise.all([
          fetch("/api/instances", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "instantiate",
              slug,
              initial_state: {
                title: patternName,
                workspace: defaultWorkspaceForSlug(slug),
              },
              agent_id: agentId,
              persistent: true,
            }),
          }),
          fetch(`/api/patterns/${slug}`),
        ]);

        const instanceData = await instanceResponse.json();
        const componentData = (await componentResponse.json()) as {
          success?: boolean;
          component?: ComponentDefinition;
          error?: string;
        };

        if (!instanceResponse.ok || !instanceData.success) {
          throw new Error(instanceData.error ?? "Failed to instantiate pattern");
        }

        if (!componentResponse.ok || !componentData.component) {
          throw new Error(
            componentData.error ?? "Failed to fetch pattern definition",
          );
        }

        const instance = instanceData.instance;
        setActiveInstance({
          instanceId: instance.instanceId,
          slug,
          component: componentData.component,
          state: (instance.state as Record<string, unknown>) ?? {},
          explanation,
        });
        setInput("");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I've created an instance of ${patternName}. Use the workspace in the middle column to fill it in — the reference design is on the right.`,
          },
        ]);
        showToast(`${patternName} instantiated`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Instantiation failed";
        showToast(message);
      }
    },
    [agentId, messages, showToast],
  );

  const handleEditState = useCallback(
    async (updates: Record<string, unknown>) => {
      if (!activeInstance) {
        return;
      }

      const response = await fetch("/api/instances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          instance_id: activeInstance.instanceId,
          updates,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Failed to update instance state");
      }

      setActiveInstance((current) =>
        current
          ? {
              ...current,
              state: (data.instance.state as Record<string, unknown>) ?? updates,
            }
          : null,
      );
      showToast("Instance state updated");
    },
    [activeInstance, showToast],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-accent px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="flex w-full max-w-[640px] shrink-0 flex-col border-line bg-white lg:border-r">
          <div className="flex-1 space-y-6 overflow-y-auto bg-white p-4">
            {messages.map((message, index) => {
              const hasRecommendations =
                message.role === "assistant" &&
                message.recommendations &&
                message.recommendations.length > 0;

              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={
                      hasRecommendations
                        ? "w-full"
                        : "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed " +
                          (message.role === "user"
                            ? "bg-[var(--pattern-accent,#7c3aed)] text-white"
                            : "bg-white text-[var(--pattern-text,#111)] shadow-sm ring-1 ring-[var(--pattern-border,#e2e5ea)]")
                    }
                  >
                    <div
                      className={
                        hasRecommendations
                          ? "rounded-2xl bg-white px-4 py-3 text-sm leading-relaxed text-[var(--pattern-text,#111)] shadow-sm ring-1 ring-[var(--pattern-border,#e2e5ea)]"
                          : undefined
                      }
                    >
                      <p>{message.content}</p>
                    </div>

                    {hasRecommendations ? (
                      <div className="mt-4 space-y-4">
                        {message.recommendations!.map((recommendation) => {
                          const isTop =
                            message.topRecommendation?.pattern.slug ===
                            recommendation.pattern.slug;

                          return (
                            <PatternPreview
                              key={recommendation.pattern.slug}
                              component={recommendation.fullComponent}
                              explanation={recommendation.explanation}
                              isTopRecommendation={
                                isTop && message.recommendations!.length > 1
                              }
                              onInstantiate={() =>
                                void handleInstantiatePattern(
                                  recommendation.pattern.slug,
                                )
                              }
                            />
                          );
                        })}
                        <p className="px-1 text-xs leading-relaxed text-[var(--pattern-text-muted,#666)]">
                          Click &ldquo;Try this&rdquo; to create a live instance
                          and start using it.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {loading ? (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-[var(--pattern-text-muted,#666)] shadow-sm ring-1 ring-[var(--pattern-border,#e2e5ea)]">
                  Thinking…
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-line bg-white p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What patterns do you need? E.g., 'Record our decisions'"
                disabled={loading}
                className="flex-1 rounded-xl border border-[var(--pattern-border,#e2e5ea)] px-4 py-3 text-sm outline-none transition focus:border-[var(--pattern-accent,#7c3aed)] focus:ring-2 focus:ring-[var(--pattern-accent-soft,#ede9fe)] disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => void handleSendMessage()}
                disabled={loading || !input.trim()}
                className="rounded-xl bg-[var(--pattern-accent,#7c3aed)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        <aside className="flex min-h-0 w-full flex-1 flex-col border-t border-line bg-hover/50 lg:min-w-0 lg:flex-row lg:border-t-0 lg:border-l">
          {activeInstance ? (
            <>
              <div className="flex min-h-0 w-full flex-col border-b border-line lg:w-[22rem] lg:max-w-[24rem] lg:shrink-0 lg:border-b-0 lg:border-r">
                <InstanceSidebar
                  instance={activeInstance}
                  onClose={() => setActiveInstance(null)}
                  onEditState={handleEditState}
                />
              </div>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <PatternDesignPreview
                  slug={activeInstance.slug}
                  patternName={activeInstance.component.metadata.name}
                />
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col justify-center bg-white p-6 lg:flex-1">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">
                Active instance
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-muted">
                No active instance yet. Ask for a recommendation, then click
                &ldquo;Try this&rdquo; on a preview. Your interactive workspace
                will appear here; the reference design shows on the right.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
