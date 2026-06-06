import { describe, expect, it } from "vitest";
import sample from "../fixtures/genesys-risk-sample.json" with { type: "json" };
import { buildRouter, classifyTier, renderMarkdown, scoreQueue } from "../src/index.js";

describe("genesys contact center risk router", () => {
  it("classifies queue tiers", () => {
    expect(classifyTier(84)).toBe("INTERVENE");
    expect(classifyTier(70)).toBe("ESCALATE");
    expect(classifyTier(50)).toBe("WATCH");
    expect(classifyTier(20)).toBe("STABLE");
  });

  it("scores queue pressure", () => {
    const queue = scoreQueue(sample.queues[0]);
    expect(queue.riskScore).toBeGreaterThan(60);
    expect(queue.route).toContain("queue");
  });

  it("builds a sorted router", () => {
    const router = buildRouter(sample);
    expect(router.summary.queueCount).toBe(4);
    expect(router.queues[0].riskScore).toBeGreaterThanOrEqual(router.queues[1].riskScore);
    expect(router.summary.primaryRecommendation).toContain(router.summary.highestRiskQueue);
  });

  it("renders markdown output", () => {
    const markdown = renderMarkdown(buildRouter(sample));
    expect(markdown).toContain("| Queue | Tier | Risk score |");
    expect(markdown).toContain("Enterprise renewal escalation");
  });
});
