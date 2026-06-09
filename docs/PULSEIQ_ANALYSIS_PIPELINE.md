# PulseIQ Analysis Pipeline

Stage 4 adds a controlled analysis pipeline behind the existing Workbench UI.
It converts extracted TXT/CSV source content and manual notes into business
facts, truth-map layers, cockpit metrics, what-if scenarios, recommendations,
and the derived report.

## Modes

### Mock mode

`AI_PROVIDER=mock` remains the default. Mock mode does not call a live model.
It runs deterministic extraction and deterministic fallback builders so tests,
demos, and local development stay stable.

The Bharat Heavy Fabrications demo assessment is treated as golden data. Running
analysis on `asm-bharat-heavy-fabrications` does not rewrite its seeded facts or
outputs.

### OpenRouter mode

Set:

```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openrouter/auto
OPENROUTER_SITE_URL=https://your-site.example
OPENROUTER_APP_NAME=PulseIQ
```

OpenRouter is used only when `AI_PROVIDER=openrouter` and
`OPENROUTER_API_KEY` exists. Calls use the OpenAI-compatible chat completions
API with JSON response format plus optional `HTTP-Referer` and `X-Title`
headers.

OpenRouter requests use strict JSON Schema structured output, parameter-aware
routing, and response healing. PulseIQ also removes Markdown fences or
surrounding prose before parsing. Every section is Zod-validated before it can
be persisted.

## Zod Validation

Each model output has a strict Zod contract:

- source classification
- business fact extraction
- truth map
- cockpit metrics
- what-if scenarios
- recommendations
- report snapshot

Invalid JSON or schema-mismatched output is rejected. In production, a real
provider failure marks the assessment `analysis_failed` and shows a safe error.
Deterministic fallback is enabled by default only outside production, or when
`PULSEIQ_ALLOW_AI_FALLBACK=true` is explicitly configured.

When a section fails validation, PulseIQ logs only safe field diagnostics
(section, field path, expected type, and received type), then retries that
section once with the original business context and validation summary. A
second failure is visible to the user and is not stored as a final output.

Complex multi-item outputs are generated as independently validated items:

- five truth layers
- four cockpit metrics
- five what-if scenarios
- five ranked recommendations
- four implementation phases

This avoids losing a complete section when a provider returns an incomplete
aggregate array.

## Fallback Behavior

The pipeline:

1. Loads the assessment, sources, and extracted source documents.
2. Ignores sources still marked `extraction_pending` unless they have manual notes.
3. Extracts new business facts from `SourceDocument` text and skips duplicates.
4. Builds or updates truth map, cockpit, scenarios, recommendations, and plan.
5. Builds the report snapshot through the existing report composer.
6. Marks the assessment `analysis_ready` on success or `analysis_failed` on failure.

Provider requests default to a 20-second timeout. Override it with
`PULSEIQ_AI_REQUEST_TIMEOUT_MS` between 1,000 and 60,000 milliseconds. Source
fact extraction runs in parallel, followed by parallel output generation, to
keep the synchronous server action inside a practical deployment window.

## Current Limitations

- PPTX content is not analyzed until extraction is added.
- There is no background job runner yet; the server action runs synchronously.
- There is no auth or tenant enforcement yet.
- Deterministic extraction is intentionally simple and should not be treated as
  financial-grade parsing.
- OpenRouter output can improve synthesis quality, but every result still needs
  human review before customer use.
- A deployment hard timeout can interrupt any synchronous request. An
  interrupted legacy run without analysis-state metadata is shown as retryable.

## When To Trust Outputs

Use PulseIQ analysis as an internal operating draft. Trust is strongest when:

- source files are extracted, not pending
- facts show high-confidence evidence
- recommendations cite specific source excerpts
- the source set covers finance, strategy, operations, and process evidence

Do not treat outputs as final advice without human analyst review.
