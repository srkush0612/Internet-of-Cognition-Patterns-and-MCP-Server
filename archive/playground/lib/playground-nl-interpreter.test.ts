import { describe, expect, it } from "vitest";
import { applyPlaygroundInstruction, type PlaygroundEditableState } from "@/archive/playground/lib/playground-nl-interpreter";

const baseState: PlaygroundEditableState = {
  name: "Restart svc-payments",
  parameters: {},
  context: {},
};

describe("applyPlaygroundInstruction", () => {
  it("sets the title via 'set title to ...'", () => {
    const result = applyPlaygroundInstruction("decision-ledger", "set title to Ship OAuth", baseState);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.name).toBe("Ship OAuth");
    }
  });

  it("matches a real field key from editableFieldsForSlug (decision-ledger's 'chosen') and sets it", () => {
    const result = applyPlaygroundInstruction(
      "decision-ledger",
      "change chosen to Roll back firmware",
      baseState,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.parameters.chosen).toBe("Roll back firmware");
    }
  });

  it("returns a helpful message (naming known fields) for an unrecognized instruction", () => {
    const result = applyPlaygroundInstruction("decision-ledger", "make it sparkle", baseState);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message.toLowerCase()).toContain("field");
    }
  });

  it("clear empties a field without throwing on an unknown one", () => {
    const result = applyPlaygroundInstruction("decision-ledger", "clear the nonexistent thing", baseState);
    expect(result.ok).toBe(false);
  });
});
