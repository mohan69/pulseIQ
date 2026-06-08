# PulseIQ AI Providers

PulseIQ Assessment Workbench keeps deterministic mock AI as the default so demo
and golden tests stay stable. Real providers plug into the workbench AI engine
behind `src/lib/ai/index.ts`.

## Provider Selection

Use `AI_PROVIDER` to select a provider:

```env
AI_PROVIDER=mock
```

Supported values:

- `mock`
- `openai`
- `openrouter`

If `AI_PROVIDER` is unset, PulseIQ chooses the first configured real provider
key, then falls back to `mock`. If no key is configured, `mock` is used.

## OpenRouter

OpenRouter uses an OpenAI-compatible chat completions endpoint. PulseIQ sends
requests to `/chat/completions` using the configured base URL.

```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=...
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
OPENROUTER_MODEL="openrouter/auto"
OPENROUTER_SITE_URL="https://your-site.example"
OPENROUTER_APP_NAME="PulseIQ"
```

`OPENROUTER_BASE_URL` defaults to `https://openrouter.ai/api/v1`.
`OPENROUTER_MODEL` defaults to `openrouter/auto`.

When present, PulseIQ sends these optional OpenRouter attribution headers:

- `HTTP-Referer`: `OPENROUTER_SITE_URL`
- `X-Title`: `OPENROUTER_APP_NAME`

OpenRouter documents its OpenAI-compatible base URL and optional attribution
headers in its quickstart/API docs:

- https://openrouter.ai/docs/quickstart
- https://openrouter.ai/docs/api-reference/overview

## Safety Behavior

All provider outputs are parsed and Zod-validated before reaching the workbench
domain layer. If a provider request fails or the output fails validation, the AI
engine returns a safe empty result for that operation instead of crashing the
app.

## Current Limitations

- The real document extraction pipeline is not wired yet.
- Mock mode remains the only mode used by default tests.
- OpenRouter requests are not exercised in tests; provider selection is tested
  without making live network calls.
