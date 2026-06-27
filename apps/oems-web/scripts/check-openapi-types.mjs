import { readGeneratedOpenApiTypes, renderOpenApiTypes } from "./openapi-types.mjs";

const normalizeLineEndings = (value) => value.replace(/\r\n/g, "\n");

const [expectedTypes, currentTypes] = await Promise.all([
  renderOpenApiTypes(),
  readGeneratedOpenApiTypes().catch(() => "")
]);

if (normalizeLineEndings(expectedTypes) !== normalizeLineEndings(currentTypes)) {
  console.error("Generated OpenAPI types are stale. Run `npm run api:generate` from apps/oems-web.");
  process.exit(1);
}

console.log("Generated OpenAPI types are current.");
