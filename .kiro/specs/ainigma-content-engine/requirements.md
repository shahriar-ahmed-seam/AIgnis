# Requirements Document

## Introduction

AInigma is a hackathon prototype for the "Multimodal Content Engine" challenge track in the Branding & Marketing (MarTech) domain. AInigma presents itself as an autonomous multi-agent multimodal marketing content engine: a user types a raw product idea, watches a swarm of specialized AI agents appear to collaborate in real time, and receives an on-brand marketing creative asset.

This specification deliberately describes a **demo-focused, frontend-aesthetics-first proof-of-concept**, not a production system. The build strategy is phased and mock-first:

- **Phase 1 (must-have):** A polished, visually stunning frontend driven entirely by synthetic data, scripted animations, and pre-generated images. This is the primary artifact judged.
- **Phase 2 (medium priority):** A backend that simulates the multi-agent pipeline using mock data, wiring the flow end-to-end without real external endpoints.
- **Phase 3 (stretch/optional):** A single real "live pass" through the core loop — one real LLM copy-generation call and one real Diffusion image-generation call for the hero asset — plus an optional MCP server reading a local inventory file. Any Phase 3 capability that is not completed remains simulated and is clearly labeled as such.

A central, non-negotiable framing requirement is **honest presentation**: the product must always make clear which capabilities are genuinely live versus simulated for the demo, and the demo must remain stable enough to never crash during a live presentation.

The tech pillars showcased (real where feasible, simulated otherwise) are: MCP (Model Context Protocol), RAG over market/review data, Diffusion-based image generation, Agentic AI / multi-agent orchestration, and LLM text generation.

## Glossary

- **AInigma**: The complete prototype system, comprising the Demo_Frontend, Simulation_Backend, and optional Live_Pass capabilities.
- **Demo_Frontend**: The Phase 1 user-facing web application responsible for all visual presentation, animations, and rendered output.
- **Operator**: The person who drives AInigma during a presentation (typically a team member presenting to judges).
- **Judge**: A hackathon evaluator who observes the demo and may request a live pass during question-and-answer.
- **Product_Idea**: The raw free-text marketing prompt entered by the Operator describing a product or campaign concept.
- **Agent_Swarm**: The set of specialized simulated agents — Researcher, Analyst, Copywriter, Visual_Director, and Operations — that appear to collaborate to produce a creative asset.
- **Agent_Activity_View**: The Demo_Frontend component that displays the Agent_Swarm conversation and execution logs as an animated, real-time stream.
- **Creative_Asset**: The multimodal marketing output, consisting of generated marketing copy and a rendered hero image.
- **Creative_Renderer**: The Demo_Frontend component that displays the finished Creative_Asset in an on-brand layout.
- **Analytics_Dashboard**: The Demo_Frontend component that displays synthetic market, performance, and campaign metrics.
- **Mock_Data_Layer**: The curated set of synthetic data, pre-written agent scripts, and pre-generated images that drive the Phase 1 and Phase 2 experiences.
- **Simulation_Backend**: The Phase 2 service that orchestrates the simulated multi-agent pipeline using the Mock_Data_Layer and streams events to the Demo_Frontend.
- **Live_Pass**: The Phase 3 optional execution mode that performs one real LLM call and one real Diffusion image generation for the core loop.
- **LLM_Service**: The real large-language-model integration used during the Live_Pass to generate marketing copy from a Product_Idea.
- **Diffusion_Service**: The real diffusion-model integration used during the Live_Pass to generate the hero image.
- **MCP_Inventory_Server**: The Phase 3 optional Model Context Protocol server that reads a local JSON or SQLite inventory file and exposes inventory context to the pipeline.
- **RAG_Engine**: The retrieval-augmented-generation capability over market and review data; simulated in Phase 1 and Phase 2, optionally partially real in Phase 3.
- **Mode_Indicator**: The Demo_Frontend element that labels each capability and output as either "Live" or "Simulated".
- **Fallback_Controller**: The component that detects failures or unavailable real services and substitutes pre-generated or simulated content to keep the demo running.
- **Execution_Mode**: The active operating mode of AInigma, one of "Simulated" or "Live".

## Requirements

### Requirement 1: Polished Demo Frontend Experience (Phase 1)

