import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createAIEngine,
  resetAIEngine,
  resolveAIEngineConfig,
} from "@/lib/ai";

describe("AI provider selection", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetAIEngine();
  });

  it("defaults to mock without configured keys", () => {
    const config = resolveAIEngineConfig({});

    expect(config.provider).toBe("mock");
  });

  it("selects OpenRouter when explicitly configured with a key", () => {
    const config = resolveAIEngineConfig({
      AI_PROVIDER: "openrouter",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_SITE_URL: "https://pulseiq.example",
      OPENROUTER_APP_NAME: "PulseIQ Test",
    });

    expect(config).toMatchObject({
      provider: "openrouter",
      apiKey: "test-key",
      baseUrl: "https://openrouter.ai/api/v1",
      model: "openrouter/auto",
      siteUrl: "https://pulseiq.example",
      appName: "PulseIQ Test",
    });
  });

  it("falls back to mock when OpenRouter is requested without a key", () => {
    const config = resolveAIEngineConfig({
      AI_PROVIDER: "openrouter",
    });

    expect(config.provider).toBe("mock");
  });

  it("creates an OpenRouter engine without calling the live API", () => {
    vi.stubEnv("AI_PROVIDER", "openrouter");
    vi.stubEnv("OPENROUTER_API_KEY", "test-key");
    vi.stubEnv("OPENROUTER_MODEL", "openai/gpt-4o-mini");

    const engine = createAIEngine();

    expect(engine.provider).toBe("openrouter");
  });

  it("keeps explicit mock mode even when real keys exist", () => {
    const config = resolveAIEngineConfig({
      AI_PROVIDER: "mock",
      OPENROUTER_API_KEY: "test-key",
      OPENAI_API_KEY: "test-openai-key",
    });

    expect(config.provider).toBe("mock");
  });
});
