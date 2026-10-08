import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";

import {
  employeeEvidence,
  explainOutcome,
  fairnessSummary,
  findEmployees,
  recognitionHistory,
} from "@/lib/insights-evidence";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const bodySchema = z.object({
  threadId: z.string().min(1).max(100),
  persona: z.enum(["owner", "manager", "hr", "employee"]),
  messages: z.array(z.unknown()).min(1).max(60),
});

const INSTRUCTIONS = `You are the Recognition insights assistant for Radha Krishna Mills, used by owners and managers.
Answer questions about recognition, rewards, workflow outcomes and fairness.

Rules:
- Use ONLY facts returned by your tools. Always call a tool before answering a factual question. Never invent numbers, people or reasons.
- Every factual sentence must cite the evidence id(s) it relies on in square brackets, e.g. [TRACE-run-118-RKM0003-3].
- For "why didn't X win / get rewarded" questions: find the person, call explainOutcome, then walk through the steps in order and name the first step that failed.
- Never analyse or speculate about gender, caste, religion, health, age, disability, marital status or personal life. Politely refuse and offer a neutral alternative (e.g. coverage by department, shift or tenure).
- Never give opinions about whether someone is a good or bad employee. State facts only. Describe shortfalls neutrally and remind that individual performance is private.
- If several people match a name, list them and ask which one.
- If the tools have no data, say so plainly.
- Plain, friendly language. Short paragraphs or bullets. Use Indian number formatting and DD/MM/YYYY dates.`;

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleInsightsChat(request: Request): Promise<Response> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return jsonError(500, "AI is not configured for this app yet.");

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return jsonError(400, "That request could not be read.");
  }
  // Prototype access rule: only owners and managers may use insights.
  if (parsed.persona !== "owner" && parsed.persona !== "manager") {
    return jsonError(403, "Recognition insights are available to owners and managers only.");
  }

  const messages = parsed.messages as UIMessage[];
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const tools = {
    findEmployee: tool({
      description:
        "Find employees by name or employee code. Returns matching people with evidence ids.",
      inputSchema: z.object({ query: z.string() }),
      execute: async ({ query }) => {
        const matches = findEmployees(query).map(employeeEvidence);
        return { matches, evidence: matches };
      },
    }),
    explainOutcome: tool({
      description:
        "Step-by-step decision trace for one employee in the latest 'Sales target achievers' workflow run, explaining whether and why they were rewarded.",
      inputSchema: z.object({ employeeCode: z.string() }),
      execute: async ({ employeeCode }) => {
        const result = explainOutcome(employeeCode);
        if (!result) return { found: false, evidence: [] };
        return {
          found: true,
          employee: result.employee.name,
          outcome: result.outcome,
          steps: result.steps.map((s) => ({
            title: s.title,
            detail: s.detail,
            passed: s.passed,
            evidenceId: s.evidence.id,
          })),
          evidence: [employeeEvidence(result.employee), ...result.steps.map((s) => s.evidence)],
        };
      },
    }),
    recognitionHistory: tool({
      description: "Recognition count and recency for one employee over the last 90 days.",
      inputSchema: z.object({ employeeCode: z.string() }),
      execute: async ({ employeeCode }) => {
        const ev = recognitionHistory(employeeCode);
        return ev ? { found: true, evidence: [ev] } : { found: false, evidence: [] };
      },
    }),
    fairnessSummary: tool({
      description:
        "Organisation-wide fairness facts: spread of points, coverage by department/location/shift/tenure, manager spread, people and teams being missed.",
      inputSchema: z.object({}),
      execute: async () => ({ evidence: fairnessSummary() }),
    }),
  };

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: INSTRUCTIONS,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(50),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: true,
      onError: (error) => {
        const status =
          typeof error === "object" && error !== null && "statusCode" in error
            ? Number((error as { statusCode: unknown }).statusCode)
            : 0;
        if (status === 402)
          return "AI credits have run out. Add credits in Settings → Plans & credits.";
        if (status === 429)
          return "Too many questions at once. Please wait a moment and try again.";
        if (status === 403) return "AI access is not available for this workspace right now.";
        return "The assistant could not answer just now. Please try again.";
      },
    }),
    runIdFetch,
  );
}
