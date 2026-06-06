import { readFile } from "node:fs/promises";

export type QueueTier = "STABLE" | "WATCH" | "ESCALATE" | "INTERVENE";

export interface ContactQueue {
  name: string;
  owner: string;
  audience: string;
  channel: string;
  dailyVolume: number;
  serviceLevel: number;
  abandonRate: number;
  averageSpeedAnswerSeconds: number;
  transferRate: number;
  repeatContactRate: number;
  sentimentRisk: number;
  staffingCoverage: number;
  revenueImpactMillions: number;
  narrative: string;
  nextAction: string;
}

export interface RouterInput {
  generatedAt: string;
  organization: string;
  queues: ContactQueue[];
}

export interface ScoredQueue extends ContactQueue {
  riskScore: number;
  tier: QueueTier;
  route: string;
}

export interface RiskRouter {
  generatedAt: string;
  organization: string;
  queues: ScoredQueue[];
  summary: {
    queueCount: number;
    highestRiskQueue: string;
    meanRiskScore: number;
    totalDailyVolume: number;
    revenueAtRiskMillions: number;
    primaryRecommendation: string;
  };
}

const clamp = (value: number, min = 0, max = 100): number => Math.min(max, Math.max(min, value));

export function classifyTier(score: number): QueueTier {
  if (score >= 78) return "INTERVENE";
  if (score >= 62) return "ESCALATE";
  if (score >= 42) return "WATCH";
  return "STABLE";
}

export function scoreQueue(queue: ContactQueue): ScoredQueue {
  const serviceGap = 100 - queue.serviceLevel;
  const abandonPressure = clamp(queue.abandonRate * 5);
  const answerPressure = clamp(queue.averageSpeedAnswerSeconds / 1.2);
  const transferPressure = clamp(queue.transferRate * 3);
  const repeatPressure = clamp(queue.repeatContactRate * 3.5);
  const staffingGap = 100 - queue.staffingCoverage;
  const revenuePressure = clamp(queue.revenueImpactMillions * 10);

  const riskScore = Math.round(
    clamp(
      serviceGap * 0.2 +
        abandonPressure * 0.16 +
        answerPressure * 0.13 +
        transferPressure * 0.11 +
        repeatPressure * 0.12 +
        queue.sentimentRisk * 0.12 +
        staffingGap * 0.1 +
        revenuePressure * 0.06
    )
  );

  const tier = classifyTier(riskScore);
  const route =
    tier === "INTERVENE"
      ? "Route to executive CX intervention with owner, staffing, and revenue-risk packet."
      : tier === "ESCALATE"
        ? "Route to queue owner escalation with SLA, abandon, and repeat-contact drivers."
        : tier === "WATCH"
          ? "Route to weekly operations watchlist before pressure becomes board-visible."
          : "Keep in normal operating cadence with trend monitoring.";

  return { ...queue, riskScore, tier, route };
}

export function buildRouter(input: RouterInput): RiskRouter {
  const queues = input.queues.map(scoreQueue).sort((a, b) => b.riskScore - a.riskScore);
  const meanRiskScore = Math.round(queues.reduce((sum, queue) => sum + queue.riskScore, 0) / Math.max(queues.length, 1));
  const totalDailyVolume = queues.reduce((sum, queue) => sum + queue.dailyVolume, 0);
  const revenueAtRiskMillions = Number(queues.reduce((sum, queue) => sum + queue.revenueImpactMillions, 0).toFixed(1));
  const highestRiskQueue = queues[0]?.name ?? "No queues";

  return {
    generatedAt: input.generatedAt,
    organization: input.organization,
    queues,
    summary: {
      queueCount: queues.length,
      highestRiskQueue,
      meanRiskScore,
      totalDailyVolume,
      revenueAtRiskMillions,
      primaryRecommendation: `Stabilize ${highestRiskQueue} first; it carries the strongest combination of SLA, abandonment, sentiment, and revenue exposure.`
    }
  };
}

export async function loadRouter(path: string): Promise<RiskRouter> {
  return buildRouter(JSON.parse(await readFile(path, "utf8")) as RouterInput);
}

export function renderMarkdown(router: RiskRouter): string {
  const rows = router.queues
    .map((queue) => `| ${queue.name} | ${queue.tier} | ${queue.riskScore} | ${queue.channel} | ${queue.serviceLevel}% | ${queue.abandonRate}% | ${queue.nextAction} |`)
    .join("\n");

  return [
    "# Genesys Contact Center Risk Router",
    "",
    `Organization: ${router.organization}`,
    "",
    `Primary recommendation: ${router.summary.primaryRecommendation}`,
    "",
    "| Queue | Tier | Risk score | Channel | Service level | Abandon rate | Next action |",
    "| --- | --- | ---: | --- | ---: | ---: | --- |",
    rows
  ].join("\n");
}
