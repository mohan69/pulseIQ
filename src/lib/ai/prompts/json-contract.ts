export function strictJsonContract(schemaExample: string): string {
  return `Output contract:
- Return exactly one JSON object and nothing else.
- Do not use Markdown, commentary, or code fences.
- Match the schema exactly. Do not add unknown fields.
- Use [] for missing collections, never null.
- Use "" for unavailable required text, never null.
- Omit unavailable optional numbers; never invent financial values.
- Confidence values must be "high", "medium", or "low".
- Clearly label public-domain inferences or unsupported statements as assumptions.

Exact JSON shape:
${schemaExample}`;
}
