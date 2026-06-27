import { generatedTypesPath, writeOpenApiTypes } from "./openapi-types.mjs";

await writeOpenApiTypes();
console.log(`Generated API types at ${generatedTypesPath}`);
