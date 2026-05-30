// Domain types for the AInigma backend. Mirrors the frontend contract
// (design.md "Data Models") so the API can drop in without reshaping.

export type ModeLabel = "Live" | "Simulated";
export type ExecutionMode = "Simulated" | "Live";
export type TechPillar = "MCP" | "RAG" | "Diffusion" | "Agentic" | "LLM";
export type PipelineState = "idle" | "running" | "complete" | "error";

export type AgentName =
  | "Researcher"
  | "Analyst"
  | "Copywriter"
  | "Visual_Director"
  | "Operations";

export type AgentEventKind = "log" | "active" | "complete" | "handoff";

export interface AgentEvent {
  id: string;
  agent: AgentName;
  timestamp: number; // simulated ms offset from run start; ordering key
  kind: AgentEventKind;
  message: string;
  handoffTo?: AgentName;
  pillar?: TechPillar;
}

export interface MarketingCopy {
  headline: string;
  body: string;
  cta: string;
}

export interface ImageRef {
  src: string; // local path (mock) or URL (live)
  alt: string;
  fallbackGradient: string;
}

export interface CreativeAsset {
  copy: MarketingCopy;
  copyLabel: ModeLabel;
  hero: ImageRef;
  heroLabel: ModeLabel;
  palette: string[];
}

export interface InventoryRecord {
  sku: string;
  name: string;
  stock: number;
  status: "ready" | "low" | "backorder";
}

export interface MockDataset {
  presetId: string;
  exampleLabel: string;
  matchKeywords: string[];
  tagline: string;
  agentScript: AgentEvent[];
  copy: MarketingCopy;
  heroImage: ImageRef;
  palette: string[];
  inventory: InventoryRecord[];
}

export interface PillarStatus {
  pillar: TechPillar;
  mode: ExecutionMode;
}

export interface PipelineRun {
  runId: string;
  productIdea: string;
  executionMode: ExecutionMode;
  state: PipelineState;
  dataset: MockDataset;
  asset?: CreativeAsset;
  pillarStatuses: PillarStatus[];
  createdAt: number;
}

// ---- Fallback Controller contract (design.md) ----
export interface FallbackResult<T> {
  value: T;
  label: ModeLabel;
  fellBack: boolean;
  reason?: "timeout" | "error" | "disabled";
}

// ---- Live-service adapter interfaces ----
export interface CopyGenerator {
  readonly id: string; // e.g. "groq:llama-3.1-8b-instant"
  generate(idea: string, inventory: InventoryRecord[]): Promise<MarketingCopy>;
}

export interface ImageGenerator {
  readonly id: string; // e.g. "pollinations:flux"
  generate(prompt: string): Promise<ImageRef>;
}

export interface InventoryProvider {
  readonly id: string;
  getContext(idea: string): Promise<InventoryRecord[]>;
}

export const AGENT_ORDER: AgentName[] = [
  "Researcher",
  "Analyst",
  "Copywriter",
  "Visual_Director",
  "Operations",
];

export const PILLAR_ORDER: TechPillar[] = ["MCP", "RAG", "Diffusion", "Agentic", "LLM"];
