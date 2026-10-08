import { describe, expect, it } from "vitest";

import { respond } from "@/lib/copilot-engine";
import { botReply, initialBotState } from "@/lib/whatsapp-bot";

describe("copilot mock", () => {
  it("refuses protected attributes with alternatives", () => {
    const r = respond("compare recognition by gender", "owner");
    expect(r.kind).toBe("refusal");
    if (r.kind === "refusal") expect(r.alternatives.length).toBeGreaterThan(0);
  });
  it("managers cannot see company budget", () => {
    expect(respond("show company budget", "manager").kind).toBe("refusal");
    expect(respond("show company budget", "owner").kind).not.toBe("refusal");
  });
  it("shift question returns a table", () => {
    expect(respond("coverage by shift", "owner").kind).toBe("table");
  });
});

describe("whatsapp bot", () => {
  it("requires JOIN before other commands", () => {
    expect(botReply("BALANCE", initialBotState).reply).toMatch(/JOIN/);
  });
  it("STOP suppresses until JOIN again", () => {
    const joined = botReply("JOIN", initialBotState).state;
    const stopped = botReply("STOP", joined).state;
    expect(botReply("BALANCE", stopped).reply).toMatch(/JOIN/);
    expect(botReply("JOIN", stopped).state.stopped).toBe(false);
  });
  it("LANG cycles to Tamil", () => {
    const joined = botReply("JOIN", initialBotState).state;
    expect(botReply("LANG", joined).state.language).toBe("ta");
  });
});