**User Story:** As an Operator, I want a visually stunning, high-tech frontend, so that the demo captures judge attention and communicates a premium product impression.

#### Acceptance Criteria

1. THE Demo_Frontend SHALL present a cohesive visual theme with a consistent color palette, typography, and high-tech motion design across all views.
2. WHEN the Demo_Frontend loads, THE Demo_Frontend SHALL display the landing view within 3 seconds on the demo presentation machine.
3. WHEN the Operator triggers a primary action, THE Demo_Frontend SHALL play a prebuilt transition animation that completes within 2 seconds.
4. THE Demo_Frontend SHALL render correctly at the presentation display resolution of 1920x1080 pixels.
5. WHILE an animation is playing, THE Demo_Frontend SHALL keep all interactive controls in a defined visual state.
6. THE Demo_Frontend SHALL operate as the Phase 1 must-have deliverable independently of the Simulation_Backend and the Live_Pass.

### Requirement 2: Product Idea Input and Pipeline Launch

**User Story:** As an Operator, I want to type a raw product idea and start the engine, so that judges see the end-to-end content-generation journey begin from a simple prompt.

#### Acceptance Criteria

1. THE Demo_Frontend SHALL provide a free-text input control for the Operator to enter a Product_Idea.
2. WHEN the Operator submits a Product_Idea with at least 1 non-whitespace character, THE Demo_Frontend SHALL start the content-generation pipeline.
3. IF the Operator submits an empty or whitespace-only Product_Idea, THEN THE Demo_Frontend SHALL display an inline prompt requesting a valid Product_Idea and SHALL NOT start the pipeline.
4. THE Demo_Frontend SHALL provide at least 3 preset example Product_Idea entries that the Operator can select to start the pipeline.
5. WHEN the pipeline starts, THE Demo_Frontend SHALL transition to the Agent_Activity_View within 2 seconds.

### Requirement 3: Agent Swarm Collaboration Visualization

**User Story:** As a Judge, I want to watch specialized AI agents collaborate in real time, so that I understand the autonomous multi-agent orchestration concept.

#### Acceptance Criteria

1. THE Agent_Activity_View SHALL display the Agent_Swarm as 5 distinct named agents: Researcher, Analyst, Copywriter, Visual_Director, and Operations.
2. WHEN the pipeline runs, THE Agent_Activity_View SHALL stream agent log messages as an animated sequence ordered by simulated timestamp.
3. WHILE an agent is active, THE Agent_Activity_View SHALL display a visual active-state indicator for that agent.
4. WHEN an agent completes its simulated task, THE Agent_Activity_View SHALL display a completion indicator for that agent.
5. THE Agent_Activity_View SHALL display inter-agent messages that show at least one handoff from each agent to a subsequent agent.
6. WHERE the Operator enables the playback-speed control, THE Agent_Activity_View SHALL adjust the animated log stream rate to the selected speed.
7. THE Agent_Activity_View SHALL complete a full simulated collaboration sequence within 90 seconds at the default playback speed.

### Requirement 4: Multimodal Creative Asset Rendering

**User Story:** As a Judge, I want to see a finished on-brand marketing asset, so that I can evaluate the multimodal output of the content engine.

#### Acceptance Criteria

1. WHEN the agent collaboration sequence completes, THE Creative_Renderer SHALL display a Creative_Asset containing marketing copy and a hero image.
2. THE Creative_Renderer SHALL display the marketing copy with a headline, body text, and a call-to-action.
3. THE Creative_Renderer SHALL display the hero image within an on-brand ad layout.
4. WHEN the Creative_Asset is displayed, THE Creative_Renderer SHALL apply the Mode_Indicator label corresponding to the active Execution_Mode.
5. THE Creative_Renderer SHALL provide a control to restart the pipeline with a new Product_Idea.

### Requirement 5: Synthetic Analytics Dashboard

**User Story:** As a Judge, I want to see market and performance analytics, so that I perceive the data-driven sophistication of the engine.

#### Acceptance Criteria

1. THE Analytics_Dashboard SHALL display at least 3 synthetic metric visualizations covering market insight, audience targeting, and predicted campaign performance.
2. WHEN the pipeline produces a Creative_Asset, THE Analytics_Dashboard SHALL update the displayed metrics from the Mock_Data_Layer values associated with that run.
3. THE Analytics_Dashboard SHALL label all displayed metrics with the Mode_Indicator value "Simulated".
4. THE Analytics_Dashboard SHALL render each visualization with defined axis labels and a title.

### Requirement 6: Mock Data Layer

**User Story:** As an Operator, I want all default behavior driven by curated synthetic data, so that the demo is repeatable and independent of external services.

#### Acceptance Criteria

1. THE Mock_Data_Layer SHALL provide synthetic agent log scripts, synthetic analytics values, and pre-generated images sufficient to complete a full pipeline run.
2. WHEN the pipeline runs in Simulated Execution_Mode, THE Simulation_Backend SHALL source all displayed content from the Mock_Data_Layer.
3. THE Mock_Data_Layer SHALL provide a distinct curated dataset for each preset example Product_Idea defined in Requirement 2.
4. WHERE the submitted Product_Idea does not match a preset, THE Mock_Data_Layer SHALL supply a default curated dataset.
5. THE Mock_Data_Layer SHALL store all synthetic assets locally so that a pipeline run completes without any network request in Simulated Execution_Mode.

### Requirement 7: Simulation Backend Pipeline (Phase 2)

**User Story:** As an Operator, I want a backend that simulates the multi-agent pipeline end to end, so that the system behaves like a wired application rather than a static mockup.

#### Acceptance Criteria

1. WHEN the Demo_Frontend starts a pipeline run, THE Simulation_Backend SHALL execute a simulated multi-agent sequence using the Mock_Data_Layer.
2. WHILE the simulated sequence runs, THE Simulation_Backend SHALL stream agent events to the Demo_Frontend in timestamp order.
3. THE Simulation_Backend SHALL expose the simulated pipeline through a defined application interface consumed by the Demo_Frontend.
4. THE Simulation_Backend SHALL complete a simulated pipeline run without calling any external third-party endpoint.
5. IF the Simulation_Backend is unavailable, THEN THE Demo_Frontend SHALL run the pipeline using the Mock_Data_Layer directly so that the demo continues.

### Requirement 8: Live Pass — Real Copy Generation (Phase 3, Optional)

**User Story:** As an Operator, I want one real LLM call available during judge Q&A, so that I can prove the core loop works with a genuine model.

#### Acceptance Criteria

1. WHERE the Live_Pass capability is enabled, THE AInigma SHALL provide a control to run the core loop in Live Execution_Mode.
2. WHEN the Operator runs a Live_Pass, THE LLM_Service SHALL generate marketing copy from the entered Product_Idea using one real model invocation.
3. WHEN the LLM_Service returns generated copy, THE Creative_Renderer SHALL display that copy labeled with the Mode_Indicator value "Live".
4. IF the LLM_Service does not return a result within 20 seconds, THEN THE Fallback_Controller SHALL substitute pre-generated copy and label the output "Simulated".
5. WHERE the Live_Pass capability is not enabled, THE AInigma SHALL run the core loop in Simulated Execution_Mode and label the copy "Simulated".

### Requirement 9: Live Pass — Real Image Generation with Fallback (Phase 3, Optional)

**User Story:** As an Operator, I want one real diffusion image generation available, so that I can demonstrate genuine multimodal output while protecting against GPU or API limits.

#### Acceptance Criteria

1. WHERE the Live_Pass capability is enabled, THE Diffusion_Service SHALL generate one hero image from a prompt derived from the Product_Idea using one real model invocation.
2. WHEN the Diffusion_Service returns a hero image, THE Creative_Renderer SHALL display that image labeled with the Mode_Indicator value "Live".
3. IF the Diffusion_Service does not return a result within 60 seconds, THEN THE Fallback_Controller SHALL substitute a pre-generated hero image and label the output "Simulated".
4. IF the Diffusion_Service returns an error, THEN THE Fallback_Controller SHALL substitute a pre-generated hero image and label the output "Simulated".
5. THE AInigma SHALL retain a pre-generated hero image for every preset example Product_Idea to serve as the diffusion fallback.

### Requirement 10: MCP Inventory Server (Phase 3, Stretch)

**User Story:** As an Operator, I want an optional MCP server that reads a local inventory file, so that I can showcase Model Context Protocol as a technical differentiator.

#### Acceptance Criteria

1. WHERE the MCP_Inventory_Server is enabled, THE MCP_Inventory_Server SHALL read inventory records from a local JSON or SQLite file.
2. WHERE the MCP_Inventory_Server is enabled, THE MCP_Inventory_Server SHALL expose inventory context to the pipeline through the Model Context Protocol.
3. WHEN the pipeline requests inventory context AND the MCP_Inventory_Server is enabled, THE pipeline SHALL incorporate the returned inventory data into the Agent_Activity_View.
4. WHERE the MCP_Inventory_Server is not enabled, THE AInigma SHALL supply inventory context from the Mock_Data_Layer and label that context "Simulated".
5. IF the MCP_Inventory_Server fails to respond within 10 seconds, THEN THE Fallback_Controller SHALL supply inventory context from the Mock_Data_Layer and label that context "Simulated".

### Requirement 11: Honest Real-versus-Simulated Separation

**User Story:** As a Judge, I want clear labeling of what is live versus simulated, so that I can trust the team's honest presentation of the prototype.

#### Acceptance Criteria

1. THE Demo_Frontend SHALL display a Mode_Indicator on every output that distinguishes "Live" content from "Simulated" content.
2. WHEN a capability operates from the Mock_Data_Layer, THE Demo_Frontend SHALL label the corresponding output "Simulated".
3. WHEN a capability operates from a real service, THE Demo_Frontend SHALL label the corresponding output "Live".
4. THE Demo_Frontend SHALL provide a status view that lists each tech pillar — MCP, RAG, Diffusion, Agentic orchestration, and LLM — with its current Execution_Mode.
5. WHEN the Fallback_Controller substitutes pre-generated content for a real service, THE Demo_Frontend SHALL update the affected output label to "Simulated".

### Requirement 12: Demo Reliability and Fallbacks

**User Story:** As an Operator, I want the demo to remain stable under any failure, so that the presentation never crashes on stage.

#### Acceptance Criteria

1. IF any real service is unavailable, times out, or returns an error, THEN THE Fallback_Controller SHALL substitute pre-generated or simulated content and continue the pipeline run.
2. WHILE the demo is running, THE Demo_Frontend SHALL remain interactive and SHALL display a defined view for every pipeline state.
3. WHEN a pipeline run completes through any fallback path, THE Creative_Renderer SHALL display a complete Creative_Asset.
4. THE AInigma SHALL complete a full Simulated Execution_Mode pipeline run without requiring any network connectivity.
5. WHEN the Operator restarts the pipeline, THE Demo_Frontend SHALL return to a defined ready state within 3 seconds.

### Requirement 13: Phased Delivery and Prioritization

**User Story:** As a team member, I want the build prioritized by phase, so that the highest-value demo artifact is delivered first within the hackathon timebox.

#### Acceptance Criteria

1. THE AInigma SHALL deliver the Phase 1 Demo_Frontend as a standalone artifact that runs a full pipeline using only the Mock_Data_Layer.
2. WHERE the Simulation_Backend is delivered, THE AInigma SHALL run the Phase 2 pipeline through the Simulation_Backend while preserving the Phase 1 frontend behavior.
3. WHERE the Live_Pass capabilities are delivered, THE AInigma SHALL enable Live Execution_Mode for the core loop while preserving Simulated Execution_Mode as the default.
4. THE AInigma SHALL function as a complete demo with only Phase 1 delivered.
5. THE AInigma SHALL treat the MCP_Inventory_Server as an optional stretch capability whose absence does not block any other phase.

### Requirement 14: Tech Pillar Showcase

**User Story:** As a Judge, I want each named technology pillar visibly demonstrated, so that I can evaluate the breadth of the engine against the challenge track.

#### Acceptance Criteria

1. THE Demo_Frontend SHALL visibly represent all 5 tech pillars — MCP, RAG, Diffusion, Agentic orchestration, and LLM — during a pipeline run.
2. WHEN the RAG_Engine contributes to a run, THE Agent_Activity_View SHALL display retrieved market or review data attributed to the Researcher agent.
3. WHEN the Agentic orchestration runs, THE Agent_Activity_View SHALL display coordinated activity across all 5 agents of the Agent_Swarm.
4. THE Demo_Frontend SHALL display the Diffusion and LLM pillars through the rendered Creative_Asset.
5. THE Demo_Frontend SHALL label each tech pillar with its Execution_Mode in accordance with Requirement 11.
